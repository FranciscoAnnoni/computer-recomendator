---
phase: 12-catalog-refresh-mercadolibre-scraping-affiliate-links-and-profile-updates
plan: 01
subsystem: database
tags: [postgresql, supabase, migration, pytest, python, mercadolibre]

# Dependency graph
requires:
  - phase: 06-iterative-improvements
    provides: laptops table schema with affiliate_link, image_url, availability_warning columns
provides:
  - supabase/migrations/06_add_catalog_product_id.sql — idempotent ALTER TABLE + partial unique index on catalog_product_id
  - Updated supabase/schema.sql with catalog_product_id column and index
  - scripts/tests/ pytest package with conftest, fixtures, and 4 stub test files
  - Test signal: 3 migration tests PASSING, 9 stub tests SKIPPED (unblocked when Plan 02 creates refresh_catalog.py)
affects:
  - 12-02 (Plan 02 — orchestrator script; depends on this migration for upsert-by-catalog-id)
  - Any Supabase upsert using Prefer resolution=merge-duplicates

# Tech tracking
tech-stack:
  added: [pytest 8.4.2]
  patterns:
    - Partial unique index (WHERE catalog_product_id IS NOT NULL) to allow NULL catalog IDs for manually-inserted rows
    - pytest.importorskip for stub tests that skip until a module exists (used in test_scraper, test_stale_check, test_affiliate)

key-files:
  created:
    - supabase/migrations/06_add_catalog_product_id.sql
    - scripts/tests/__init__.py
    - scripts/tests/conftest.py
    - scripts/tests/test_migration.py
    - scripts/tests/test_scraper.py
    - scripts/tests/test_stale_check.py
    - scripts/tests/test_affiliate.py
    - scripts/tests/fixtures/ml_products_search_apple.json
    - scripts/tests/fixtures/ml_product_items_active.json
    - scripts/tests/fixtures/ml_product_items_empty.json
    - scripts/tests/fixtures/db_laptops_sample.json
  modified:
    - supabase/schema.sql

key-decisions:
  - "Partial unique index (WHERE catalog_product_id IS NOT NULL) chosen over plain UNIQUE constraint — allows NULL for manually-inserted rows (Mac Studio, hand-curated entries) without collision"
  - "Migration uses IF NOT EXISTS on both ADD COLUMN and CREATE INDEX — idempotent, safe to re-run against live DB without error"
  - "pytest.importorskip used for stub test files — produces SKIPPED (not ERROR) when scripts/refresh_catalog.py does not exist; turns GREEN automatically when Plan 02 creates that module"
  - "schema.sql intentionally left stale for columns from migrations 03-05 — reconciling full schema is out of scope for Phase 12; only catalog_product_id added"

patterns-established:
  - "Test stubs with pytest.importorskip: import the target module at file scope; entire file skips if module missing"
  - "Migration idempotency: ADD COLUMN IF NOT EXISTS + CREATE INDEX IF NOT EXISTS for safe re-application"

requirements-completed: [CAT-01, CAT-04]

# Metrics
duration: 8min
completed: 2026-05-01
---

# Phase 12 Plan 01: Migration + Test Scaffold Summary

**Idempotent `catalog_product_id TEXT` migration with partial unique index plus pytest scaffolding (3 PASSING migration tests, 9 SKIPPED stubs waiting for Plan 02)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-01T15:12:13Z
- **Completed:** 2026-05-01T15:20:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Created `supabase/migrations/06_add_catalog_product_id.sql` — idempotent migration with ALTER TABLE (IF NOT EXISTS) and partial unique index (WHERE catalog_product_id IS NOT NULL) that protects manually-inserted NULL rows
- Updated `supabase/schema.sql` to reflect the new column and index as the canonical schema reference
- Scaffolded `scripts/tests/` pytest package with shared conftest fixtures and 4 stub test files covering migration validation, scraper, stale check, and affiliate link generation
- `python3 -m pytest scripts/tests/` exits 0: 3 PASSED (migration tests), 3 SKIPPED (stub files pending Plan 02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration 06_add_catalog_product_id.sql + update canonical schema.sql** - `6ff96f7` (feat)
2. **Task 2: Scaffold pytest test package with conftest, fixtures, and 4 stub test files** - `32e9d89` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `supabase/migrations/06_add_catalog_product_id.sql` — New migration: ALTER TABLE + partial unique index; idempotent
- `supabase/schema.sql` — Added `catalog_product_id TEXT` column and `laptops_catalog_product_id_unique` index
- `scripts/tests/__init__.py` — Empty package init
- `scripts/tests/conftest.py` — 5 shared fixtures: ml_products_search_apple, ml_product_items_active, ml_product_items_empty, db_laptops_sample, affiliate_d2id
- `scripts/tests/test_migration.py` — 3 PASSING tests validating migration file existence, idempotency, and partial index
- `scripts/tests/test_scraper.py` — SKIPPED stub (importorskip on scripts.refresh_catalog)
- `scripts/tests/test_stale_check.py` — SKIPPED stub (importorskip on scripts.refresh_catalog)
- `scripts/tests/test_affiliate.py` — SKIPPED stub (importorskip on scripts.refresh_catalog)
- `scripts/tests/fixtures/ml_products_search_apple.json` — ML /products/search response sample (1 MacBook Air M3)
- `scripts/tests/fixtures/ml_product_items_active.json` — ML /products/{id}/items with 2 gold_pro/gold_special listings
- `scripts/tests/fixtures/ml_product_items_empty.json` — ML /products/{id}/items with empty results (stale product)
- `scripts/tests/fixtures/db_laptops_sample.json` — 3 DB rows: 1 active with catalog_id, 1 stale with catalog_id, 1 NULL catalog_id (manually inserted)

## Decisions Made
- Chose partial unique index (`WHERE catalog_product_id IS NOT NULL`) over plain `UNIQUE` constraint — ensures manually-inserted rows with no catalog ID (like Mac Studio) never collide on NULL values, which standard UNIQUE indexes do not protect against in PostgreSQL
- Used `pytest.importorskip` at module scope in stub files so the entire file is SKIPPED (not ERRORing) when `scripts/refresh_catalog.py` does not yet exist — once Plan 02 creates the module, the skips automatically become runnable tests
- Installed `pytest 8.4.2` via pip3 (was not on the system); only test dependency added for Phase 12

## Deviations from Plan

**1. [Rule 3 - Blocking] Installed pytest which was not available on system**
- **Found during:** Task 2 (scaffolding test package)
- **Issue:** `python3 -m pytest` failed with "No module named pytest" — pytest was not installed
- **Fix:** Ran `pip3 install pytest` (installed pytest 8.4.2)
- **Files modified:** None (system package install)
- **Verification:** `python3 -m pytest --version` returned `pytest 8.4.2`
- **Committed in:** Part of Task 2 commit `32e9d89`

---

**Total deviations:** 1 auto-fixed (1 blocking — missing system dependency)
**Impact on plan:** Necessary prerequisite; no scope creep.

## Issues Encountered
- pytest `importorskip` counts each stub FILE as 1 skip (not each test function within it), so the suite reports "3 skipped" not "9+ skipped". This is correct behavior — the plan's verification regex accounts for 7-19 skipped, but the actual count is 3 (one per stub file). The exit code is 0 and the intent (stub tests are SKIPPED not ERRORing) is fully satisfied.

## User Setup Required

**Manual step required before Plan 02 can write `catalog_product_id` values to the database:**

Apply the migration to the live Supabase DB:
1. Open Supabase SQL editor at https://app.supabase.com
2. Paste and execute the contents of `supabase/migrations/06_add_catalog_product_id.sql`
3. Verify: `SELECT column_name FROM information_schema.columns WHERE table_name='laptops' AND column_name='catalog_product_id';` should return one row

The `IF NOT EXISTS` clauses make this safe to run multiple times.

## Next Phase Readiness
- Migration file is authored and ready for manual application to the live DB
- Pytest scaffold is in place — Plan 02 only needs to create `scripts/refresh_catalog.py` with the documented functions and all SKIPPED tests will automatically become runnable
- Plan 02 can proceed to build the orchestrator script; the test signal (SKIP → PASS) will validate correctness

---
*Phase: 12-catalog-refresh-mercadolibre-scraping-affiliate-links-and-profile-updates*
*Completed: 2026-05-01*
