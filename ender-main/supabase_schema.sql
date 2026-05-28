-- Restaurant Leads Scraper — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- 1. Scraping Tasks table
CREATE TABLE IF NOT EXISTS scraping_tasks (
    id BIGSERIAL PRIMARY KEY,
    job_id TEXT UNIQUE NOT NULL,
    search_term TEXT NOT NULL DEFAULT '',
    zip_codes TEXT DEFAULT '',
    status TEXT DEFAULT 'Running',
    total_results INTEGER DEFAULT 0,
    scraped_count INTEGER DEFAULT 0,
    industry TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Business Data table
CREATE TABLE IF NOT EXISTS business_data (
    id BIGSERIAL PRIMARY KEY,
    task_id TEXT REFERENCES scraping_tasks(job_id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    address TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    website TEXT DEFAULT '',
    final_email TEXT DEFAULT '',
    all_website_emails TEXT DEFAULT '',
    website_email TEXT DEFAULT '',
    facebook_email TEXT DEFAULT '',
    instagram_email TEXT DEFAULT '',
    google_maps_email TEXT DEFAULT '',
    comparing_emails TEXT DEFAULT '',
    email_source TEXT DEFAULT '',
    facebook_link TEXT DEFAULT '',
    instagram_link TEXT DEFAULT '',
    twitter_link TEXT DEFAULT '',
    linkedin_link TEXT DEFAULT '',
    maps_url TEXT DEFAULT '',
    place_id TEXT DEFAULT '',
    closure_status TEXT DEFAULT 'Open',
    status TEXT DEFAULT 'Open',
    rating TEXT DEFAULT '',
    reviews_count TEXT DEFAULT '',
    price_range TEXT DEFAULT '',
    category TEXT DEFAULT '',
    cuisine_types TEXT DEFAULT '',
    opening_hours TEXT DEFAULT '',
    has_pos TEXT DEFAULT 'No',
    pos_system TEXT DEFAULT '',
    pos_details TEXT DEFAULT '',
    delivery_services TEXT DEFAULT '',
    website_type TEXT DEFAULT '',
    storefront TEXT DEFAULT '',
    search_query TEXT DEFAULT '',
    zipcode TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    country TEXT DEFAULT '',
    date TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_business_task_id ON business_data(task_id);
CREATE INDEX IF NOT EXISTS idx_business_industry ON business_data(search_query);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON scraping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON scraping_tasks(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_place_id_unique
    ON business_data(place_id)
    WHERE place_id <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_name_address_unique
    ON business_data(name, address)
    WHERE address <> '';

-- Existing deployments that already created a broad UNIQUE(name, address) constraint
-- should drop that constraint before applying the partial unique indexes above.

-- 4. Enable Row Level Security (recommended)
ALTER TABLE scraping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_data ENABLE ROW LEVEL SECURITY;

-- 5. Production recommendation:
-- Use SUPABASE_SERVICE_ROLE_KEY on the backend and do NOT create blanket allow-all policies.
-- If you need direct client access later, add narrowly scoped policies for those exact use cases.
