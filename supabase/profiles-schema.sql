-- Phase 2: Profiles table for quiz → laptop mapping
-- Run this in Supabase SQL Editor after schema.sql (laptops table)

CREATE TYPE workload_enum AS ENUM (
  'productividad_estudio',
  'creacion_desarrollo',
  'gaming_rendimiento'
);

CREATE TYPE lifestyle_enum AS ENUM (
  'maxima_portabilidad',
  'potencia_bruta',
  'ecosistema_apple'
);

CREATE TYPE budget_enum AS ENUM (
  'esencial',
  'equilibrado',
  'premium'
);

CREATE TABLE profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workload            workload_enum NOT NULL,
  lifestyle           lifestyle_enum NOT NULL,
  budget              budget_enum NOT NULL,
  laptop_ids          uuid[] NOT NULL,
  profile_name        text NOT NULL,
  profile_description text NOT NULL,
  profile_image_url   text,
  created_at          timestamptz DEFAULT now(),
  UNIQUE (workload, lifestyle, budget)
);

-- Composite index for the lookup query: WHERE workload=? AND lifestyle=? AND budget=?
CREATE INDEX idx_profiles_lookup
  ON profiles (workload, lifestyle, budget);
