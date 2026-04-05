---
phase: 06-iterative-improvements
plan: 01
subsystem: docs
tags: [affiliate, mercadolibre, amazon, documentation]
dependency_graph:
  requires: []
  provides: [affiliate-registration-guide]
  affects: [laptops.affiliate_link]
tech_stack:
  added: []
  patterns: []
key_files:
  created:
    - docs/AFFILIATE-GUIDE.md
  modified: []
decisions:
  - "Single affiliate_link field (not split ML/Amazon columns) — sufficient for MVP; most laptops are only on one platform"
  - "US Amazon Associates program recommended — amazon.com.ar does not exist; Argentine customers use amazon.com with international shipping"
metrics:
  duration: 1min
  completed_date: "2026-04-05T22:28:52Z"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
---

# Phase 06 Plan 01: Affiliate Program Guide Summary

Step-by-step affiliate registration and link generation guide for MercadoLibre Argentina and Amazon Associates US, covering database update instructions and a completion checklist.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create affiliate program registration and integration guide | 50d5ae0 | docs/AFFILIATE-GUIDE.md |

## What Was Built

`docs/AFFILIATE-GUIDE.md` — A complete affiliate program guide with:

- **Overview:** explains that `detail-overlay.tsx` already renders `laptop.affiliate_link` as the Comprar Ahora CTA; no frontend changes needed
- **MercadoLibre Argentina section:** registration steps at `mercadolibre.com.ar/l/afiliados`, link generation via the in-platform affiliate toolbar, commission rates (2–4%), payment timeline
- **Amazon Associates US section:** explains why the US program is used (no amazon.com.ar), registration at `affiliate-program.amazon.com`, SiteStripe toolbar workflow, documented URL format (`https://www.amazon.com/dp/{ASIN}/?tag={associate-id}`)
- **Supabase update instructions:** both Table Editor (GUI) and SQL UPDATE approach with examples
- **Empty link warning:** documents that `affiliate_link = ''` renders a broken `<a href="">` and prescribes using the plain product URL as a placeholder
- **Completion checklist:** 8 items from registration through end-to-end testing

## Decisions Made

1. **Single `affiliate_link` field retained** — The existing schema has one `affiliate_link TEXT` column per laptop. Adding split `affiliate_url_ml` / `affiliate_url_amazon` columns was considered but rejected for MVP: most laptops appear on only one platform. No migration needed.

2. **US Amazon Associates recommended** — `amazon.com.ar` does not exist. Argentine customers shop `amazon.com` with international shipping. The US program covers all relevant laptop listings.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. This plan creates documentation only; no code or data with stubs was introduced.

## Self-Check: PASSED

- `docs/AFFILIATE-GUIDE.md` exists: FOUND
- Contains `## MercadoLibre`: FOUND
- Contains `## Amazon Associates`: FOUND
- Contains `tag=` parameter example: FOUND
- Contains `## Updating Laptop Records` section with SQL UPDATE: FOUND
- Contains warning about empty affiliate_link: FOUND
- Contains checklist with 8 items: FOUND
- Commit 50d5ae0 exists: FOUND
