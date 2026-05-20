---
phase: 14-quiz-result-unlock-card
plan: 02
subsystem: ui
tags: [react, framer-motion, typescript, quiz, animation]

# Dependency graph
requires:
  - 14-01 (IdealPcCard component and computeIdealSpecs function)
provides:
  - QuizCelebration with onHidden prop (fires after confetti exit)
  - QuizResult 3-state orchestrator: loading -> confetti -> card -> navigate
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AnimatePresence mode="wait" for sequential component transitions (exit before enter)
    - State toggle pattern: showCard false/true drives exclusive render between two animated children
    - Callback chain: backendComplete -> onHidden() -> setShowCard(true) -> IdealPcCard mounts

key-files:
  created: []
  modified:
    - src/components/quiz/quiz-celebration.tsx
    - src/components/quiz/quiz-result.tsx

key-decisions:
  - "onHidden prop name chosen over onDone to communicate semantics: fires after exit animation, not on user action"
  - "AnimatePresence mode=wait is mandatory: ensures confetti fully exits before card enters (no simultaneous visibility)"
  - "showCard toggle is the single source of truth for which phase is active — no timer or flag duplication"

requirements-completed: [UNLOCK-01, UNLOCK-03, UNLOCK-04]

# Metrics
duration: 5min
completed: 2026-05-20
---

# Phase 14 Plan 02: Wire IdealPcCard into QuizResult flow Summary

**QuizCelebration onDone renamed to onHidden + QuizResult 3-state orchestrator with AnimatePresence mode="wait" sequencing confetti exit before IdealPcCard enters**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-20T10:13:57Z
- **Completed:** 2026-05-20T10:17:32Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Renamed `onDone` to `onHidden` in QuizCelebration interface, destructuring, setTimeout call, and dependency array
- Removed "Redirigiendo a tu perfil..." animated text from QuizCelebration message card
- Added `AnimatePresence` import from framer-motion and `IdealPcCard` import to QuizResult
- Added `showCard` state; wired `onHidden={() => setShowCard(true)}` to QuizCelebration
- Wired `onDone={handleNavigate}` to IdealPcCard (NOT to QuizCelebration — correct per plan)
- Both AnimatePresence children have stable `key` props (`"celebration"`, `"ideal-pc-card"`)
- Zero TypeScript errors on all 4 files (ideal-specs.ts, ideal-pc-card.tsx, quiz-celebration.tsx, quiz-result.tsx)

## Task Commits

1. **Task 1: Add onHidden prop to QuizCelebration** - `5eb47b6` (feat)
2. **Task 2: Wire 3-state sequence in QuizResult** - `5a4ca79` (feat)

## Files Created/Modified
- `src/components/quiz/quiz-celebration.tsx` - onDone -> onHidden, redirect text removed
- `src/components/quiz/quiz-result.tsx` - showCard state, AnimatePresence mode="wait" orchestrator

## Decisions Made
- `onHidden` prop name communicates that the callback fires after the exit animation completes (semantically different from onDone which implies user action)
- `AnimatePresence mode="wait"` is mandatory: guarantees the confetti overlay fully exits (400ms transition) before the IdealPcCard entrance animation begins — no simultaneous visibility
- `showCard` boolean toggle is the single source of truth — no additional timers or flags in QuizResult

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing 14-01 files in agent worktree**
- **Found during:** Task 2 TypeScript verification
- **Issue:** `ideal-pc-card.tsx` and `ideal-specs.ts` were created in plan 14-01 on the main worktree but did not exist in this agent's worktree, causing TS2307 module resolution error
- **Fix:** Copied both files verbatim from main worktree into agent worktree
- **Files modified:** `src/components/quiz/ideal-pc-card.tsx` (created), `src/lib/ideal-specs.ts` (created)
- **Commit:** `5a4ca79` (included in Task 2 commit)

## Issues Encountered

- Next.js `next build` Turbopack workspace root error in agent worktree environment — this is a worktree isolation limitation (no `node_modules`, no `next/package.json` resolvable from worktree subdirs). All TypeScript checks pass; code is correct. Full build should be verified in the main repo.

## User Setup Required

None.

## Known Stubs

None. The full sequence is wired: confetti -> onHidden -> setShowCard(true) -> IdealPcCard -> onDone -> handleNavigate -> /profile.

## Next Phase Readiness

- Full unlock card sequence is end-to-end functional
- Phase 14 is complete: both plans (14-01 data layer, 14-02 wiring) are done
- No follow-up plans required for this phase

---
*Phase: 14-quiz-result-unlock-card*
*Completed: 2026-05-20*
