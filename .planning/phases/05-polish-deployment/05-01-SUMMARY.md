---
phase: 05-polish-deployment
plan: 01
subsystem: ui
tags: [next/image, performance, mobile, lazy-loading, webp, supabase]

# Dependency graph
requires:
  - phase: 03-product-catalog-detail-view
    provides: CatalogCard component with raw img tag
  - phase: 04-comparison-tool
    provides: CompareCard component with raw img tag
provides:
  - next/image migration for CatalogCard with fill + sizes
  - next/image migration for CompareCard with fill + sizes
  - remotePatterns config for Supabase Storage image optimization
affects: [05-polish-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next/image fill layout with parent relative div for container-based sizing"
    - "Conditional rendering on image_url truthiness instead of onError handlers"
    - "sizes prop tuned per component viewport breakpoints"

key-files:
  created: []
  modified:
    - next.config.ts
    - src/components/catalog/catalog-card.tsx
    - src/components/compare/compare-card.tsx

key-decisions:
  - "Removed imgError useState from CatalogCard — next/image does not support onError; conditional on image_url is sufficient"
  - "CompareCard image parent div gains relative class for fill layout to work correctly"
  - "sizes tuned per component: CatalogCard uses pixel widths matching CSS, CompareCard uses vw-based responsive sizes"

patterns-established:
  - "next/image fill: parent must have position:relative and explicit dimensions (width+height or aspect-ratio)"
  - "No onError with next/image — use conditional rendering on src truthiness instead"

requirements-completed: [D-05, D-06, D-07, D-08, D-09]

# Metrics
duration: 2min
completed: 2026-04-03
---

# Phase 05 Plan 01: next/image Migration Summary

**Both laptop image components migrated from raw img tags to next/image with fill layout, WebP optimization, and lazy loading via remotePatterns for Supabase Storage**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-03T16:16:00Z
- **Completed:** 2026-04-03T16:18:11Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Added `images.remotePatterns` to next.config.ts for the Supabase Storage hostname so next/image can optimize external URLs
- Migrated CatalogCard: replaced `<img>` + imgError state + onError with `<Image fill sizes=...>` + conditional rendering
- Migrated CompareCard: replaced `<img>` + onError with `<Image fill sizes=...>`, added `relative` to image container div

## Task Commits

Each task was committed atomically:

1. **Task 1: Add remotePatterns to next.config.ts** - `42ee11a` (chore)
2. **Task 2: Migrate CatalogCard from img to next/image** - `73acaaf` (feat)
3. **Task 3: Migrate CompareCard from img to next/image** - `f0cd346` (feat)

## Files Created/Modified
- `next.config.ts` - Added images.remotePatterns for orxstqqcsxatxaprqyvq.supabase.co
- `src/components/catalog/catalog-card.tsx` - Migrated to next/image fill layout, removed imgError state and onError
- `src/components/compare/compare-card.tsx` - Migrated to next/image fill layout, added relative to parent div

## Decisions Made
- Removed `useState(imgError)` entirely from CatalogCard — `next/image` does not support `onError`. Conditional rendering on `laptop.image_url` truthiness is the correct fallback pattern.
- Added `relative` to CompareCard image parent div — required by `fill` layout mode; the original div lacked it.
- Sizes values tuned per component: `(max-width: 640px) 100px, 155px` for CatalogCard (matches Tailwind breakpoint at sm), `(max-width: 768px) 50vw, 300px` for CompareCard.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build passes with only pre-existing viewport metadata warnings (unrelated to this plan's changes).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Both image components now deliver WebP-optimized, lazy-loaded images via the Next.js Image Optimization pipeline
- Supabase Storage images are allowlisted via remotePatterns — no runtime `Invalid src prop` errors
- Ready for Plan 05-02 (next phase in polish-deployment wave)

---
*Phase: 05-polish-deployment*
*Completed: 2026-04-03*
