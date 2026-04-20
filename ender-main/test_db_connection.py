#!/usr/bin/env python3
"""Test Supabase database connection."""

import os
import sys
from app.database import get_client

def test_connection():
    """Test if Supabase connection works."""
    print("Testing Supabase connection...")
    print(f"SUPABASE_URL: {'✓ Set' if os.getenv('SUPABASE_URL') else '✗ Not set'}")
    print(f"SUPABASE_KEY: {'✓ Set' if os.getenv('SUPABASE_KEY') else '✗ Not set'}")
    print()
    
    client = get_client()
    
    if client is None:
        print("❌ Database connection FAILED")
        print("\nTo fix:")
        print("1. Get your Supabase credentials from: https://supabase.com/dashboard")
        print("2. Set environment variables:")
        print("   export SUPABASE_URL='your-project-url'")
        print("   export SUPABASE_KEY='your-anon-key'")
        print("\n3. Run the schema:")
        print("   - Go to Supabase Dashboard → SQL Editor")
        print("   - Copy contents from supabase_schema.sql")
        print("   - Run the query")
        return False
    
    try:
        # Test query
        result = client.table("scraping_tasks").select("id").limit(1).execute()
        print("✅ Database connection SUCCESSFUL")
        print(f"✅ Tables accessible")
        return True
    except Exception as e:
        print(f"❌ Database query failed: {e}")
        print("\nMake sure you've run the schema from supabase_schema.sql")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
