-- Laptops table for Computer Recomendator
-- Usage profiles and simplified tags stored as PostgreSQL arrays

CREATE TABLE IF NOT EXISTS laptops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,

  -- Technical specs
  cpu TEXT NOT NULL,
  ram TEXT NOT NULL,
  gpu TEXT NOT NULL,
  storage TEXT NOT NULL,

  -- Dummies mode
  simplified_tags TEXT[] DEFAULT '{}',

  -- Filtering
  usage_profiles TEXT[] DEFAULT '{}',

  -- Influencer content
  influencer_note TEXT DEFAULT '',
  recommendation_score INTEGER DEFAULT 0 CHECK (recommendation_score >= 0 AND recommendation_score <= 10),

  -- Links & media
  affiliate_link TEXT DEFAULT '',
  image_url TEXT DEFAULT '',

  -- Catalog refresh (migration 06)
  catalog_product_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by usage profiles
CREATE INDEX IF NOT EXISTS idx_laptops_usage_profiles ON laptops USING GIN (usage_profiles);

-- Index for filtering by brand
CREATE INDEX IF NOT EXISTS idx_laptops_brand ON laptops (brand);

-- Index for price range queries
CREATE INDEX IF NOT EXISTS idx_laptops_price ON laptops (price);

-- Partial unique index for catalog_product_id (excludes NULLs so manually-inserted rows don't collide)
CREATE UNIQUE INDEX IF NOT EXISTS laptops_catalog_product_id_unique
  ON laptops (catalog_product_id)
  WHERE catalog_product_id IS NOT NULL;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER laptops_updated_at
  BEFORE UPDATE ON laptops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
