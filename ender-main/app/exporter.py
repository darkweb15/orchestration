"""Export scraping results to CSV and JSON."""

import csv
import io
import json

from app.models import LeadResult


EXPORT_FIELDS = [
    "date", "search_query", "category", "zipcode", "city", "state", "country",
    "name", "address", "phone", "website",
    "facebook_link", "instagram_link", "twitter_link", "linkedin_link",
    "google_maps_email", "all_website_emails", "website_email",
    "facebook_email", "instagram_email", "final_email",
    "comparing_emails", "email_source",
    "maps_url", "place_id", "closure_status", "status",
    "rating", "reviews_count", "price_range", "cuisine_types", "opening_hours",
    "has_pos", "pos_system", "pos_details",
    "delivery_services", "website_type", "storefront",
]


def export_to_csv(results: list[LeadResult]) -> str:
    """Export results to CSV string."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=EXPORT_FIELDS)
    writer.writeheader()
    for lead in results:
        writer.writerow({field: getattr(lead, field, "") for field in EXPORT_FIELDS})
    return output.getvalue()


def export_to_json(results: list[LeadResult]) -> str:
    """Export results to JSON string."""
    data = [{field: getattr(lead, field, "") for field in EXPORT_FIELDS} for lead in results]
    return json.dumps(data, indent=2)
