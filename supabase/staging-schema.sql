-- staging-schema.sql
-- Tablas de staging para el nuevo pipeline de recomendaciones.
-- No tocan nada de la producción actual (laptops, profiles).
-- Correr en Supabase SQL Editor.
--
-- Para hacer rollback: DROP TABLE profile_recommendations; DROP TABLE laptops_v2;

-- ── laptops_v2 ────────────────────────────────────────────────────────────────
-- Misma estructura que laptops + form_factor + scraped_at + campos ML extras.

CREATE TABLE IF NOT EXISTS laptops_v2 (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  name                   TEXT NOT NULL,
  brand                  TEXT NOT NULL,
  price                  NUMERIC(12, 2),

  -- Specs (extraídos de ML attributes)
  cpu                    TEXT,
  ram                    TEXT,
  gpu                    TEXT,
  storage                TEXT,
  os                     TEXT,
  screen_size            TEXT,
  weight                 TEXT,
  battery                TEXT,
  color                  TEXT,

  -- Forma física — clave para el filtro de lifestyle
  -- 'laptop' | 'mini_pc' | 'desktop'
  form_factor            TEXT NOT NULL DEFAULT 'laptop'
    CHECK (form_factor IN ('laptop', 'mini_pc', 'desktop')),

  -- Filtrado y clasificación
  simplified_tags        TEXT[],
  usage_profiles         TEXT[],
  recommendation_score   INTEGER DEFAULT 5
    CHECK (recommendation_score >= 1 AND recommendation_score <= 10),

  -- Contenido editorial (se puede completar después del scraping)
  influencer_note        TEXT DEFAULT '',
  description            TEXT DEFAULT '',

  -- Links
  affiliate_link         TEXT DEFAULT '',
  image_url              TEXT DEFAULT '',
  gallery_images         TEXT[],

  -- Origen ML
  catalog_product_id     TEXT UNIQUE,
  item_id                TEXT,
  listing_type           TEXT,
  original_price         NUMERIC(12, 2),
  is_international       BOOLEAN DEFAULT FALSE,
  permalink              TEXT,

  -- Calidad del vendedor
  seller_nickname        TEXT,
  seller_power_status    TEXT,
  seller_level           TEXT,
  seller_transactions    INTEGER DEFAULT 0,
  highlight_rank         INTEGER,

  -- Control
  availability_warning   BOOLEAN DEFAULT FALSE,
  scraped_at             TIMESTAMPTZ DEFAULT NOW(),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_laptops_v2_usage_profiles
  ON laptops_v2 USING GIN (usage_profiles);
CREATE INDEX IF NOT EXISTS idx_laptops_v2_brand ON laptops_v2 (brand);
CREATE INDEX IF NOT EXISTS idx_laptops_v2_price ON laptops_v2 (price);
CREATE INDEX IF NOT EXISTS idx_laptops_v2_form_factor ON laptops_v2 (form_factor);
CREATE INDEX IF NOT EXISTS idx_laptops_v2_os ON laptops_v2 (os);

-- ── profile_recommendations ───────────────────────────────────────────────────
-- 36 perfiles × 5 laptops = 180 filas estáticas.
-- profile_id → profiles (producción), laptop_id → laptops_v2 (staging).
-- Cuando se aprueba y se migra a producción:
--   1. Se hace UPSERT de laptops_v2 → laptops (por catalog_product_id)
--   2. Se re-corre curate_profiles_v2.py --table laptops --apply
--   3. Se dropean estas tablas de staging.

CREATE TABLE IF NOT EXISTS profile_recommendations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  laptop_id   UUID NOT NULL REFERENCES laptops_v2(id) ON DELETE CASCADE,
  rank        INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 5),
  tier        TEXT NOT NULL CHECK (tier IN ('barata', 'mediana', 'cara')),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, rank)
);

CREATE INDEX IF NOT EXISTS idx_profrec_profile ON profile_recommendations (profile_id);
