---
phase: 05-polish-deployment
plan: "02"
subsystem: animation
tags: [framer-motion, hero-section, animation-audit, polish]
dependency_graph:
  requires: []
  provides: [hero-section-animation, animation-duration-compliance]
  affects: [src/app/page.tsx, src/components/home/hero-section.tsx, src/components/catalog/catalog-client.tsx, src/app/profile/page.tsx]
tech_stack:
  added: []
  patterns: [staggered-fade-up, framer-motion-variants]
key_files:
  created:
    - src/components/home/hero-section.tsx
  modified:
    - src/app/page.tsx
    - src/components/catalog/catalog-client.tsx
    - src/app/profile/page.tsx
decisions:
  - "Use staggerChildren: 0.08 for hero (3 items at t=0, t=80ms, t=160ms) — subtle without feeling slow"
  - "itemVariants y: 16 (smaller than profile's y: 24) for snappier feel on landing page"
  - "quiz-shell.tsx duration: 0.3 left unchanged — exactly at limit, not exceeding 0.3"
  - "profile/page.tsx durations 0.4 and 0.35 reduced to 0.25 per D-03"
metrics:
  duration: 5min
  completed_date: "2026-04-03"
  tasks_completed: 2
  files_modified: 4
---

# Phase 05 Plan 02: Hero Animation and Duration Audit Summary

Staggered fade-up added to home page hero (HeroSection client component) and all animation durations capped at 250ms across catalog, profile, and home.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create HeroSection client component with staggered fade-up | 69463ec | src/components/home/hero-section.tsx, src/app/page.tsx |
| 2 | Fix DetailOverlay animation duration and audit all animation durations | b2393cc | src/components/catalog/catalog-client.tsx, src/app/profile/page.tsx |

## What Was Built

**Task 1: HeroSection Component**

Created `src/components/home/hero-section.tsx` as a `"use client"` component that wraps the home page hero with Framer Motion staggered fade-up animation:
- `heroVariants` container with `staggerChildren: 0.08` (3 items at t=0, 80ms, 160ms)
- `itemVariants` with `opacity: 0 → 1`, `y: 16 → 0`, `duration: 0.25`, `ease: "easeOut"`
- Heading, subtitle, and CTA animate in sequence on page load

Updated `src/app/page.tsx` to remain a Server Component, delegating animation and interactive elements to `HeroSection`.

**Task 2: Duration Audit and Fix**

Fixed `catalog-client.tsx` DetailOverlay from `duration: 0.3` to `duration: 0.25`.

Audit results:

| File | Duration Found | Status | Action |
|------|---------------|--------|--------|
| catalog-client.tsx DetailOverlay | 0.3 | Over limit | Fixed to 0.25 |
| catalog-client.tsx cardVariants | 0.2 | OK | No change |
| profile/page.tsx header motion.div | 0.4 | Over limit | Fixed to 0.25 |
| profile/page.tsx laptop list items | 0.35 | Over limit | Fixed to 0.25 |
| quiz-shell.tsx slide transition | 0.3 | At limit (not exceeding) | No change |
| comparator-client.tsx | 0.2 | OK | No change |

## Decisions Made

- `staggerChildren: 0.08` chosen per research recommendation — 3 items stagger over 160ms total, noticeable but not slow
- `y: 16` offset (vs profile's `y: 24`) for subtler entrance on landing page where user attention is high
- quiz-shell.tsx `duration: 0.3` left unchanged — plan specifies "over 0.3" as threshold; 0.3 is exactly at the limit

## Deviations from Plan

None — plan executed exactly as written. Profile animation durations (0.4, 0.35) were also reduced per the D-07 audit requirement, which was anticipated in the plan's "audit" step.

## Known Stubs

None.

## Self-Check: PASSED

- src/components/home/hero-section.tsx: FOUND
- src/app/page.tsx: FOUND
- src/components/catalog/catalog-client.tsx: FOUND
- src/app/profile/page.tsx: FOUND
- Task 1 commit 69463ec: FOUND
- Task 2 commit b2393cc: FOUND
