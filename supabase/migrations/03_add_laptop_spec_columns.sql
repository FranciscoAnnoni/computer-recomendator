-- Phase 3: Add spec columns for catalog detail view
ALTER TABLE laptops
  ADD COLUMN IF NOT EXISTS os TEXT,
  ADD COLUMN IF NOT EXISTS screen_size TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS battery TEXT;

-- Indexes for catalog filtering
CREATE INDEX IF NOT EXISTS laptops_brand_idx ON laptops (brand);
CREATE INDEX IF NOT EXISTS laptops_os_idx ON laptops (os);
CREATE INDEX IF NOT EXISTS laptops_influencer_note_idx ON laptops (influencer_note)
  WHERE influencer_note IS NOT NULL;
