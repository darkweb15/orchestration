"""Google Maps scraper using Playwright — rebuilt with proven techniques."""

import asyncio
import json
import re
import logging
from datetime import datetime
from urllib.parse import quote_plus

from playwright.async_api import async_playwright, Page

from app.config import SCROLL_PAUSE_TIME, MAX_SCROLLS, GOOGLE_MAPS_INITIAL_WAIT, PLACE_PAGE_WAIT, SCROLL_WAIT, CONTENT_LOAD_WAIT, get_wait_times
from app.models import LeadResult

logger = logging.getLogger(__name__)


async def _extract_place_data(page: Page, search_query: str, zipcode: str,
                               city: str, state: str, country: str, wait_times: dict) -> LeadResult:
    """
    Extract data from a Google Maps place detail page.
    Uses the proven approach: wait for h1.DUwDvf, then extract via JS evaluate.
    """
    lead = LeadResult(
        date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        search_query=search_query,
        zipcode=zipcode,
        city=city,
        state=state,
        country=country,
    )

    try:
        # KEY: Wait for the place name heading — this ensures all detail data is loaded
        try:
            await page.wait_for_selector('h1.DUwDvf, h1.lfPIob', timeout=12000)
        except Exception:
            logger.warning("Timeout waiting for place name heading")
            return lead

        # Wait longer for all content to load properly
        await asyncio.sleep(wait_times["place_page"])
        
        # Scroll to load all sections
        try:
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight / 2)')
            await asyncio.sleep(wait_times["scroll"])
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await asyncio.sleep(wait_times["content_load"])
        except Exception:
            pass

        # Extract all data in one JavaScript call
        data = await page.evaluate("""() => {
            const result = {};

            // Name
            const h1 = document.querySelector('h1.DUwDvf') || document.querySelector('h1.lfPIob');
            if (h1) result.name = h1.textContent.trim();

            // Rating + Reviews from div.F7nice
            const ratingEl = document.querySelector('div.F7nice');
            if (ratingEl) {
                const txt = ratingEl.textContent.trim();
                // Pattern: "4.8(290)" or "4.8 ***** 1,864 Google reviews"
                const ratingMatch = txt.match(/(\\d[.,]\\d+)/);
                if (ratingMatch) result.rating = ratingMatch[1];

                if (txt.includes('(')) {
                    const inner = txt.split('(')[1]?.split(')')[0] || '';
                    const clean = inner.replace(/[^\\d]/g, '');
                    if (clean) result.reviews_count = clean;
                } else {
                    const countMatch = txt.match(/([\\d,]+)\\s*(?:Google\\s*)?reviews?/i);
                    if (countMatch) result.reviews_count = countMatch[1].replace(/,/g, '');
                }
            }

            // Try JSON-LD for stable review count
            try {
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                for (const script of scripts) {
                    const data = JSON.parse(script.textContent);
                    const items = Array.isArray(data) ? data : [data];
                    for (const item of items) {
                        if (item?.aggregateRating?.reviewCount) {
                            result.reviews_count = String(item.aggregateRating.reviewCount).replace(/[^\\d]/g, '');
                        }
                        if (item?.aggregateRating?.ratingValue && !result.rating) {
                            result.rating = String(item.aggregateRating.ratingValue);
                        }
                    }
                }
            } catch(e) {}

            // Category
            const cat = document.querySelector('button[jsaction*="category"]');
            if (cat) result.category = cat.textContent.trim();

            // Price range
            const price = document.querySelector('[aria-label^="Price:"]');
            if (price) {
                const label = price.getAttribute('aria-label') || '';
                result.price_range = label.replace('Price:', '').trim();
            }

            // Data items: address, phone, website, hours
            // Website: get href from <a> tag (not text!) — this is the key fix
            const authorityEl = document.querySelector('a[data-item-id="authority"]');
            if (authorityEl) {
                result.website = authorityEl.href || authorityEl.textContent.trim();
            }

            const addressEl = document.querySelector('button[data-item-id="address"]');
            if (addressEl) result.address = addressEl.textContent.replace(/[\\ue000-\\uf8ff]/g, '').trim();

            const phoneEl = document.querySelector('button[data-item-id^="phone"]');
            if (phoneEl) result.phone = phoneEl.textContent.replace(/[\\ue000-\\uf8ff]/g, '').trim();

            // Opening hours
            const hoursEl = document.querySelector('[data-item-id="oh"]');
            if (hoursEl) result.opening_hours = hoursEl.textContent.replace(/[\\ue000-\\uf8ff]/g, '').replace(/\\n/g, ' | ').trim();

            // Closure status
            result.status = 'Open';
            result.closure_status = 'Open';
            const bodyText = document.body.innerHTML;
            if (/\\bPermanently closed\\b/i.test(bodyText)) {
                result.status = 'Closed';
                result.closure_status = 'Permanently Closed';
            } else if (/\\bTemporar(?:il)?y closed\\b/i.test(bodyText)) {
                result.status = 'Temporarily Closed';
                result.closure_status = 'Temporarily Closed';
            }

            // Place ID from URL
            const placeIdMatch = window.location.href.match(/ChIJ[a-zA-Z0-9_-]+/);
            if (placeIdMatch) result.place_id = placeIdMatch[0];

            // Extract emails from page
            const emailRegex = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
            const emails = (bodyText.match(emailRegex) || []).filter(
                e => !['google','gstatic','gmail','youtube','android','schema.org','w3.org'].some(
                    x => e.toLowerCase().includes(x)
                )
            );
            if (emails.length > 0) result.google_maps_email = emails[0];

            return result;
        }""")

        # Map extracted data to lead
        lead.name = data.get("name", "")
        lead.address = data.get("address", "")
        lead.phone = data.get("phone", "")
        lead.website = data.get("website", "")
        lead.rating = data.get("rating", "")
        lead.reviews_count = data.get("reviews_count", "")
        lead.category = data.get("category", "")
        lead.cuisine_types = data.get("category", "")
        lead.price_range = data.get("price_range", "")
        lead.opening_hours = data.get("opening_hours", "")
        lead.status = data.get("status", "Open")
        lead.closure_status = data.get("closure_status", "Open")
        lead.google_maps_email = data.get("google_maps_email", "")
        lead.place_id = data.get("place_id", "")
        lead.maps_url = page.url
        
        # Note: Social links (Facebook, Instagram, etc.) are NOT available on Google Maps
        # They will be extracted from the business website by email_extractor

        logger.info(f"Extracted: {lead.name} | web={lead.website} | phone={lead.phone}")

    except Exception as e:
        logger.error(f"Error extracting place data: {e}")

    return lead


async def collect_links(page: Page, feed_selector: str, max_results: int) -> list[dict]:
    """Scroll and collect Google Maps place links with place IDs from the feed."""
    places = {}  # {place_id: url}
    max_scrolls = min(MAX_SCROLLS, 8)

    for scroll_i in range(max_scrolls):
        # Collect links from visible cards
        cards = await page.query_selector_all('a.hfpxzc')
        if not cards:
            cards = await page.query_selector_all('a[href*="/maps/place/"]')

        for card in cards:
            href = await card.get_attribute("href")
            if href and "/maps/place/" in href:
                # Extract place_id from URL (ChIJ...)
                place_id_match = re.search(r'(ChIJ[a-zA-Z0-9_-]+)', href)
                if place_id_match:
                    place_id = place_id_match.group(1)
                    places[place_id] = href

        if len(places) >= max_results:
            break

        # Scroll the feed
        try:
            feed = await page.query_selector(feed_selector)
            if feed:
                await feed.evaluate('el => el.scrollBy(0, 2000)')
        except Exception:
            break

        await asyncio.sleep(SCROLL_PAUSE_TIME)

    # Return list of {place_id, url}
    result = [{"place_id": pid, "url": url} for pid, url in places.items()][:max_results]
    return result


async def scrape_google_maps(
    search_term: str,
    location: str,
    zipcode: str = "",
    city: str = "",
    state: str = "",
    country: str = "",
    max_results: int = 20,
    progress_callback=None,
    job_id: str = "",
    scraping_speed: str = "balanced",
) -> list[LeadResult]:
    """
    Scrape Google Maps for businesses.
    Phase 1: Collect place IDs by scrolling the search results feed.
    Phase 2: Check which place IDs already exist in database.
    Phase 3: Only scrape NEW places to save time.
    """
    results = []
    query = f"{search_term} {location}".strip()
    encoded_query = quote_plus(query)
    search_url = f"https://www.google.com/maps/search/{encoded_query}"
    
    # Get wait times based on speed preference
    wait_times = get_wait_times(scraping_speed)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-blink-features=AutomationControlled",
            ],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()

        try:
            # Phase 1: Collect links
            logger.info(f"Searching: {query} (speed: {scraping_speed})")
            await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(wait_times["google_maps_initial"])  # Use dynamic wait time

            # Accept cookies if prompted
            try:
                accept_btn = await page.query_selector('button[aria-label*="Accept"]')
                if accept_btn:
                    await accept_btn.click()
                    await asyncio.sleep(1)
            except Exception:
                pass

            # Wait for feed
            feed_selector = '[role="feed"]'
            try:
                await page.wait_for_selector(feed_selector, timeout=10000)
            except Exception:
                feed_selector = 'div[role="main"]'
                try:
                    await page.wait_for_selector(feed_selector, timeout=5000)
                except Exception:
                    logger.error(f"No results feed found for '{query}'")
                    await browser.close()
                    return results

            place_data = await collect_links(page, feed_selector, max_results)
            total = len(place_data)
            logger.info(f"Collected {total} place IDs for '{query}'")

            # Phase 2: Check which place IDs already exist in database
            from app.database import get_existing_place_ids
            
            place_ids = [p["place_id"] for p in place_data if p.get("place_id")]
            existing_ids = await get_existing_place_ids(place_ids)
            
            # Filter out existing places
            new_places = [p for p in place_data if p.get("place_id") not in existing_ids]
            skipped_count = len(place_data) - len(new_places)
            
            if skipped_count > 0:
                logger.info(f"⚡ Skipping {skipped_count} places already in database (saving time!)")
            logger.info(f"📍 Scraping {len(new_places)} NEW places")

            # Phase 3: Visit each NEW place and extract details
            scraped_names = set()
            for i, place_info in enumerate(new_places):
                try:
                    await page.goto(place_info["url"], wait_until="domcontentloaded", timeout=wait_times["timeout"] * 1000)

                    lead = await _extract_place_data(
                        page, search_term, zipcode, city, state, country, wait_times
                    )

                    # Dedup by name
                    if lead.name and lead.name not in scraped_names:
                        scraped_names.add(lead.name)
                        results.append(lead)

                    if progress_callback:
                        await progress_callback(i + 1, len(new_places))

                except Exception as e:
                    logger.error(f"Error scraping place {i}: {e}")

            logger.info(f"Scraped {len(results)} unique NEW places for '{query}' (skipped {skipped_count} existing)")

        except Exception as e:
            logger.error(f"Error during Google Maps scraping: {e}")
        finally:
            await browser.close()

    return results
