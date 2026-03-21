-- Phase 2: Profiles table for quiz → laptop mapping (4-dimension: 3×3×3×3 = 81 profiles)
-- Run this in Supabase SQL Editor after schema.sql (laptops table)

CREATE TYPE workload_enum AS ENUM (
  'productividad_estudio',
  'creacion_desarrollo',
  'gaming_rendimiento'
);

-- lifestyle now reflects physical mobility, not brand ecosystem
CREATE TYPE lifestyle_enum AS ENUM (
  'maxima_portabilidad',
  'movil_flexible',
  'escritorio_fijo'
);

CREATE TYPE budget_enum AS ENUM (
  'esencial',
  'equilibrado',
  'premium'
);

CREATE TYPE os_preference_enum AS ENUM (
  'windows',
  'macos',
  'abierto'
);

CREATE TABLE profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workload            workload_enum NOT NULL,
  lifestyle           lifestyle_enum NOT NULL,
  budget              budget_enum NOT NULL,
  os_preference       os_preference_enum NOT NULL,
  laptop_ids          uuid[] NOT NULL,
  profile_name        text NOT NULL,
  profile_description text NOT NULL,
  profile_image_url   text,
  created_at          timestamptz DEFAULT now(),
  UNIQUE (workload, lifestyle, budget, os_preference)
);

-- Composite index for the 4-dimension lookup query
CREATE INDEX idx_profiles_lookup
  ON profiles (workload, lifestyle, budget, os_preference);
