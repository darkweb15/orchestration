"""Orchestrator for running scrape jobs with parallel processing."""

import asyncio
import logging
import re
import time
import uuid
from datetime import datetime, timezone

from app.models import ScrapeRequest, ScrapeJob, LeadResult
from app.scraper.google_maps import scrape_google_maps
from app.scraper.email_extractor import extract_all_emails, build_email_result
from app.scraper.pos_detector import detect_pos_system
from app.config import MAX_CONCURRENT_BROWSERS
from app import database as db

logger = logging.getLogger(__name__)

US_COUNTRY = "USA"
US_COUNTRY_ALIASES = {
    "us",
    "u.s.",
    "usa",
    "u.s.a.",
    "united states",
    "unitedstates",
    "united-states",
}
US_STATE_ALIASES = {
    "al": "AL", "alabama": "AL",
    "ak": "AK", "alaska": "AK",
    "az": "AZ", "arizona": "AZ",
    "ar": "AR", "arkansas": "AR",
    "ca": "CA", "california": "CA",
    "co": "CO", "colorado": "CO",
    "ct": "CT", "connecticut": "CT",
    "de": "DE", "delaware": "DE",
    "fl": "FL", "florida": "FL",
    "ga": "GA", "georgia": "GA",
    "hi": "HI", "hawaii": "HI",
    "id": "ID", "idaho": "ID",
    "il": "IL", "illinois": "IL",
    "in": "IN", "indiana": "IN",
    "ia": "IA", "iowa": "IA",
    "ks": "KS", "kansas": "KS",
    "ky": "KY", "kentucky": "KY",
    "la": "LA", "louisiana": "LA",
    "me": "ME", "maine": "ME",
    "md": "MD", "maryland": "MD",
    "ma": "MA", "massachusetts": "MA",
    "mi": "MI", "michigan": "MI",
    "mn": "MN", "minnesota": "MN",
    "ms": "MS", "mississippi": "MS",
    "mo": "MO", "missouri": "MO",
    "mt": "MT", "montana": "MT",
    "ne": "NE", "nebraska": "NE",
    "nv": "NV", "nevada": "NV",
    "nh": "NH", "new hampshire": "NH",
    "nj": "NJ", "new jersey": "NJ",
    "nm": "NM", "new mexico": "NM",
    "ny": "NY", "new york": "NY",
    "nc": "NC", "north carolina": "NC",
    "nd": "ND", "north dakota": "ND",
    "oh": "OH", "ohio": "OH",
    "ok": "OK", "oklahoma": "OK",
    "or": "OR", "oregon": "OR",
    "pa": "PA", "pennsylvania": "PA",
    "ri": "RI", "rhode island": "RI",
    "sc": "SC", "south carolina": "SC",
    "sd": "SD", "south dakota": "SD",
    "tn": "TN", "tennessee": "TN",
    "tx": "TX", "texas": "TX",
    "ut": "UT", "utah": "UT",
    "vt": "VT", "vermont": "VT",
    "va": "VA", "virginia": "VA",
    "wa": "WA", "washington": "WA",
    "wv": "WV", "west virginia": "WV",
    "wi": "WI", "wisconsin": "WI",
    "wy": "WY", "wyoming": "WY",
    "dc": "DC", "district of columbia": "DC",
}
US_ZIP_REGEX = re.compile(r"^\d{5}(?:-\d{4})?$")

# In-memory job storage (for real-time progress tracking)
_jobs: dict[str, ScrapeJob] = {}
_max_jobs_in_memory = 50  # Keep last 50 jobs in memory


def get_job(job_id: str) -> ScrapeJob | None:
    """Get a job by ID."""
    return _jobs.get(job_id)


def get_all_jobs() -> list[ScrapeJob]:
    """Get all jobs."""
    return list(_jobs.values())


async def _enrich_lead(lead: LeadResult) -> LeadResult:
    """Enrich a lead with email extraction and POS detection."""
    try:
        # Extract emails from all sources in parallel
        email_result = await extract_all_emails(
            website_url=lead.website,
            facebook_url=lead.facebook_link,
            instagram_url=lead.instagram_link,
            google_maps_email=lead.google_maps_email,
            store_name=lead.name,
        )

        # Update lead with email data
        lead.website_email = email_result.get("website_email", "")
        lead.all_website_emails = email_result.get("all_website_emails", "")
        lead.facebook_email = email_result.get("facebook_email", "")
        lead.instagram_email = email_result.get("instagram_email", "")
        lead.final_email = email_result.get("final_email", "")
        lead.comparing_emails = email_result.get("comparing_emails", "")
        lead.email_source = email_result.get("email_source", "")

        # Update social links if found on website
        social = email_result.get("social_links", {})
        if social.get("facebook") and not lead.facebook_link:
            lead.facebook_link = social["facebook"]
        if social.get("instagram") and not lead.instagram_link:
            lead.instagram_link = social["instagram"]
        if social.get("twitter") and not lead.twitter_link:
            lead.twitter_link = social["twitter"]
        if social.get("linkedin") and not lead.linkedin_link:
            lead.linkedin_link = social["linkedin"]

        # If we found Facebook/Instagram from website after the initial pass, retry and then
        # recompute the best final email so Facebook can correctly take priority.
        if social.get("facebook") and not lead.facebook_email:
            from app.scraper.email_extractor import extract_facebook_email
            fb_emails = await extract_facebook_email(social["facebook"])
            if fb_emails:
                lead.facebook_email = ", ".join(fb_emails)
        if social.get("instagram") and not lead.instagram_email:
            from app.scraper.email_extractor import extract_instagram_email
            ig_emails = await extract_instagram_email(social["instagram"])
            if ig_emails:
                lead.instagram_email = ", ".join(ig_emails)

        recomputed_emails = build_email_result(
            website_emails=lead.all_website_emails,
            facebook_emails=lead.facebook_email,
            instagram_emails=lead.instagram_email,
            google_maps_email=lead.google_maps_email,
            store_name=lead.name,
            website_url=lead.website,
        )
        lead.website_email = recomputed_emails.get("website_email", lead.website_email)
        lead.all_website_emails = recomputed_emails.get("all_website_emails", lead.all_website_emails)
        lead.facebook_email = recomputed_emails.get("facebook_email", lead.facebook_email)
        lead.instagram_email = recomputed_emails.get("instagram_email", lead.instagram_email)
        lead.final_email = recomputed_emails.get("final_email", lead.final_email)
        lead.comparing_emails = recomputed_emails.get("comparing_emails", lead.comparing_emails)
        lead.email_source = recomputed_emails.get("email_source", lead.email_source)

        # Detect POS system, delivery services, website type, storefront
        pos_result = await detect_pos_system(lead.website)
        lead.has_pos = "Yes" if pos_result["has_pos"] else "No"
        lead.pos_system = pos_result["pos_system"]
        lead.pos_details = pos_result["pos_details"]
        lead.delivery_services = pos_result.get("delivery_services", "")
        lead.website_type = pos_result.get("website_type", "Unknown")
        lead.storefront = pos_result.get("storefront", "No")

    except Exception as e:
        logger.error(f"Error enriching lead {lead.name}: {e}")

    return lead


def _clean_location_token(token: str) -> str:
    """Normalize punctuation/casing while preserving user-readable output elsewhere."""
    return token.strip().replace(".", "").casefold()


def _extract_us_state(tokens: list[str]) -> tuple[str, list[str]]:
    """Return the normalized US state abbreviation and the remaining city tokens."""
    for state_length in (3, 2, 1):
        if len(tokens) < state_length:
            continue
        candidate_tokens = tokens[-state_length:]
        candidate_key = " ".join(_clean_location_token(token) for token in candidate_tokens)
        state = US_STATE_ALIASES.get(candidate_key)
        if state:
            return state, tokens[:-state_length]

    raise ValueError(
        "US locations must end with a valid US state or DC. "
        "Use formats like '10001 New York NY' or '10001 New York NY USA'."
    )


def parse_us_location_line(zip_line: str) -> dict:
    """Validate and normalize a US-only target line."""
    parts = [part.strip() for part in zip_line.strip().split() if part.strip()]
    if not parts:
        raise ValueError("Location lines cannot be empty.")

    zipcode = parts[0]
    if not US_ZIP_REGEX.fullmatch(zipcode):
        raise ValueError(
            f"'{zipcode}' is not a valid US ZIP code. Use a 5-digit ZIP or ZIP+4."
        )

    remaining = parts[1:]
    if len(remaining) >= 2:
        country_key = " ".join(_clean_location_token(token) for token in remaining[-2:])
        if country_key in US_COUNTRY_ALIASES:
            remaining = remaining[:-2]
    if remaining:
        country_key = _clean_location_token(remaining[-1])
        if country_key in US_COUNTRY_ALIASES:
            remaining = remaining[:-1]

    city = ""
    state = ""
    if remaining:
        state, city_tokens = _extract_us_state(remaining)
        city = " ".join(city_tokens).strip()

    location_parts = [zipcode]
    if city:
        location_parts.append(city)
    if state:
        location_parts.append(state)
    location_parts.append(US_COUNTRY)

    return {
        "zipcode": zipcode,
        "city": city,
        "state": state,
        "country": US_COUNTRY,
        "location": " ".join(location_parts),
    }


def _parse_zip_code(zip_line: str) -> dict:
    """Parse a validated US zip line — alias for parse_us_location_line."""
    return parse_us_location_line(zip_line)


async def run_scrape_job(request: ScrapeRequest) -> str:
    """
    Start a scraping job. Returns the job ID.
    The job runs in the background.
    """
    job_id = str(uuid.uuid4())[:8]
    job = ScrapeJob(
        job_id=job_id,
        status="running",
        total=len(request.search_terms) * len(request.zip_codes),
        started_at=datetime.now(timezone.utc),
    )
    _jobs[job_id] = job
    
    # Clean up old jobs if too many in memory
    if len(_jobs) > _max_jobs_in_memory:
        # Remove oldest completed/failed jobs
        completed_jobs = [(jid, j) for jid, j in _jobs.items() 
                         if j.status in ('completed', 'failed')]
        if completed_jobs:
            # Sort by started_at and remove oldest
            completed_jobs.sort(key=lambda x: x[1].started_at or datetime.min)
            for jid, _ in completed_jobs[:10]:  # Remove 10 oldest
                del _jobs[jid]
                logger.info(f"Removed old job {jid} from memory")

    # Save task to Supabase
    search_terms_str = ", ".join(request.search_terms)
    zip_codes_str = ", ".join(request.zip_codes)
    await db.create_task(
        job_id=job_id,
        search_term=search_terms_str,
        zip_codes=zip_codes_str,
        industry=request.search_terms[0] if request.search_terms else "",
    )

    # Run the job in background
    asyncio.create_task(_execute_job(job, request))
    return job_id


async def _execute_job(job: ScrapeJob, request: ScrapeRequest):
    """Execute the scraping job."""
    try:
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_BROWSERS)
        seen_identity_keys: set[str] = set()
        seen_lock = asyncio.Lock()
        job_lock = asyncio.Lock()

        async def _scrape_combination(search_term: str, zip_line: str):
            combo_start = time.time()
            combo_label = f"{search_term} @ {zip_line}"

            try:
                async with semaphore:
                    zip_data = _parse_zip_code(zip_line)

                    async def progress_cb(current, total):
                        pass  # Progress tracked at job level

                    leads = await scrape_google_maps(
                        search_term=search_term,
                        location=zip_data["location"],
                        zipcode=zip_data["zipcode"],
                        city=zip_data["city"],
                        state=zip_data["state"],
                        country=zip_data["country"],
                        max_results=request.max_results_per_search,
                        progress_callback=progress_cb,
                        job_id=job.job_id,
                        scraping_speed=request.scraping_speed,  # Pass speed setting
                    )

                    # Check for duplicates against DB and in-flight job results before enriching.
                    new_leads = []
                    skipped = 0
                    for lead in leads:
                        if not lead.name:
                            continue

                        identity_key = db.lead_identity_key(
                            place_id=lead.place_id,
                            name=lead.name,
                            address=lead.address,
                        )

                        if identity_key:
                            async with seen_lock:
                                if identity_key in seen_identity_keys:
                                    skipped += 1
                                    continue

                        is_dup = await db.is_duplicate(lead.name, lead.address, lead.place_id)
                        if is_dup:
                            logger.info(f"  SKIP (duplicate): {lead.name}")
                            skipped += 1
                            continue

                        if identity_key:
                            async with seen_lock:
                                if identity_key in seen_identity_keys:
                                    skipped += 1
                                    continue
                                seen_identity_keys.add(identity_key)

                        new_leads.append(lead)

                    async with job_lock:
                        job.duplicates_skipped += skipped

                    logger.info(
                        f"New leads: {len(new_leads)} / {len(leads)} "
                        f"(skipped {skipped} duplicates)"
                    )

                    # Enrich each NEW lead with emails and POS detection
                    enriched_leads = []
                    enrich_tasks = [_enrich_lead(lead) for lead in new_leads]
                    enriched = await asyncio.gather(*enrich_tasks, return_exceptions=True)
                    for result in enriched:
                        if isinstance(result, LeadResult):
                            enriched_leads.append(result)
                        elif isinstance(result, Exception):
                            logger.error("Lead enrichment error for %s: %s", combo_label, result)
                            async with job_lock:
                                job.errors.append(f"{combo_label}: enrichment error: {result}")

                    # Save to Supabase
                    saved = await db.save_leads_batch(enriched_leads, job.job_id)
                    logger.info(f"Saved {saved} leads to database for job {job.job_id}")

                    async with job_lock:
                        job.results.extend(enriched_leads)

            except Exception as e:
                logger.exception("Combination scrape failed for %s", combo_label)
                async with job_lock:
                    job.errors.append(f"{combo_label}: {e}")
            finally:
                combo_elapsed = time.time() - combo_start

                async with job_lock:
                    job.completed += 1
                    job.leads_per_combination.append(combo_elapsed)
                    current_results = len(job.results)

                # Update task progress in DB even when a combination fails.
                await db.update_task_status(
                    job.job_id,
                    "Running",
                    scraped_count=current_results,
                    total_results=current_results,
                )

        # Create tasks for all combinations
        tasks = []
        for search_term in request.search_terms:
            for zip_code in request.zip_codes:
                if search_term.strip() and zip_code.strip():
                    tasks.append(_scrape_combination(search_term.strip(), zip_code.strip()))

        job.total = len(tasks)

        if tasks:
            await asyncio.gather(*tasks)

        final_status = "Completed" if not job.errors else "Completed with Errors"
        job.status = "completed" if not job.errors else "completed_with_errors"
        await db.update_task_status(
            job.job_id, final_status,
            scraped_count=len(job.results),
            total_results=len(job.results),
        )
        logger.info(
            "Job %s finished with status %s. Found %s leads.",
            job.job_id,
            job.status,
            len(job.results),
        )

    except Exception as e:
        job.status = "failed"
        job.errors.append(str(e))
        await db.update_task_status(job.job_id, "Failed")
        logger.error(f"Job {job.job_id} failed: {e}")
