"""Shared utilities for the scraper."""

import ssl
from app.models import LeadResult


def create_ssl_context() -> ssl.SSLContext:
    """Create an SSL context that verifies certificates but tolerates common issues."""
    ctx = ssl.create_default_context()
    return ctx


def db_row_to_lead(row: dict) -> LeadResult:
    """Convert a Supabase database row dict to a LeadResult model."""
    lead = LeadResult()
    for field in lead.model_fields:
        if field in row and row[field] is not None:
            setattr(lead, field, str(row[field]))
    return lead
