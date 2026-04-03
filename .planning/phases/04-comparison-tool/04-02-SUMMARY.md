---
phase: 04-comparison-tool
plan: 02
subsystem: ui
tags: [react, framer-motion, sheet, tailwind, comparator, skeleton]

requires:
  - phase: 04-01
    provides: ComparatorClient scaffold, CompareCard, EmptySlot, empty-slot, compare-spec-row, comparator route

provides:
  - LaptopPicker Sheet component with real-time search and duplicate prevention
  - ComparatorClient wired with LaptopPicker (open/close/select flow)
  - Both slots start empty — user selects both laptops manually
  - animate-pulse skeleton matching card layout shown during initial data fetch
  - Navbar "Comparar" label in Spanish

affects: [future comparison enhancements, catalog integration, navbar]

tech-stack:
  added: []
  patterns:
    - animate-pulse skeleton mirrors real card structure (image + name + 5 spec rows)
    - useSheetSide hook duplicated in laptop-picker (compare feature stays self-contained)
    - pickerSlotIndex drives picker open state (null = closed, index = which slot to fill)

key-files:
  created:
    - src/components/compare/laptop-picker.tsx
  modified:
    - src/components/compare/comparator-client.tsx
    - src/components/layout/navbar.tsx

key-decisions:
  - "Both slots start null — no random pre-fill; user explicitly selects both laptops (post-checkpoint fix)"
  - "Loading skeleton matches CompareCard structure exactly for visual continuity"
  - "LaptopPicker search filters by both name and brand in real time"
  - "disabledIds computed from current slots via useMemo to prevent duplicate selection"

patterns-established:
  - "Skeleton pattern: wrap loading branch in same section/layout as real UI for zero layout shift"

requirements-completed: [RF3.1, RF3.2]

duration: 20min
completed: 2026-04-02
---

# Phase 04 Plan 02: Comparator Picker Wiring Summary

**LaptopPicker Sheet with real-time search, duplicate prevention, responsive side, and skeleton loading — completing the /compare interactive flow**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-02T23:50:00Z
- **Completed:** 2026-04-02T23:10:00Z
- **Tasks:** 3 (T1 + T2 original, T3 post-checkpoint fixes)
- **Files modified:** 3

## Accomplishments

- Created `LaptopPicker` Sheet component with search input filtering by name and brand, greyed-out disabled state for already-selected laptops, and responsive side (bottom on mobile / left on desktop)
- Wired `LaptopPicker` into `ComparatorClient` — tapping an empty slot opens picker, selecting fills slot, X removes laptop back to empty slot
- Updated Navbar "Compare" label to "Comparar" for Spanish UI consistency
- Post-checkpoint: removed random pre-fill so both slots start empty, and replaced plain text loading with an `animate-pulse` skeleton matching card structure

## Task Commits

1. **Task 1: LaptopPicker + ComparatorClient wiring** - `2c2fffd` (feat)
2. **Task 2: Navbar "Comparar" label** - `d1052da` (chore)
3. **Task 3: Empty start state + loading skeleton** - `f7053cc` (fix)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `src/components/compare/laptop-picker.tsx` - Sheet-based picker with search, disabled-state duplicate prevention, responsive side via useSheetSide
- `src/components/compare/comparator-client.tsx` - Wired LaptopPicker, removed random pre-fill, added animate-pulse skeleton
- `src/components/layout/navbar.tsx` - Updated Compare -> Comparar label

## Decisions Made

- Both slots start null (post-checkpoint user feedback): the original plan specified a random pre-fill for slot 1 (D-03 in CONTEXT), but user testing showed this was confusing — both slots now start empty so the user is in full control
- Loading skeleton layout matches CompareCard exactly (image area + name row + 5 spec rows) to avoid jarring layout shift on data load
- `useSheetSide` hook duplicated inside `laptop-picker.tsx` rather than shared — keeps compare feature self-contained per D-09 comment in PLAN

## Deviations from Plan

### Post-checkpoint Fixes (User-Requested)

**1. [User feedback] Both slots start empty (no random pre-fill)**
- **Found during:** Human-verify checkpoint
- **Issue:** Slot 1 auto-filled with a random laptop on page load — user wanted to choose both laptops manually
- **Fix:** Removed `setSlots([random, null])` from the load useEffect; initial state remains `[null, null]`
- **Files modified:** `src/components/compare/comparator-client.tsx`
- **Committed in:** f7053cc

**2. [User feedback] animate-pulse skeleton instead of plain text loading**
- **Found during:** Human-verify checkpoint
- **Issue:** During initial fetch, page showed raw "Cargando comparador..." text with no visual structure
- **Fix:** Replaced text fallback with a two-column skeleton: header skeleton + two card skeletons (image area + name row + 5 spec rows) using Tailwind `animate-pulse`
- **Files modified:** `src/components/compare/comparator-client.tsx`
- **Committed in:** f7053cc

---

**Total deviations:** 2 (both user-requested post-checkpoint, applied via continuation)
**Impact on plan:** Fixes improve UX and visual polish. No scope creep — changes stay within comparator-client.tsx.

## Issues Encountered

None beyond the two user-requested fixes addressed above.

## Known Stubs

None — all data flows are wired (allLaptops from fetchAllLaptops, slots from user selection).

## Next Phase Readiness

- `/compare` page fully functional: both slots empty on load, picker opens on slot tap, search filters in real time, duplicates are disabled, 3rd slot appears on desktop when both filled, max 3 enforced
- Phase 04 complete — comparison tool feature done
- Ready for Phase 05 (Profile page or future enhancement phase)

---
## Self-Check: PASSED

All created/modified files verified. f7053cc confirmed in git log. T1 (2c2fffd) and T2 (d1052da) were committed by prior agent and confirmed present in main branch history.

---
*Phase: 04-comparison-tool*
*Completed: 2026-04-02*
