import os
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app import database as db
from app import main as main_module
from app.scraper.orchestrator import parse_us_location_line


class ProductionHardeningTests(unittest.TestCase):
    def setUp(self):
        db._client = None
        db._missing_config_logged = False
        self.client = TestClient(main_module.app)

    def tearDown(self):
        db._client = None
        db._missing_config_logged = False

    def test_lead_identity_key_prefers_place_id(self):
        key = db.lead_identity_key(place_id="abc123", name="Cafe", address="")
        self.assertEqual(key, "place_id:abc123")

    def test_lead_identity_key_requires_address_without_place_id(self):
        key = db.lead_identity_key(place_id="", name="Cafe", address="")
        self.assertEqual(key, "")

    def test_health_reports_database_disabled_when_env_missing(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "", "SUPABASE_KEY": "", "API_KEY": ""}, clear=False):
            response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertFalse(payload["database"]["configured"])
        self.assertFalse(payload["database"]["connected"])
        self.assertFalse(payload["api_key_required"])

    def test_stats_requires_api_key_when_configured(self):
        with patch.dict(os.environ, {"API_KEY": "secret-key"}, clear=False):
            response = self.client.get("/api/stats")

        self.assertEqual(response.status_code, 403)

    def test_stats_accepts_valid_api_key(self):
        with patch.dict(
            os.environ,
            {"API_KEY": "secret-key", "SUPABASE_URL": "", "SUPABASE_KEY": ""},
            clear=False,
        ):
            response = self.client.get("/api/stats", headers={"X-API-Key": "secret-key"})

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("total_businesses", payload)
        self.assertIn("total_emails", payload)
        self.assertIn("total_tasks", payload)

    def test_parse_us_location_line_normalizes_country(self):
        parsed = parse_us_location_line("10001 New York NY United States")

        self.assertEqual(parsed["zipcode"], "10001")
        self.assertEqual(parsed["city"], "New York")
        self.assertEqual(parsed["state"], "NY")
        self.assertEqual(parsed["country"], "USA")
        self.assertEqual(parsed["location"], "10001 New York NY USA")

    def test_parse_us_location_line_rejects_non_us_shape(self):
        with self.assertRaises(ValueError):
            parse_us_location_line("10001 Toronto Ontario Canada")

    def test_start_scrape_rejects_non_us_locations(self):
        payload = {
            "search_terms": ["liquor stores"],
            "zip_codes": ["M5V Toronto ON Canada"],
            "max_results_per_search": 5,
            "scraping_speed": "balanced",
        }

        response = self.client.post("/api/scrape", json=payload)

        self.assertEqual(response.status_code, 400)
        self.assertIn("Only US locations are supported", response.json()["error"])

    def test_start_scrape_normalizes_us_locations_before_job_start(self):
        payload = {
            "search_terms": ["liquor stores"],
            "zip_codes": ["10001 New York NY United States", "60601 Chicago IL"],
            "max_results_per_search": 5,
            "scraping_speed": "balanced",
        }

        with patch.object(main_module, "run_scrape_job", new=AsyncMock(return_value="job123")) as mock_run:
            response = self.client.post("/api/scrape", json=payload)

        self.assertEqual(response.status_code, 200)
        mock_run.assert_awaited_once()
        request_model = mock_run.await_args.args[0]
        self.assertEqual(
            request_model.zip_codes,
            ["10001 New York NY USA", "60601 Chicago IL USA"],
        )


if __name__ == "__main__":
    unittest.main()
