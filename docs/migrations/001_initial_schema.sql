-- docs/migrations/001_initial_schema.sql

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE channel_type AS ENUM ('JOB_BOARD', 'WHATSAPP', 'INSTAGRAM', 'TIKTOK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE format_type AS ENUM ('JOB_POSTING', 'MESSAGE', 'FEED_POST', 'STORY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ad_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. JOB OFFERS TABLE
CREATE TABLE IF NOT EXISTS job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    default_location VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ADVERTISEMENTS TABLE
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_offer_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
    channel channel_type NOT NULL,
    format format_type NOT NULL,
    target_location VARCHAR(255) NOT NULL,
    status ad_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ADVERTISEMENT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS advertisement_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    headline TEXT NOT NULL,
    body_text TEXT NOT NULL,
    call_to_action VARCHAR(255) NOT NULL,
    creative_notes TEXT,
    generated_headline TEXT NOT NULL,
    generated_body TEXT NOT NULL,
    generated_cta VARCHAR(255) NOT NULL,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    is_selected BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_advertisements_job_offer_id ON advertisements(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_channel ON advertisements(channel);
CREATE INDEX IF NOT EXISTS idx_advertisement_variants_ad_id ON advertisement_variants(advertisement_id);
