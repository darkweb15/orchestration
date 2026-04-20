"""Configuration for the scraper."""

import os

# Scraper settings
MAX_CONCURRENT_BROWSERS = 3
MAX_CONCURRENT_REQUESTS = 10
REQUEST_TIMEOUT = 20  # seconds - increased for better results
SCROLL_PAUSE_TIME = 2.0  # seconds between scrolls - increased for complete loading
MAX_SCROLLS = 15  # max scrolls to load more results

# Page load wait times (seconds)
GOOGLE_MAPS_INITIAL_WAIT = 4  # Wait after loading search results
PLACE_PAGE_WAIT = 3  # Wait after loading place details
SCROLL_WAIT = 1.5  # Wait after each scroll
CONTENT_LOAD_WAIT = 2  # Wait for dynamic content to load

# POS systems to detect
POS_SYSTEMS = [
    "square",
    "toast",
    "clover",
    "lightspeed",
    "aloha",
    "micros",
    "revel",
    "shopkeep",
    "vend",
    "shopify pos",
    "touchbistro",
    "upserve",
    "cake pos",
    "harbortouch",
    "pos system",
    "point of sale",
    "ncr aloha",
    "oracle micros",
    "breadcrumb",
    "lavu",
    "talech",
    "epos",
    "epos now",
    "sapaad",
    "loyverse",
    "erply",
    "hike pos",
    "bindo",
    "kounta",
    "imonggo",
    "miva",
    "helcim",
    "paypal here",
    "sumup",
    "zettle",
    "gofrugal",
    "marg erp",
    "busy software",
    "tally",
]

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_wait_times(speed: str = "balanced") -> dict:
    """
    Get wait times based on scraping speed preference.
    
    Args:
        speed: 'fast', 'balanced', or 'quality'
    
    Returns:
        Dictionary with wait time values
    """
    wait_times = {
        "fast": {
            "google_maps_initial": 2,
            "place_page": 2,
            "scroll": 1,
            "content_load": 1,
            "website_load": 1.5,
            "facebook_load": 2,
            "instagram_load": 2,
            "timeout": 15,
        },
        "balanced": {
            "google_maps_initial": 4,
            "place_page": 3,
            "scroll": 1.5,
            "content_load": 2,
            "website_load": 2.5,
            "facebook_load": 4,
            "instagram_load": 3,
            "timeout": 20,
        },
        "quality": {
            "google_maps_initial": 5,
            "place_page": 4,
            "scroll": 2,
            "content_load": 3,
            "website_load": 3.5,
            "facebook_load": 5,
            "instagram_load": 4,
            "timeout": 25,
        },
    }
    
    return wait_times.get(speed, wait_times["balanced"])
