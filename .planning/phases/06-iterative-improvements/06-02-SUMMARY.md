---
phase: 06-iterative-improvements
plan: 02
subsystem: data/config
tags: [seed-data, laptops, database, next-image, cdn]
dependency_graph:
  requires: []
  provides: [laptop-catalog-data, image-cdn-config]
  affects: [catalog-page, quiz-results, comparator]
tech_stack:
  added: []
  patterns: [SQL INSERT seed, next/image remotePatterns]
key_files:
  created:
    - supabase/seed.sql
  modified:
    - next.config.ts
decisions:
  - "Used MercadoLibre search URLs (mercadolibre.com.ar/s?q=) as affiliate link placeholders — real affiliate links TBD when affiliate program is set up"
  - "MacBooks use Amazon search URLs (amazon.com/s?k=) as placeholders since ML rarely stocks genuine Apple products in Argentina"
  - "Image URLs use descriptive placeholder format (http2.mlstatic.com/D_NQ_NP_placeholder-{name}.jpg) — real ML image IDs require live scraping which is out of scope"
  - "gallery_images left as default empty array for all entries — gallery population deferred to a later plan when real product photos are sourced"
metrics:
  duration: 8min
  completed_date: "2026-04-05"
  tasks: 2
  files: 2
---

# Phase 6 Plan 02: Laptop Seed Data and Image CDN Config Summary

SQL seed file with 22 real Argentine market laptops covering all 3 workload segments, 3 budget tiers, and both Windows/macOS, plus next/image CDN config for MercadoLibre and Amazon product images.

## What Was Built

### Task 1: Laptop seed SQL (supabase/seed.sql)

Created `supabase/seed.sql` with 22 INSERT statements populating the laptops table:

**productividad_estudio (8 laptops):**
- Lenovo IdeaPad 1 15IGL7 — ARS 180,000 — esencial/Windows
- Samsung Galaxy Book3 — ARS 250,000 — esencial/Windows
- Lenovo IdeaPad 15AMN8 — ARS 280,000 — equilibrado/Windows
- HP Pavilion 15 — ARS 320,000 — equilibrado/Windows
- Acer Aspire A315-42 (Ryzen 7) — ARS 350,000 — premium/Windows
- Lenovo ThinkPad E14 Gen 5 — ARS 400,000 — equilibrado/Windows
- MacBook Air M2 13" — ARS 850,000 — equilibrado/macOS
- MacBook Air M3 15" — ARS 1,100,000 — premium/macOS

**creacion_desarrollo (7 laptops):**
- Asus ZenBook 14 OLED — ARS 480,000 — esencial/Windows
- Lenovo IdeaPad Creator 5 — ARS 520,000 — esencial/Windows
- Lenovo Yoga Pro 7i — ARS 680,000 — equilibrado/Windows
- HP Envy x360 15 — ARS 760,000 — equilibrado/Windows
- Asus VivoBook Pro 16 OLED — ARS 950,000 — premium/Windows
- Dell XPS 15 9530 — ARS 1,400,000 — premium/Windows
- MacBook Pro M3 14" — ARS 1,900,000 — premium/macOS

**gaming_rendimiento (7 laptops):**
- Lenovo IdeaPad Gaming 3 Gen 7 — ARS 500,000 — esencial/Windows
- HP Victus 16 — ARS 550,000 — esencial/Windows
- MSI Katana 15 — ARS 580,000 — esencial/Windows
- Acer Nitro 5 AN515 — ARS 650,000 — equilibrado/Windows
- Asus TUF Gaming A15 2024 — ARS 850,000 — equilibrado/Windows
- Asus ROG Strix G15 — ARS 1,200,000 — premium/Windows
- Lenovo Legion 5 Pro — ARS 1,450,000 — premium/Windows

### Task 2: next/image CDN config (next.config.ts)

Added 2 new remotePatterns entries:
- `http2.mlstatic.com` — MercadoLibre product image CDN
- `m.media-amazon.com` — Amazon product image CDN

Final remotePatterns count: 4 entries (Supabase, Unsplash, MercadoLibre, Amazon).

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 02504a2 | feat(06-02): create laptop seed SQL with 22 Argentine market laptops |
| 2 | 047da9c | chore(06-02): add MercadoLibre and Amazon image CDN to next/image remotePatterns |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

1. **Image URLs** — `supabase/seed.sql`, all 22 rows: `image_url` values use placeholder format (`https://http2.mlstatic.com/D_NQ_NP_placeholder-{name}.jpg`). These are valid CDN hostnames (now whitelisted in next.config.ts) but the file path portions are not real ML image IDs. Cards will render broken images until real ML image URLs are sourced and updated. This is intentional — real image IDs require live MercadoLibre scraping which is out of scope for this plan.

2. **Affiliate links** — `supabase/seed.sql`, all 22 rows: `affiliate_link` values use MercadoLibre/Amazon search query URLs rather than direct product affiliate links. These are functional (clicking opens a search results page) but not monetized. Real affiliate links require MercadoLibre Partner Program enrollment.

## Self-Check: PASSED

- supabase/seed.sql: FOUND
- next.config.ts: FOUND with http2.mlstatic.com and m.media-amazon.com
- Commit 02504a2: FOUND
- Commit 047da9c: FOUND
- 22 INSERT statements confirmed
- No empty affiliate_link values confirmed
