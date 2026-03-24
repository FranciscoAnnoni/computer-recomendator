---
phase: 03-product-catalog-detail-view
plan: "03"
subsystem: catalog
tags: [overlay, framer-motion, detail-view, affiliate-link, animation]
dependency_graph:
  requires: ["03-01", "03-02"]
  provides: ["detail-overlay", "animated-overlay-transition"]
  affects: ["catalog-client", "result-laptop-card"]
tech_stack:
  added: []
  patterns: ["AnimatePresence slide-up/down", "CVA buttonVariants on anchor tag", "body scroll lock via useEffect"]
key_files:
  created:
    - src/components/catalog/detail-overlay.tsx
  modified:
    - src/components/catalog/catalog-client.tsx
    - src/components/quiz/result-laptop-card.tsx
decisions:
  - "buttonVariants CVA applied directly on <a> tag for Comprar Ahora — base-ui Button does not support asChild"
  - "MemoryStick lucide icon used for RAM spec (confirmed available in installed version)"
  - "specsToShow filters null values so only present specs are shown in grid"
metrics:
  duration: "2min"
  completed_date: "2026-03-24"
  tasks_completed: 2
  tasks_total: 3
  files_changed: 3
---

# Phase 03 Plan 03: Detail Overlay — Build & Wire Summary

## One-liner

Full-screen detail overlay with Framer Motion slide-up animation, 8-spec grid, conditional influencer section, and affiliate purchase link.

## What Was Built

### Task 1: DetailOverlay component (commit: 0d89f51)

Created `src/components/catalog/detail-overlay.tsx` — a `"use client"` component that renders the full-screen detail view content:

- Sticky header bar with 44px close button (X icon, `aria-label="Cerrar"`, `autoFocus`) and `Comprar Ahora` anchor styled with `buttonVariants({ variant: "default", size: "lg" })` pointing to `laptop.affiliate_link` with `target="_blank" rel="noopener noreferrer"`
- Image+title+price top section (40/60 split) with image fallback showing brand name
- Tag pill row using `bg-secondary` styling consistent with CatalogCard
- 2-column tech specs grid with Lucide icons for all 8 dimensions (CPU, RAM, storage, GPU, battery, OS, screen, weight) — null specs filtered out
- Conditional influencer section showing "Recomendacion de experto" label, note text, and `{score}/10` only when `influencer_note` is truthy
- Escape key listener added via `useEffect` with cleanup

### Task 2: CatalogClient wiring + ResultLaptopCard fix (commit: 4cc6515)

Updated `src/components/catalog/catalog-client.tsx`:
- Added `AnimatePresence` and `DetailOverlay` imports
- Replaced `void activeLaptop; void handleCloseOverlay;` suppression with real `useEffect` body scroll lock (`overflow: hidden` when overlay open, cleaned up on unmount)
- Added `AnimatePresence > motion.div` at end of `<main>` with `initial={{ y: "100%" }}`, `animate={{ y: 0 }}`, `exit={{ y: "100%" }}`, `transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}`, `className="fixed inset-0 z-50 bg-background overflow-y-auto"` and `key={activeLaptop.id}`

Updated `src/components/quiz/result-laptop-card.tsx`:
- Changed `href={/catalog/${laptop.id}}` to `href={/catalog?laptop=${laptop.id}}`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all wired to real data.

## Checkpoint Required

Task 3 (`checkpoint:human-verify`) requires the user to visually verify the complete catalog experience at `http://localhost:3000/catalog` including the overlay animation, all spec sections, affiliate link, and browser-back close behavior.
