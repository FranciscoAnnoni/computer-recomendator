---
phase: 08-seo
plan: "02"
subsystem: seo
tags: [sitemap, robots, og-image, metadata-routes, next.js]
dependency_graph:
  requires: [08-01]
  provides: [sitemap.xml, robots.txt, og-image.png]
  affects: [search-engine-indexing, social-previews]
tech_stack:
  added: []
  patterns: [next.js-metadata-routes, MetadataRoute.Sitemap, MetadataRoute.Robots]
key_files:
  created:
    - src/app/sitemap.ts
    - src/app/robots.ts
    - public/og-image.png
  modified: []
decisions:
  - "Priority scheme: home 1.0 > quiz 0.9 > catalog 0.8 > compare 0.7 > profile 0.6 — reflects user-flow importance"
  - "changeFrequency: weekly for /catalog (inventory updated frequently), monthly for all static pages"
  - "og-image.png auto-generated via sharp (Next.js transitive dep) — no human action required"
  - "BASE_URL hardcoded in both sitemap.ts and robots.ts — update all three files (layout.tsx, sitemap.ts, robots.ts) once Phase 7 confirms final Vercel URL"
  - "No disallow rules in robots.ts — requirements say allow crawling of all public pages"
metrics:
  duration: "2 min"
  completed_date: "2026-04-18"
  tasks_completed: 3
  files_created: 3
  files_modified: 0
---

# Phase 8 Plan 02: Sitemap, Robots, and OG Image Summary

One-liner: Next.js metadata route files (`sitemap.ts`, `robots.ts`) auto-generating `/sitemap.xml` and `/robots.txt`, plus a 1200x630 brand-blue OG image generated via `sharp`.

## What Was Built

### Task 1 — `src/app/sitemap.ts` (commit `1a5a867`)

Created a typed `MetadataRoute.Sitemap` default export. Next.js auto-generates `/sitemap.xml` from this file at build time. All 5 public routes are listed with priorities and change frequencies.

Route priorities:
- `/` — priority 1.0, monthly
- `/quiz` — priority 0.9, monthly
- `/catalog` — priority 0.8, **weekly** (inventory changes more often)
- `/compare` — priority 0.7, monthly
- `/profile` — priority 0.6, monthly

### Task 2 — `src/app/robots.ts` (commit `78e9203`)

Created a typed `MetadataRoute.Robots` default export. Next.js auto-generates `/robots.txt` from this file. Allows all crawlers on all public paths, references the production sitemap URL, includes `host` hint for Yandex compatibility.

### Task 3 — `public/og-image.png` (commit `f5ce434`)

Auto-generated (no human action required) via `sharp` (a transitive dependency of Next.js). The image is 1200x630 pixels, 11,238 bytes, using brand blue `#0071E3` (r:0, g:113, b:227) from STATE.md decision 01-01.

## Verification

All checks passed statically:

```
src/app/sitemap.ts — exports 'export default function sitemap' ✓
src/app/robots.ts  — exports 'export default function robots' ✓
public/og-image.png — PNG image data, 1200 x 630, 11238 bytes ✓
npm run build — exit 0, /sitemap.xml and /robots.txt routes generated ✓
```

Build output confirmed routes:
```
├ ○ /robots.txt
└ ○ /sitemap.xml
```

## Deviations from Plan

None — plan executed exactly as written. All three automated steps in Task 3 were attempted in order: (1) file already exists — NO, (2) ImageMagick — not available on this machine, (3) sharp via Node — SUCCEEDED. Checkpoint was auto-passed without human intervention.

## Known Stubs

None — all three deliverables are fully functional.

## Follow-ups

- **BASE_URL update:** When Phase 7 finalizes the production Vercel URL, update `metadataBase` in `src/app/layout.tsx`, `BASE_URL` in `src/app/sitemap.ts`, and `BASE_URL` in `src/app/robots.ts` in a single pass.
- **OG image design:** The current placeholder is brand-blue with no text. A polished design (app name, tagline, logo) can replace `public/og-image.png` post-launch with zero code changes.
- **Dynamic routes:** Per REQUIREMENTS.md, `/catalog/[slug]` dynamic sitemap entries are deferred to v1.2.

## Self-Check: PASSED

- `src/app/sitemap.ts` — FOUND
- `src/app/robots.ts` — FOUND
- `public/og-image.png` — FOUND (11238 bytes, 1200x630)
- Commit `1a5a867` — FOUND (feat(08-02): add sitemap.ts)
- Commit `78e9203` — FOUND (feat(08-02): add robots.ts)
- Commit `f5ce434` — FOUND (feat(08-02): add og-image.png)
