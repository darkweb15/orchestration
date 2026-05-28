import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from app.models import LeadResult
from app.scraper.email_extractor import build_email_result, find_emails
from app.scraper.orchestrator import _enrich_lead


class EmailExtractorTests(unittest.TestCase):
    def test_find_emails_decodes_json_and_mailto_escapes(self):
        raw = r"""
            {"email":"hello\u0040brand.com"}
            <a href="mailto:sales%40brand.com">Email us</a>
        """

        emails = find_emails(raw)

        self.assertIn("hello@brand.com", emails)
        self.assertIn("sales@brand.com", emails)

    def test_build_email_result_prioritizes_facebook(self):
        result = build_email_result(
            website_emails=["info@brand.com"],
            facebook_emails=["owner@brand.com"],
            instagram_emails=[],
            google_maps_email="maps@brand.com",
            store_name="Brand House",
            website_url="https://brand.com",
        )

        self.assertEqual(result["final_email"], "owner@brand.com")
        self.assertEqual(result["email_source"], "Facebook")

    def test_enrich_lead_recomputes_final_email_after_late_facebook_discovery(self):
        lead = LeadResult(name="Brand House", website="https://brand.com")

        initial_email_result = {
            "website_email": "info@brand.com",
            "all_website_emails": "info@brand.com",
            "facebook_email": "",
            "instagram_email": "",
            "final_email": "info@brand.com",
            "comparing_emails": "info@brand.com",
            "email_source": "Website",
            "social_links": {"facebook": "https://www.facebook.com/brandhouse"},
        }

        pos_result = {
            "has_pos": False,
            "pos_system": "",
            "pos_details": "",
            "delivery_services": "",
            "website_type": "Unknown",
            "storefront": "No",
        }

        with patch("app.scraper.orchestrator.extract_all_emails", new=AsyncMock(return_value=initial_email_result)):
            with patch("app.scraper.email_extractor.extract_facebook_email", new=AsyncMock(return_value=["owner@brand.com"])):
                with patch("app.scraper.orchestrator.detect_pos_system", new=AsyncMock(return_value=pos_result)):
                    enriched = asyncio.run(_enrich_lead(lead))

        self.assertEqual(enriched.facebook_email, "owner@brand.com")
        self.assertEqual(enriched.final_email, "owner@brand.com")
        self.assertEqual(enriched.email_source, "Facebook")
        self.assertIn("owner@brand.com", enriched.comparing_emails)


if __name__ == "__main__":
    unittest.main()
