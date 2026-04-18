---
phase: 08-seo
plan: 01
subsystem: seo
tags: [next.js, metadata, open-graph, twitter-card, seo, html-lang]

# Dependency graph
requires:
  - phase: 06-iterative-improvements
    provides: All 5 public page layouts with existing metadata scaffolding
provides:
  - lang="es" root HTML attribute for Spanish SEO indexing
  - metadataBase pointing to computer-recomendator.vercel.app for OG URL resolution
  - Separate viewport export (no deprecated viewport inside metadata)
  - twitter:card summary_large_image on all 5 public pages
  - og:image alt text on all 5 public pages
affects: [08-02-sitemap-robots, phase-7-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Separate viewport export (export const viewport: Viewport) instead of viewport inside metadata object"
    - "Root metadataBase enables relative OG image URLs (/og-image.png) to resolve at build time"
    - "Title template ('%s | Computer Recomendator') enables short per-page titles that get suffixed automatically"
    - "Profile metadata in layout.tsx only — page.tsx excluded as Client Component"

key-files:
  created: []
  modified:
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/quiz/page.tsx
    - src/app/catalog/page.tsx
    - src/app/compare/page.tsx
    - src/app/profile/layout.tsx

key-decisions:
  - "Separate viewport export required — viewport inside metadata is deprecated since Next.js 14 (no build warning after fix)"
  - "metadataBase set to computer-recomendator.vercel.app placeholder URL from research (finalizable after Phase 7 deploy)"
  - "es_AR locale chosen to match Argentine Spanish audience per PROJECT.md"
  - "Title template uses default + template object to allow child pages short unique titles"
  - "Profile metadata lives in layout.tsx not page.tsx — Client Component exports are silently ignored by Next.js"

patterns-established:
  - "Pattern: Viewport extracted from metadata to separate export const viewport: Viewport"
  - "Pattern: twitter card mirrors openGraph with same images + alt text for consistent social previews"

requirements-completed: [SEO-01, SEO-02, SEO-03, SEO-05]

# Metrics
duration: 15min
completed: 2026-04-18
---

# Phase 8 Plan 01: Spanish SEO Metadata Summary

**Root layout converted to lang="es" with metadataBase, viewport fix, and twitter:summary_large_image cards on all 5 public pages — enables Spanish indexing and rich social previews**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-18T00:00:00Z
- **Completed:** 2026-04-18T00:15:00Z
- **Tasks:** 3 (2 code changes + 1 verification)
- **Files modified:** 6

## Accomplishments
- Root layout now sets `<html lang="es">` for Spanish SEO (SEO-01)
- Added `metadataBase` pointing to Vercel production URL — enables relative OG image URLs to resolve without build errors (SEO-02)
- Extracted `viewport` to separate `export const viewport: Viewport` — eliminates deprecated viewport-in-metadata build warning
- All 5 public pages (home, quiz, catalog, compare, profile) now emit `twitter:card=summary_large_image` with Spanish content (SEO-05)
- Added `alt` text to all openGraph images across all 5 pages (SEO-03 compliance)
- Dev server smoke test confirmed rendered HTML matches expectations on all 5 routes

## Task Commits

1. **Task 1: Fix root layout** - `9a823a4` (feat)
2. **Task 2: Add twitter metadata to 5 public pages** - `cd35895` (feat)
3. **Task 3: Smoke-test via dev server + curl** - verification only, no commit

## Files Created/Modified
- `src/app/layout.tsx` - lang="es", metadataBase, separate viewport export, Spanish description, es_AR locale
- `src/app/page.tsx` - og:image alt + twitter card
- `src/app/quiz/page.tsx` - og:image alt + twitter card
- `src/app/catalog/page.tsx` - og:image alt + twitter card
- `src/app/compare/page.tsx` - og:image alt + twitter card
- `src/app/profile/layout.tsx` - og:image alt + twitter card

## Decisions Made
- Used `es_AR` locale (Argentine Spanish) matching the target audience in PROJECT.md
- Title template `"%s | Computer Recomendator"` chosen so page titles stay short and recognizable
- Viewport separated to `export const viewport: Viewport` per Next.js 14+ requirement — build confirmed no deprecation warning
- Profile metadata placed only in `layout.tsx` because `page.tsx` is a Client Component where Next.js silently ignores metadata exports

## Curl Smoke Test Output (`/tmp/seo-08-01-03.txt`)
```
=== ROOT HTML LANG ===
lang="es"
=== HOME og:title ===
og:title" content="Computer Recomendator"
=== HOME twitter:card ===
twitter:card" content="summary_large_image"
=== QUIZ og:title ===
og:title" content="Quiz - Computer Recomendator"
=== QUIZ twitter:card ===
twitter:card" content="summary_large_image"
=== CATALOG og:title ===
og:title" content="Catalogo | Computer Recomendator"
=== CATALOG twitter:card ===
twitter:card" content="summary_large_image"
=== COMPARE og:title ===
og:title" content="Comparar | Computer Recomendator"
=== COMPARE twitter:card ===
twitter:card" content="summary_large_image"
=== PROFILE og:title ===
og:title" content="Mi Perfil | Computer Recomendator"
=== PROFILE twitter:card ===
twitter:card" content="summary_large_image"
```

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Not Yet Verifiable (Pending Plan 02)
- OG image `/og-image.png` does not exist yet — 404 on image curl. Plan 02 Task 3 creates the actual OG image file.
- Production URL `computer-recomendator.vercel.app` is a placeholder — Phase 7 deploy will confirm the real Vercel URL.

## Next Phase Readiness
- Plan 02 can proceed: sitemap, robots.txt, and OG image generation
- All metadata infrastructure is in place for OG image to be picked up automatically once the file is created

---
*Phase: 08-seo*
*Completed: 2026-04-18*
