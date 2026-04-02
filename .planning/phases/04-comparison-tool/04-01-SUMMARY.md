---
phase: 04-comparison-tool
plan: "01"
subsystem: compare-ui
tags: [comparison, slots, framer-motion, next-route]
dependency_graph:
  requires: [catalog-data, laptop-types, utils-cn]
  provides: [compare-route, comparator-client, compare-components]
  affects: [navbar-links]
tech_stack:
  added: []
  patterns: [slot-state-management, random-prefill, responsive-column-layout, AnimatePresence-popLayout]
key_files:
  created:
    - src/app/compare/page.tsx
    - src/components/compare/comparator-client.tsx
    - src/components/compare/compare-card.tsx
    - src/components/compare/compare-spec-row.tsx
    - src/components/compare/empty-slot.tsx
  modified: []
decisions:
  - "pickerSlotIndex and handleSelectLaptop stubbed in ComparatorClient for Plan 02 wiring"
  - "void handleSelectLaptop used to suppress TS unused variable warning until Plan 02"
  - "3rd slot appears only on desktop (>=640px) when both slot 0 and slot 1 are filled"
metrics:
  duration: 8min
  completed_date: "2026-04-02T23:45:17Z"
  tasks_completed: 2
  files_created: 5
---

# Phase 04 Plan 01: Comparison Tool — Core Slot UI Summary

Slot-based /compare page with pre-filled random laptop, dashed empty slot, bracket-style spec rows, X remove button, and framer-motion slot transitions.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create CompareSpecRow, CompareCard, and EmptySlot components | 96b6a24 | compare-spec-row.tsx, compare-card.tsx, empty-slot.tsx |
| 2 | Create ComparatorClient orchestrator and /compare route | 3a0227b | comparator-client.tsx, compare/page.tsx |

## What Was Built

The `/compare` route is now navigable and renders a full slot-based comparison UI:

- **CompareSpecRow** — bracket-style spec row `[ label: value ]` with `border-t border-border` dividers between rows.
- **CompareCard** — filled slot card showing laptop image, name, and 5 spec rows (GPU, CPU, RAM, Alma/Storage, Precio), with an absolute-positioned X button to remove.
- **EmptySlot** — dashed border card with a `+` icon and "Seleccionar PC N..." label, fully clickable as a button.
- **ComparatorClient** — client orchestrator managing slot state, random pre-fill of slot 1 on load, desktop detection at 640px breakpoint, derived 3rd slot display, slot removal, and `openPicker` stub for Plan 02.
- **compare/page.tsx** — server component route with Suspense wrapper, no `<main>` wrapper, no `"use client"`.

## Decisions Made

1. **pickerSlotIndex stub for Plan 02** — `openPicker` sets `pickerSlotIndex` state but Plan 02 will render the `LaptopPicker` modal that reads it.
2. **void handleSelectLaptop** — TypeScript would warn about the unused function; `void handleSelectLaptop` suppresses this cleanly until Plan 02 wires it.
3. **640px breakpoint** — The compare page uses `sm:` breakpoint (640px) matching the 3-column layout per plan spec, not the 768px used in filter-drawer.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- **openPicker** in `src/components/compare/comparator-client.tsx` — sets `pickerSlotIndex` but no picker modal is rendered yet. Clicking "+" cards sets the index silently. Plan 02 will wire the LaptopPicker component to read `pickerSlotIndex !== null`.

## Self-Check: PASSED

All 5 files created and confirmed on disk. Both task commits (96b6a24, 3a0227b) verified in git log.
