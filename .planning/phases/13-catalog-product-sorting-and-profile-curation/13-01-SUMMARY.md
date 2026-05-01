---
phase: 13-catalog-product-sorting-and-profile-curation
plan: 01
subsystem: database
tags: [python, supabase, pytest, curation, scoring, profiles, laptops]

# Dependency graph
requires:
  - phase: 12-catalog-refresh-mercadolibre-scraping-affiliate-links-and-profile-updates
    provides: scripts/refresh_basics.py with load_env, 55 live laptops in Supabase, 17 tests passing

provides:
  - scripts/curate_profiles.py — 3-stage pipeline (enrich scores + notes, select 5 per profile, PATCH laptop_ids)
  - scripts/tests/test_curate_profiles.py — 8 unit tests (all passing)
  - scripts/tests/conftest.py — extended with sample_laptops (20 entries) and sample_profiles (4 entries)

affects:
  - 13-02 (apply mode run against live Supabase to populate 81 profiles.laptop_ids)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pytest.importorskip for Wave 0 stubs that SKIP cleanly before script exists"
    - "Module-level pure helpers importable without triggering CLI side effects"
    - "3-stage orchestrator: enrich -> select -> assign, dry-run vs apply via argparse"
    - "Brand diversity cap (max 2 per brand) enforced in select loop"
    - "OS filter first: macos profile -> macOS pool only, else Windows pool"
    - "GPU filter: gaming + windows requires has_dedicated_gpu, documented gap for gaming + macos"

key-files:
  created:
    - scripts/curate_profiles.py
    - scripts/tests/test_curate_profiles.py
  modified:
    - scripts/tests/conftest.py

key-decisions:
  - "EFFECTIVE_TIERS uses 600k / 1.5M boundaries (from 13-RESEARCH.md), NOT stale CONTEXT.md values (260k / 550k)"
  - "score_laptop caps at [1, 10] with deterministic algorithm: affiliate link +2, note presence +1, description quality +1, GPU tier +1/+2, RAM +1/-1"
  - "gaming + macos gap explicitly logged in dry-run output rather than filtering to no results"
  - "Non-canonical affiliate links demoted so rank #1 always has canonical mercadolibre.com.ar/p/MLA link"
  - "default mode is --dry-run (no --apply flag needed); --apply required to write to Supabase"

patterns-established:
  - "fetch_laptops and fetch_profiles at module top level so tests can monkeypatch without import tricks"
  - "Pure helpers (score_laptop, has_dedicated_gpu, select_laptops_for_profile) callable from tests with dict args"
  - "generate_influencer_note guarantees >=30 chars by appending fallback text if needed"

requirements-completed: [REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07]

# Metrics
duration: 12min
completed: 2026-05-01
---

# Phase 13 Plan 01: Curate Profiles Script Summary

**Deterministic profile curation pipeline: score_laptop (1-10), OS/GPU/budget/brand-diversity selection for all 81 profiles, 8 pytest tests all green**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-01T21:45:59Z
- **Completed:** 2026-05-01T21:58:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Built `scripts/curate_profiles.py` (369 lines) with all 9 module-level exports and 3-stage pipeline
- Created 8 unit tests with pytest.importorskip pattern — zero SKIPs, zero FAILs after Task 2
- Extended conftest.py with 20-laptop and 4-profile fixtures covering all OS/workload/budget combos
- All 25 tests across the full test suite pass (Phase 12 + Phase 13, zero regression)

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 pytest stub file with 7 tests + conftest fixtures** - `7e505ae` (test)
2. **Task 2: Build scripts/curate_profiles.py — 3-stage script** - `23c65be` (feat)

## Files Created/Modified

- `scripts/curate_profiles.py` — 3-stage orchestrator with all module-level pure helpers (369 lines)
- `scripts/tests/test_curate_profiles.py` — 8 unit tests via importorskip (8 passed, 0 skipped)
- `scripts/tests/conftest.py` — Extended with sample_laptops (20 entries) and sample_profiles (4 entries) fixtures

## Decisions Made

- EFFECTIVE_TIERS boundaries: 600k (esencial max) / 1.5M (equilibrado max) per 13-RESEARCH.md — NOT the stale values in CONTEXT.md
- Canonical affiliate link pattern: `mercadolibre.com.ar/p/MLA\d+\?matt_d2id=` used for both scoring (+2 points) and rank #1 demotion guard
- gaming + macos gap: logged in output rather than crashing — Macs have no dedicated GPU so best-available macOS laptops assigned
- Default mode is --dry-run; --apply flag required to write; in dry-run, zero PATCH calls (verified by test)

## Deviations from Plan

None - plan executed exactly as written. The 8th test function count matches what the test file actually contains (plan mentioned "7 tests" in narrative but listed 8 test function names in acceptance criteria — all 8 are implemented and pass).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Plan 13-02 will run `--apply` against live Supabase.

## Next Phase Readiness

- `scripts/curate_profiles.py` ready to run with `python3 scripts/curate_profiles.py --dry-run` (requires .env.local with Supabase URL + key)
- `--apply` mode will score all 55 laptops and populate `profiles.laptop_ids` for all 81 profiles
- Plan 13-02 should run `--apply` then verify each profile has exactly 5 laptop UUIDs in the live DB

## Known Stubs

None - no hardcoded stubs or placeholder data in the implementation. All functions are fully wired.

---
*Phase: 13-catalog-product-sorting-and-profile-curation*
*Completed: 2026-05-01*
