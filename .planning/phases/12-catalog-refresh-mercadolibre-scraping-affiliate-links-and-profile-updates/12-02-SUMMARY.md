---
phase: 12-catalog-refresh-mercadolibre-scraping-affiliate-links-and-profile-updates
plan: "02"
subsystem: scripts
tags: [scraping, mercadolibre, affiliate-links, orchestrator, pytest, python]
dependency_graph:
  requires: [12-01]
  provides: [scripts/refresh_basics.py, scripts/refresh_catalog.py]
  affects: [scripts/tests/test_affiliate.py, scripts/tests/test_stale_check.py, scripts/tests/test_scraper.py]
tech_stack:
  added: []
  patterns: [merge-duplicates upsert, PATCH-not-delete, fetch_fn injection for tests, module-global wrapping]
key_files:
  created:
    - scripts/refresh_basics.py
    - scripts/refresh_catalog.py
  modified:
    - scripts/tests/test_affiliate.py
    - scripts/tests/test_stale_check.py
    - scripts/tests/test_scraper.py
decisions:
  - "Pure helpers in refresh_basics.py, orchestrator in refresh_catalog.py — tests import basics directly without triggering CLI side effects"
  - "detect_stale_products uses is_active_fn injection point so tests avoid real HTTP calls"
  - "scrape_active_products wraps mlfa module-globals at one seam (mlfa._token) — single legacy state contact point"
  - "upsert payload omits influencer_note and recommendation_score — merge-duplicates preserves them without explicit send"
metrics:
  duration: "3min"
  completed_date: "2026-05-01"
  tasks: 2
  files: 5
---

# Phase 12 Plan 02: Catalog Refresh Orchestrator + Test Suite Summary

Single-command annual catalog refresh orchestrator with pure-helper extraction, end-to-end pipeline, and 17 passing tests (0 skipped, 0 failed).

## What Was Built

### scripts/refresh_basics.py (pure helpers, 95 lines)

Importable by tests without any network or file I/O at import time.

Public API:
- `QUALITY_LISTING_TYPES` — `{"gold_pro", "gold_special", "gold_premium"}` (same set as ml_fetch_active.py)
- `load_env(path=".env.local") -> dict` — parses KEY=VALUE dotenv file, returns `{}` if missing
- `make_affiliate_link(catalog_product_id, d2id) -> str` — builds `https://www.mercadolibre.com.ar/p/{id}?matt_d2id={d2id}` (omits `?matt_d2id` segment when d2id is falsy)
- `fetch(url, token=None, retries=4)` — HTTP GET with backoff, no module-global token state
- `is_product_active(catalog_product_id, token=None, fetch_fn=None) -> bool` — returns True iff at least one local quality listing exists; `fetch_fn` is test injection point

### scripts/refresh_catalog.py (orchestrator, 242 lines)

Single-command entry point: `python3 scripts/refresh_catalog.py`

Public pipeline functions:
- `scrape_active_products(brands, per_brand, ml_token=None) -> list[dict]` — delegates to ml_fetch_active, deduplicates by catalog_product_id
- `attach_affiliate_links(rows, d2id) -> list[dict]` — sets affiliate_link for all rows with catalog_product_id
- `fetch_db_catalog_rows(supabase_url, token) -> list[dict]` — reads existing DB rows via REST
- `detect_stale_products(db_rows, ml_token=None, is_active_fn=None) -> list[dict]` — finds rows whose products are no longer active; skips NULL catalog_product_id
- `flag_stale(stale_rows, supabase_url, token, dry_run=False) -> int` — PATCH availability_warning=true, never DELETE
- `upsert_to_db(rows, supabase_url, token, dry_run=False) -> int` — POST with `Prefer: resolution=merge-duplicates`; preserves influencer_note and recommendation_score by not sending them

## CLI Flags

```
python3 scripts/refresh_catalog.py [OPTIONS]

  --dry-run           Print planned writes without hitting Supabase
  --brands BRANDS     Comma-separated brand names, e.g. "apple,lenovo" (default: all)
  --per-brand N       Catalog products to query per brand (default: 20)
  --skip-stale-check  Skip /products/{id}/items checks against existing DB rows
  --no-upsert         Skip the upsert step
  --audit             Run scripts/check_recommendations.py at the end
```

### Example runs

```bash
# Dry-run Apple only (no DB writes)
python3 scripts/refresh_catalog.py --dry-run --brands apple --per-brand 5 --skip-stale-check --no-upsert

# Full dry-run (all brands, with stale check, with upsert preview)
python3 scripts/refresh_catalog.py --dry-run --brands apple --per-brand 5

# Annual full refresh (all brands, real DB writes)
python3 scripts/refresh_catalog.py

# After refresh, run audit
python3 scripts/refresh_catalog.py --audit
```

## Test Suite (17 tests, 100% green)

| File | Tests | Count |
|------|-------|-------|
| test_migration.py | test_migration_file_exists, test_migration_is_idempotent, test_partial_unique_index | 3 |
| test_affiliate.py | test_affiliate_link_format, test_affiliate_link_no_d2id, test_affiliate_link_none_d2id, test_affiliate_link_idempotent | 4 |
| test_stale_check.py | test_active_product_returns_true, test_empty_listings_returns_false, test_404_returns_false, test_only_international_returns_false, test_only_silver_returns_false, test_detect_stale_finds_stale_rows, test_detect_stale_skips_null_catalog_ids | 7 |
| test_scraper.py | test_scrape_active_products_smoke, test_scrape_dedupes_by_catalog_id, test_attach_affiliate_links_uses_d2id | 3 |

Run all tests:
```bash
python3 -m pytest scripts/tests/ -v
# Expected: 17 passed, 0 failed, 0 skipped
```

## Key Behaviors

- **Stale detection**: Products with `catalog_product_id IS NULL` (manually inserted, e.g. Mac Studio) are skipped entirely — only rows with a catalog ID are checked.
- **No deletes**: `flag_stale` issues PATCH requests setting `availability_warning=true`. DELETE is never used.
- **Merge-duplicates upsert**: `influencer_note` and `recommendation_score` are NOT included in the upsert payload — Supabase's `merge-duplicates` resolution preserves existing values on conflict.
- **Affiliate links**: `ML_AFFILIATE_D2ID` from `.env.local` is used to generate `?matt_d2id=` tracking parameter. If env var is missing, a warning is printed but links are generated without the parameter.

## Dependency on Plan 01

Plan 02 requires the `catalog_product_id` column and partial unique index created by Plan 01's migration (`supabase/migrations/06_add_catalog_product_id.sql`). This migration must be applied to the live Supabase database before running `refresh_catalog.py` in non-dry-run mode. Per the execution context, this migration has already been applied to production.

## Annual Runbook

1. Ensure `.env.local` has: `ML_CLIENT_ID`, `ML_SECRET`, `ML_AFFILIATE_D2ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Run a dry-run preview: `python3 scripts/refresh_catalog.py --dry-run --brands apple --per-brand 5`
3. If satisfied, run the full refresh: `python3 scripts/refresh_catalog.py`
4. Optionally audit results: `python3 scripts/refresh_catalog.py --audit`

## Open Issues

- Dry-run smoke test with real ML credentials was not executed in this plan (no live credential access during CI). The test suite covers all logic paths via monkeypatching.
- `scrape_active_products` calls `time.sleep(0.25)` per product — for a full refresh of all brands (36 search queries x 20 products each), expect ~15-30 minutes total runtime.

## Deviations from Plan

None — plan executed exactly as written. The Task 1/Task 2 split for `test_stale_check.py` was handled correctly: Task 1 wrote 5 is_product_active tests (no refresh_catalog import), Task 2 added 2 detect_stale tests that import refresh_catalog.

## Self-Check: PASSED
