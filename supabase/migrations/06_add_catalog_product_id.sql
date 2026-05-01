-- Phase 12: Add catalog_product_id for idempotent refresh upsert by ML catalog ID
-- The partial unique index excludes NULLs so manually-inserted rows without a catalog ID
-- (e.g. Mac Studio, hand-curated entries) do not collide.

ALTER TABLE laptops
  ADD COLUMN IF NOT EXISTS catalog_product_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS laptops_catalog_product_id_unique
  ON laptops (catalog_product_id)
  WHERE catalog_product_id IS NOT NULL;

-- Comment for future maintainers
COMMENT ON COLUMN laptops.catalog_product_id IS
  'MercadoLibre catalog product ID (e.g. MLA37740033). Unique when present. NULL allowed for manually-inserted rows. Used by scripts/refresh_catalog.py for upsert.';
