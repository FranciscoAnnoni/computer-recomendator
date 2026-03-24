---
phase: 03-product-catalog-detail-view
plan: 01
subsystem: catalog
tags: [types, data-fetching, components, supabase, sql]
dependency_graph:
  requires: []
  provides:
    - src/types/laptop.ts (extended Laptop interface)
    - src/lib/catalog-data.ts (fetchAllLaptops)
    - src/components/catalog/catalog-card.tsx (CatalogCard)
    - src/components/catalog/catalog-skeleton.tsx (CatalogSkeleton)
    - supabase/migrations/03_add_laptop_spec_columns.sql
    - supabase/seed-profiles-81.sql
  affects:
    - src/components/quiz/result-laptop-card.tsx (Laptop type change: nullable fields)
    - src/lib/quiz-data.ts (Laptop type change: nullable fields)
tech_stack:
  added: []
  patterns:
    - Supabase data fetch with order by created_at desc
    - Conditional render pattern for nullable influencer_note badge
    - Lucide icon + text spec row pattern
key_files:
  created:
    - src/lib/catalog-data.ts
    - src/components/catalog/catalog-card.tsx
    - src/components/catalog/catalog-skeleton.tsx
    - supabase/migrations/03_add_laptop_spec_columns.sql
    - supabase/seed-profiles-81.sql
  modified:
    - src/types/laptop.ts
decisions:
  - "influencer_note and recommendation_score changed from non-nullable to nullable to match real-world DB state where not all laptops have influencer content"
  - "Battery spec displayed in CatalogCard despite not being in existing tech spec columns — uses new battery column added via migration"
  - "MemoryStick icon used for RAM (available in lucide-react 0.577.0)"
  - "Ver mas button uses base-ui Button with onClick (forwarded correctly to native button)"
metrics:
  duration: 2min
  completed_date: "2026-03-24"
  tasks_completed: 3
  files_changed: 6
---

# Phase 03 Plan 01: Data Foundation and Presentational Components Summary

Extended Laptop type with 4 new nullable spec fields, created fetchAllLaptops Supabase query, built CatalogCard with image/star-badge/specs/button and CatalogSkeleton with 6 shimmer placeholders.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend Laptop type + migration SQL + fetchAllLaptops | 90f3b53 | src/types/laptop.ts, src/lib/catalog-data.ts, supabase/migrations/03_add_laptop_spec_columns.sql, supabase/seed-profiles-81.sql |
| 2 | Build CatalogCard component | e3c3858 | src/components/catalog/catalog-card.tsx |
| 3 | Build CatalogSkeleton component | 35d5aeb | src/components/catalog/catalog-skeleton.tsx |

## What Was Built

### Extended Laptop Interface (`src/types/laptop.ts`)
Added `os`, `screen_size`, `weight`, `battery` as `string | null` fields after `storage`. Changed `influencer_note` from `string` to `string | null` and `recommendation_score` from `number` to `number | null`.

### fetchAllLaptops (`src/lib/catalog-data.ts`)
Simple Supabase query on `laptops` table selecting all columns, ordered by `created_at` descending. Throws on error, returns typed `Laptop[]`.

### SQL Migration (`supabase/migrations/03_add_laptop_spec_columns.sql`)
ALTER TABLE adding 4 TEXT columns (os, screen_size, weight, battery) with IF NOT EXISTS guards. Creates 3 indexes: brand, os, and partial index on influencer_note where NOT NULL.

### 81-Row Profiles Seed (`supabase/seed-profiles-81.sql`)
Generated all 81 combinations of workload (3) × lifestyle (3) × budget (3) × os_preference (3). Each row has Spanish profile_name and profile_description, empty laptop_ids array, ON CONFLICT DO NOTHING for idempotency.

### CatalogCard (`src/components/catalog/catalog-card.tsx`)
"use client" component accepting `laptop: Laptop` and `onVerMas: (laptopId: string) => void`. Layout:
- Square aspect-ratio image with brand-name fallback on error
- Absolute-positioned star badge (★) when `influencer_note` is truthy
- Name (17px medium), price (12px muted), tag pills (12px rounded-full)
- 2-column spec grid: CPU/RAM/Storage/GPU/Battery with Lucide icons (only non-null specs rendered)
- Full-width outline "Ver mas" button with primary border/text color

### CatalogSkeleton (`src/components/catalog/catalog-skeleton.tsx`)
Pure presentational (no "use client"). Accepts `count?: number` (default 6). Renders matching shimmer placeholders: square image area, name bar, price bar, tag pills row, 2×2 spec grid, full-width button bar. All using `animate-pulse`.

## Decisions Made

- **influencer_note nullable:** Changed from `string` to `string | null` since real-world DB rows may not have influencer content. Same for `recommendation_score`.
- **MemoryStick for RAM:** lucide-react 0.577.0 has MemoryStick icon — used for RAM spec display.
- **Battery in spec grid:** Included battery column in CatalogCard spec grid, sourced from the new battery column added via migration.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- `supabase/seed-profiles-81.sql` uses empty `laptop_ids = '{}'` arrays as placeholders. These are intentional stubs — laptop associations will be populated with real data in a later plan. The seed SQL's purpose is to create the profile rows; laptop_ids population is a separate concern.

## Self-Check: PASSED

All 6 files verified present on disk. All 3 task commits (90f3b53, e3c3858, 35d5aeb) confirmed in git log.
