"""Deep email extraction from websites, Facebook, Instagram — rebuilt with proven techniques."""

import asyncio
import html
import re
import logging
from urllib.parse import parse_qs, unquote, urljoin, urlparse

import aiohttp
from bs4 import BeautifulSoup

from app.config import REQUEST_TIMEOUT, MAX_CONCURRENT_REQUESTS
from app.utils import create_ssl_context

logger = logging.getLogger(__name__)

EMAIL_REGEX = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
)

# Invalid extensions that appear in false-positive emails
INVALID_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf',
    '.css', '.js', '.ico', '.txt', '.xml', '.woff', '.ttf',
]

# Domains to exclude from email results
INVALID_DOMAINS = [
    'sentry.io', 'example.com', 'test.com', 'localhost', 'w3.org',
    'schema.org', 'google.com', 'gstatic.com', 'facebook.com', 'fb.com',
    'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com',
    'maps.google.com', 'purl.org', 'googletagmanager.com', 'googleapis.com',
    'cloudflare.com', 'jquery.com', 'wordpress.org', 'gravatar.com',
    'wixpress.com', 'android.com', 'apple.com', 'microsoft.com',
]

# Keywords that indicate junk/system emails
INVALID_KEYWORDS = [
    'noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster',
    'webmaster', 'abuse', 'spam', 'privacy', 'domain.com', 'email.com',
    'support@example', 'info@example', 'contact@example',
]

# Contact page keywords to look for
CONTACT_PAGE_KEYWORDS = [
    "contact", "about", "about-us", "contact-us", "get-in-touch",
    "reach-us", "info", "support", "help",
]


def _decode_escape_sequences(text: str) -> str:
    """Decode common escaped forms used in JSON blobs and tracker links."""
    if not text:
        return ""

    def replace_unicode(match: re.Match) -> str:
        codepoint = match.group(1) or match.group(2)
        try:
            return chr(int(codepoint, 16))
        except (TypeError, ValueError):
            return match.group(0)

    text = re.sub(r'\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})', replace_unicode, text)
    text = html.unescape(text)

    try:
        text = unquote(text)
    except Exception:
        pass

    return text


def _normalize_email_text(raw_text: str) -> str:
    """Normalize obfuscated and escaped email text before regex extraction."""
    if not raw_text:
        return ""

    normalized = _decode_escape_sequences(raw_text).lower()
    normalized = normalized.replace('[at]', '@').replace('(at)', '@')
    normalized = normalized.replace('[dot]', '.').replace('(dot)', '.')
    normalized = normalized.replace(' at ', '@').replace(' dot ', '.')
    normalized = re.sub(r'[\u200b-\u200d\u2060\ufeff]', '', normalized)
    return normalized


def find_emails(html: str) -> list[str]:
    """
    Advanced email extraction with obfuscation handling.
    Handles [at], (at), HTML entities, and other common obfuscation patterns.
    """
    if not html:
        return []

    # Normalize obfuscated patterns
    html_lower = _normalize_email_text(html)

    # Extract emails using regex
    emails = EMAIL_REGEX.findall(html_lower)

    # Handle HTML entity obfuscation (e.g., &#105;&#110;&#102;&#111;)
    html_entities = re.findall(r'&#(\d+);', html)
    if html_entities:
        try:
            decoded = "".join([chr(int(e)) for e in html_entities])
            emails.extend(EMAIL_REGEX.findall(decoded))
        except (ValueError, OverflowError):
            pass

    # Also check mailto links in original HTML
    mailto_matches = re.findall(r'mailto:([^"\'?\s<>]+)', _decode_escape_sequences(html), re.IGNORECASE)
    for m in mailto_matches:
        email = unquote(m.split('?')[0].strip()).lower()
        if EMAIL_REGEX.match(email.lower()):
            emails.append(email.lower())

    # Filter and validate
    valid_emails = []
    seen = set()
    for e in emails:
        e = e.strip().lower().rstrip('.')
        if e in seen:
            continue
        if e.count('@') != 1:
            continue
        if any(ext in e for ext in INVALID_EXTENSIONS):
            continue

        try:
            local, domain = e.split('@')
            if len(local) < 2 or len(domain) < 4:
                continue
            if any(kw in local for kw in INVALID_KEYWORDS):
                continue
            if any(d in domain for d in INVALID_DOMAINS):
                continue
            if '.' not in domain:
                continue
            seen.add(e)
            valid_emails.append(e)
        except Exception:
            continue

    return sorted(set(valid_emails))


FACEBOOK_RESERVED_SEGMENTS = {
    "tr", "plugins", "dialog", "share", "share.php", "sharer", "sharer.php",
    "login", "recover", "privacy", "policy", "policies", "terms", "legal",
    "help", "business", "ads", "watch", "reel", "reels", "stories",
    "events", "hashtag", "photo", "photos", "notes", "messages",
    "notifications", "marketplace", "gaming", "fundraisers", "pg",
}

INSTAGRAM_RESERVED_SEGMENTS = {
    "accounts", "about", "developer", "directory", "explore", "p", "reel",
    "reels", "stories", "tv", "direct", "challenge",
}

TWITTER_RESERVED_SEGMENTS = {
    "home", "share", "intent", "search", "hashtag", "i", "settings",
    "privacy", "tos", "explore",
}

LINKEDIN_RESERVED_SEGMENTS = {
    "feed", "jobs", "learning", "help", "legal", "authwall", "checkpoint",
}


def _normalize_social_url(raw_url: str, network: str) -> str:
    """Normalize a social URL and filter out tracker/share/system URLs."""
    if not raw_url:
        return ""

    parsed = urlparse(html.unescape(raw_url.strip()))
    if not parsed.scheme or not parsed.netloc:
        return ""

    netloc = parsed.netloc.lower()
    path = parsed.path.strip("/")
    query = parse_qs(parsed.query)

    if network == "facebook":
        if "facebook.com" not in netloc and "fb.com" not in netloc:
            return ""

        if parsed.path == "/l.php" and query.get("u"):
            return _normalize_social_url(unquote(query["u"][0]), network)

        if not path:
            return ""
        if path.lower().endswith("fbml"):
            return ""
        if path.lower() == "profile.php":
            profile_id = query.get("id", [""])[0].strip()
            return (
                f"https://www.facebook.com/profile.php?id={profile_id}"
                if profile_id
                else ""
            )

        first = path.split("/", 1)[0].lower()
        if first in FACEBOOK_RESERVED_SEGMENTS or first == "2008":
            return ""
        return f"https://www.facebook.com/{path}"

    if network == "instagram":
        if "instagram.com" not in netloc:
            return ""
        if not path:
            return ""
        first = path.split("/", 1)[0].lower()
        if first in INSTAGRAM_RESERVED_SEGMENTS:
            return ""
        return f"https://www.instagram.com/{path}"

    if network == "twitter":
        if "twitter.com" not in netloc and netloc != "x.com" and not netloc.endswith(".x.com"):
            return ""
        if not path:
            return ""
        first = path.split("/", 1)[0].lower()
        if first in TWITTER_RESERVED_SEGMENTS:
            return ""
        return f"https://twitter.com/{path}"

    if network == "linkedin":
        if "linkedin.com" not in netloc:
            return ""
        if not path:
            return ""
        first = path.split("/", 1)[0].lower()
        if first in LINKEDIN_RESERVED_SEGMENTS:
            return ""
        return f"https://www.linkedin.com/{path}"

    return ""


def _extract_social_links(html: str, base_url: str = "") -> dict[str, str]:
    """Extract social media links while skipping trackers and platform boilerplate."""
    socials = {"facebook": "", "instagram": "", "twitter": "", "linkedin": ""}
    if not html:
        return socials

    soup = BeautifulSoup(html, "lxml")

    # Prefer real links from href attributes first.
    for tag in soup.find_all("a", href=True):
        href = urljoin(base_url, tag["href"])
        for network in socials:
            if socials[network]:
                continue
            normalized = _normalize_social_url(href, network)
            if normalized:
                socials[network] = normalized

    # Fallback: scan the HTML for absolute URLs embedded in scripts/JSON blobs.
    patterns = {
        "facebook": r'https?://[^\s"\'<>]+facebook\.com/[^\s"\'<>]+',
        "instagram": r'https?://[^\s"\'<>]+instagram\.com/[^\s"\'<>]+',
        "twitter": r'https?://[^\s"\'<>]+(?:twitter\.com|x\.com)/[^\s"\'<>]+',
        "linkedin": r'https?://[^\s"\'<>]+linkedin\.com/[^\s"\'<>]+',
    }
    for network, pattern in patterns.items():
        if socials[network]:
            continue
        for match in re.finditer(pattern, html, re.IGNORECASE):
            normalized = _normalize_social_url(match.group(0), network)
            if normalized:
                socials[network] = normalized
                break

    return socials


def build_email_result(
    website_emails,
    facebook_emails,
    instagram_emails,
    google_maps_email: str = "",
    store_name: str = "",
    website_url: str = "",
    social_links: dict[str, str] | None = None,
) -> dict:
    """Build the canonical email result payload from all discovered sources."""
    website_emails = find_emails(" ".join(website_emails) if isinstance(website_emails, list) else str(website_emails or ""))
    fb_emails = find_emails(" ".join(facebook_emails) if isinstance(facebook_emails, list) else str(facebook_emails or ""))
    ig_emails = find_emails(" ".join(instagram_emails) if isinstance(instagram_emails, list) else str(instagram_emails or ""))

    all_emails = set()
    if google_maps_email:
        all_emails.update(find_emails(google_maps_email))
    all_emails.update(website_emails)
    all_emails.update(fb_emails)
    all_emails.update(ig_emails)
    all_emails_list = sorted(all_emails)

    final_email = ""
    source = ""

    if fb_emails:
        final_email = fb_emails[0]
        source = "Facebook"
    elif website_emails and store_name:
        matched = _match_store_name_email(website_emails, store_name, website_url)
        if matched:
            final_email = matched
            source = "Website (store match)"
        else:
            final_email = get_domain_matched_email(website_emails, website_url)
            source = "Website"
    elif website_emails:
        final_email = get_domain_matched_email(website_emails, website_url)
        source = "Website"
    elif google_maps_email:
        final_email = google_maps_email
        source = "Google Maps"
    elif ig_emails:
        final_email = ig_emails[0]
        source = "Instagram"

    return {
        "website_email": website_emails[0] if website_emails else "",
        "all_website_emails": ", ".join(website_emails),
        "facebook_email": ", ".join(fb_emails) if fb_emails else "",
        "instagram_email": ", ".join(ig_emails) if ig_emails else "",
        "final_email": final_email,
        "comparing_emails": ", ".join(all_emails_list),
        "email_source": source,
        "social_links": social_links or {},
    }


async def _fetch_page(session: aiohttp.ClientSession, url: str) -> str:
    """Fetch a web page and return its HTML content."""
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        async with session.get(
            url, headers=headers, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT),
            ssl=create_ssl_context(), allow_redirects=True
        ) as response:
            if response.status == 200:
                return await response.text(errors="replace")
    except Exception as e:
        logger.debug(f"Failed to fetch {url}: {e}")
    return ""


def _find_contact_pages(html: str, base_url: str) -> list[str]:
    """Find links to contact/about pages on the website."""
    pages = []
    if not html:
        return pages

    soup = BeautifulSoup(html, "lxml")
    for link in soup.find_all("a", href=True):
        href = link["href"].strip()
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        text = link.get_text().strip().lower()
        href_lower = href.lower()

        is_contact_page = any(kw in href_lower for kw in CONTACT_PAGE_KEYWORDS) or \
                          any(kw in text for kw in CONTACT_PAGE_KEYWORDS)

        if is_contact_page:
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            base_parsed = urlparse(base_url)
            if parsed.netloc == base_parsed.netloc or not parsed.netloc:
                pages.append(full_url)

    return list(set(pages))[:5]


async def _playwright_scrape_website(url: str) -> tuple[list[str], dict[str, str]]:
    """
    Use Playwright to scrape emails from JS-rendered websites.
    Handles Shopify, React, Angular, and other SPA sites.
    Visits homepage + contact/about pages.
    """
    emails = []
    social_links = {"facebook": "", "instagram": "", "twitter": "", "linkedin": ""}

    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = await browser.new_page(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36"
                )
            )

            page.set_default_timeout(12000)

            # Visit homepage
            await page.goto(url, wait_until="domcontentloaded", timeout=18000)  # Increased timeout
            await asyncio.sleep(2.5)  # Increased wait for JS to execute

            # Scroll to load lazy content
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
            await asyncio.sleep(1)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)

            # Extract all data via JS
            data = await page.evaluate("""() => {
                const body = document.body.innerHTML.toLowerCase()
                    .replace(/\\[at\\]/g, '@').replace(/\\(at\\)/g, '@')
                    .replace(/\\[dot\\]/g, '.').replace(/\\(dot\\)/g, '.');

                const emailRegex = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
                const emails = [...new Set(body.match(emailRegex) || [])];

                // Also check mailto links
                document.querySelectorAll('a[href*="mailto:"]').forEach(a => {
                    const email = a.href.replace('mailto:', '').split('?')[0].trim().toLowerCase();
                    if (email && email.includes('@') && !emails.includes(email)) emails.push(email);
                });

                // Social links
                const social = {facebook: '', instagram: '', twitter: '', linkedin: ''};
                document.querySelectorAll('a[href]').forEach(a => {
                    const h = a.href.toLowerCase();
                    if (h.includes('facebook.com/') && !social.facebook) social.facebook = a.href;
                    if (h.includes('instagram.com/') && !social.instagram) social.instagram = a.href;
                    if ((h.includes('twitter.com/') || h.includes('x.com/')) && !social.twitter) social.twitter = a.href;
                    if (h.includes('linkedin.com/') && !social.linkedin) social.linkedin = a.href;
                });

                // Find contact page URLs
                const contactPages = [];
                document.querySelectorAll('a[href]').forEach(a => {
                    const h = (a.href || '').toLowerCase();
                    const t = (a.textContent || '').toLowerCase();
                    if (['contact', 'about'].some(kw => h.includes(kw) || t.includes(kw))) {
                        try {
                            if (new URL(a.href).origin === window.location.origin) {
                                contactPages.push(a.href);
                            }
                        } catch(e) {}
                    }
                });

                return {
                    emails: emails,
                    social: social,
                    contactPages: [...new Set(contactPages)].slice(0, 3)
                };
            }""")

            emails = data.get("emails", [])
            raw_social_links = data.get("social", social_links)
            social_links = {
                network: _normalize_social_url(raw_social_links.get(network, ""), network)
                for network in social_links
            }

            # Visit contact pages for more emails
            for contact_url in data.get("contactPages", []):
                try:
                    await page.goto(contact_url, wait_until="domcontentloaded", timeout=12000)  # Increased
                    await asyncio.sleep(2)  # Increased wait
                    page_emails = await page.evaluate("""() => {
                        const body = document.body.innerHTML.toLowerCase()
                            .replace(/\\[at\\]/g, '@').replace(/\\(at\\)/g, '@')
                            .replace(/\\[dot\\]/g, '.').replace(/\\(dot\\)/g, '.');
                        const emailRegex = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
                        const emails = [...new Set(body.match(emailRegex) || [])];
                        document.querySelectorAll('a[href*="mailto:"]').forEach(a => {
                            const email = a.href.replace('mailto:', '').split('?')[0].trim().toLowerCase();
                            if (email && email.includes('@') && !emails.includes(email)) emails.push(email);
                        });
                        return emails;
                    }""")
                    emails.extend(page_emails)
                except Exception:
                    pass

            await browser.close()
    except Exception as e:
        logger.debug(f"Playwright email extraction failed for {url}: {e}")

    return find_emails(" ".join(emails)), social_links


def get_domain_matched_email(emails: list[str], website_url: str) -> str:
    """Pick the best email — prefer domain-matched, then business email."""
    if not emails:
        return ""
    if not website_url:
        return emails[0]

    try:
        domain = urlparse(website_url).netloc.replace('www.', '').split(':')[0]
        for email in emails:
            if domain in email:
                return email
    except Exception:
        pass

    # Prefer business emails over generic (gmail, yahoo, etc.)
    priority_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    business_emails = [e for e in emails if not any(d in e for d in priority_domains)]
    return business_emails[0] if business_emails else emails[0]


async def extract_website_emails(website_url: str) -> dict:
    """
    Deep email extraction from a business website.
    Phase 1: Fast aiohttp for static HTML.
    Phase 2: Playwright fallback for JS-rendered sites.
    """
    if not website_url:
        return {"emails": [], "social_links": {}}

    if not website_url.startswith("http"):
        website_url = "https://" + website_url

    all_emails = []
    social_links = {}

    # Phase 1: Fast aiohttp extraction
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT_REQUESTS, ssl=create_ssl_context())
    async with aiohttp.ClientSession(connector=connector) as session:
        homepage_html = await _fetch_page(session, website_url)
        if homepage_html:
            all_emails.extend(find_emails(homepage_html))
            social_links = _extract_social_links(homepage_html, website_url)

            contact_pages = _find_contact_pages(homepage_html, website_url)
            if contact_pages:
                tasks = [_fetch_page(session, url) for url in contact_pages]
                pages = await asyncio.gather(*tasks, return_exceptions=True)
                for contact_url, page_html in zip(contact_pages, pages):
                    if isinstance(page_html, str) and page_html:
                        all_emails.extend(find_emails(page_html))
                        page_social = _extract_social_links(page_html, contact_url)
                        for key, val in page_social.items():
                            if val and not social_links.get(key):
                                social_links[key] = val

    filtered = find_emails(" ".join(all_emails)) if all_emails else []

    # Phase 2: Playwright fallback for JS-rendered sites and client-side social links.
    if not filtered or not any(social_links.values()):
        logger.info(
            "Website fallback via Playwright for %s (emails=%s, socials=%s)",
            website_url,
            "found" if filtered else "missing",
            "found" if any(social_links.values()) else "missing",
        )
        pw_emails, pw_social = await _playwright_scrape_website(website_url)
        if not filtered:
            filtered.extend(pw_emails)
        for key, val in pw_social.items():
            if val and not social_links.get(key):
                social_links[key] = val

    return {
        "emails": find_emails(" ".join(filtered)) if filtered else [],
        "social_links": social_links,
    }


async def extract_facebook_email(facebook_url: str) -> list[str]:
    """
    Extract email from a Facebook business page using Playwright.
    Facebook blocks plain HTTP requests, so we need a real browser.
    Strategy: Use desktop browser → close login popup → scrape page content.
    Tries the main page first (has most data in HTML), then /about variants.
    """
    if not facebook_url:
        return []

    emails = []
    normalized_url = _normalize_social_url(facebook_url, "facebook")
    if not normalized_url:
        return []

    base = normalized_url.rstrip("/")

    # Normalize URL to www.facebook.com (desktop version shows more data)
    parsed_fb = urlparse(base)
    if parsed_fb.netloc and "facebook.com" in parsed_fb.netloc:
        desktop_base = parsed_fb._replace(netloc="www.facebook.com").geturl()
    else:
        desktop_base = base

    mobile_base = desktop_base
    try:
        mobile_base = urlparse(desktop_base)._replace(netloc="m.facebook.com").geturl()
    except Exception:
        pass

    # Try desktop + mobile public variants because Facebook exposes different data across them.
    fb_urls = []
    for base_url in (desktop_base, mobile_base):
        fb_urls.extend(
            [
                base_url,
                base_url + "/about",
                base_url + "/about_contact_and_basic_info",
            ]
        )
    fb_urls = list(dict.fromkeys(fb_urls))

    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/128.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 800},
                locale="en-US",
            )
            page = await context.new_page()
            page.set_default_timeout(12000)

            for url in fb_urls:
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=18000)  # Increased
                    await asyncio.sleep(4)  # Increased wait for Facebook to load

                    # Close the login / cookie popups Facebook shows to non-logged-in users.
                    for selector in (
                        '[aria-label="Close"]',
                        '[aria-label="Close dialog"]',
                        'text=/accept/i',
                        'text=/allow essential/i',
                    ):
                        try:
                            btn = page.locator(selector).first
                            if await btn.count():
                                await btn.click(timeout=1500)
                                await asyncio.sleep(0.8)
                        except Exception:
                            pass

                    # Expand inline details so contact info becomes visible when it is collapsed.
                    for selector in (
                        'text=/see more/i',
                        'text=/more/i',
                        'text=/contact info/i',
                        'text=/about/i',
                    ):
                        try:
                            btn = page.locator(selector).first
                            if await btn.count():
                                await btn.click(timeout=1500)
                                await asyncio.sleep(0.8)
                        except Exception:
                            pass

                    # Scroll a bit to trigger lazy sections.
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 3)")
                    await asyncio.sleep(1)
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.7)")
                    await asyncio.sleep(1.5)

                    # Extract rendered HTML, visible text, hrefs, and meta content so Python can
                    # apply stronger normalization/decoding for JSON-escaped emails.
                    page_payload = await page.evaluate("""() => {
                        const html = document.documentElement ? document.documentElement.outerHTML : '';
                        const text = document.body ? document.body.innerText : '';
                        const hrefs = Array.from(document.querySelectorAll('a[href]'))
                            .map(a => a.getAttribute('href') || a.href || '')
                            .join('\\n');
                        const metas = Array.from(document.querySelectorAll('meta[content]'))
                            .map(meta => meta.getAttribute('content') || '')
                            .join('\\n');
                        return [html, text, hrefs, metas].join('\\n');
                    }""")

                    if page_payload:
                        found = find_emails(page_payload)
                        emails.extend(found)
                        if found:
                            logger.info(f"Found Facebook emails from {url}: {found}")
                            break

                except Exception as e:
                    logger.debug(f"Facebook page fetch failed for {url}: {e}")
                    continue

            await browser.close()

    except Exception as e:
        logger.warning(f"Playwright Facebook extraction failed for {facebook_url}: {e}")

    return find_emails(" ".join(emails)) if emails else []


async def extract_instagram_email(instagram_url: str) -> list[str]:
    """
    Extract email from an Instagram profile bio using Playwright.
    Instagram also blocks plain HTTP requests, needs a real browser.
    """
    if not instagram_url:
        return []

    emails = []
    instagram_url = _normalize_social_url(instagram_url, "instagram")
    if not instagram_url:
        return []

    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = await browser.new_page(
                user_agent=(
                    "Mozilla/5.0 (Linux; Android 13; Pixel 7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/128.0.0.0 Mobile Safari/537.36"
                ),
            )
            page.set_default_timeout(12000)

            await page.goto(instagram_url, wait_until="domcontentloaded", timeout=18000)  # Increased
            await asyncio.sleep(3)  # Increased wait for Instagram

            # Extract emails from rendered page
            page_emails = await page.evaluate("""() => {
                const body = document.body.innerHTML.toLowerCase()
                    .replace(/\\[at\\]/g, '@').replace(/\\(at\\)/g, '@')
                    .replace(/\\[dot\\]/g, '.').replace(/\\(dot\\)/g, '.');
                const emailRegex = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
                const emails = [...new Set(body.match(emailRegex) || [])];
                document.querySelectorAll('a[href*="mailto:"]').forEach(a => {
                    const email = a.href.replace('mailto:', '').split('?')[0].trim().toLowerCase();
                    if (email && email.includes('@') && !emails.includes(email)) emails.push(email);
                });
                return emails;
            }""")

            if page_emails:
                emails = find_emails(" ".join(page_emails))

            await browser.close()

    except Exception as e:
        logger.debug(f"Playwright Instagram extraction failed for {instagram_url}: {e}")
        # Fallback to aiohttp
        connector = aiohttp.TCPConnector(limit=5, ssl=create_ssl_context())
        async with aiohttp.ClientSession(connector=connector) as session:
            html = await _fetch_page(session, instagram_url)
            if html:
                emails = find_emails(html)

    return emails


def _match_store_name_email(emails: list[str], store_name: str, website_url: str) -> str:
    """
    Smart email matching: check if store name's first 3 letters or website domain
    matches any email's local part or domain.
    Returns the best matching email or empty string.
    """
    if not emails or not store_name:
        return ""

    store_prefix = store_name.strip().lower().replace(" ", "")[:3]
    domain = ""
    if website_url:
        try:
            domain = urlparse(website_url).netloc.replace("www.", "").split(":")[0].split(".")[0].lower()
        except Exception:
            pass

    # Check each email for store name prefix or domain match
    for email in emails:
        email_lower = email.lower()
        local_part = email_lower.split("@")[0]
        email_domain = email_lower.split("@")[-1].split(".")[0] if "@" in email_lower else ""

        # Match store name first 3 letters against local part or email domain
        if store_prefix and len(store_prefix) >= 3:
            if store_prefix in local_part or store_prefix in email_domain:
                return email

        # Match website domain against email domain
        if domain and len(domain) >= 3:
            if domain in local_part or domain in email_domain:
                return email

    return ""


async def extract_all_emails(
    website_url: str = "",
    facebook_url: str = "",
    instagram_url: str = "",
    google_maps_email: str = "",
    store_name: str = "",
) -> dict:
    """
    Extract emails from all available sources and consolidate.
    Smart priority: Facebook first, then store name / domain match, then fallback.
    """
    tasks = [
        extract_website_emails(website_url),
        extract_facebook_email(facebook_url),
        extract_instagram_email(instagram_url),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    website_result = results[0] if not isinstance(results[0], Exception) else {"emails": [], "social_links": {}}
    fb_emails = results[1] if not isinstance(results[1], Exception) else []
    ig_emails = results[2] if not isinstance(results[2], Exception) else []

    website_emails = website_result.get("emails", [])
    social_links = website_result.get("social_links", {})

    # Second pass: if the website reveals social links late, scrape those too before final ranking.
    if social_links.get("facebook") and not fb_emails:
        try:
            fb_emails = await extract_facebook_email(social_links["facebook"])
        except Exception as e:
            logger.debug(f"Late Facebook extraction failed for {social_links['facebook']}: {e}")

    if social_links.get("instagram") and not ig_emails:
        try:
            ig_emails = await extract_instagram_email(social_links["instagram"])
        except Exception as e:
            logger.debug(f"Late Instagram extraction failed for {social_links['instagram']}: {e}")

    return build_email_result(
        website_emails=website_emails,
        facebook_emails=fb_emails,
        instagram_emails=ig_emails,
        google_maps_email=google_maps_email,
        store_name=store_name,
        website_url=website_url,
        social_links=social_links,
    )
