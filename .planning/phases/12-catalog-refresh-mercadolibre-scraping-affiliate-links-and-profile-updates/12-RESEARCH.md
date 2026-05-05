# Phase 12: Catalog Refresh — MercadoLibre Scraping, Affiliate Links, and Profile Updates - Research

**Researched:** 2026-05-01
**Domain:** MercadoLibre Argentina API, Supabase, Python scripting
**Confidence:** HIGH (based on direct code review of existing working scripts + verified API patterns)

## Summary

The project already has a mature, working scraping stack targeting the MercadoLibre Argentina public API. Four Python scripts exist and cover the full lifecycle: catalog product discovery (`ml_fetch_active.py`), price enrichment (`ml_enrich_prices.py`), and DB import (`ml_import_db.py`). The current scripts are functional but have no "refresh" mode — they only insert, never update or retire stale records. The annual refresh workflow needs to: (1) re-run the scrape, (2) detect which products in the DB no longer have active quality listings on ML, and (3) auto-append affiliate parameters to product permalinks.

The key insight is that "inactive seller" detection is already solved: calling `GET /products/{catalog_product_id}/items` returns `{}` or 404 when no quality listing exists. This is already the gate used in `ml_fetch_active.py`. The same check, run against existing DB records, tells us which rows to flag or delete.

The affiliate link situation has two tiers: a manual workflow (visit permalink → copy link from ML dashboard) used by most existing scripts, and an auto-append pattern already proven in `ml_scrape_new.py` using the parameter `?matt_d2id={AFFILIATE_D2ID}`. The value `ML_AFFILIATE_D2ID` is already in `.env.local`. The correct affiliate link format for catalog products is `https://www.mercadolibre.com.ar/p/{catalog_product_id}?matt_d2id={uuid}`.

**Primary recommendation:** Build a single `python3 scripts/ml_refresh_catalog.py` orchestrator that wraps the existing scripts into a pipeline: scrape → detect stale → upsert active → generate affiliate links automatically. No UI changes needed.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Python stdlib (`urllib`, `json`, `pathlib`) | 3.9+ | HTTP calls, JSON parsing, file I/O | Already used in all existing scripts — zero new dependencies |
| Supabase REST API (via urllib) | v1 | DB upsert/update | Already used in `ml_import_db.py` — no additional SDK needed |
| MercadoLibre public API | v2 | Product/item data | Already authenticated and working; `ML_CLIENT_ID` and `ML_SECRET` in `.env.local` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `argparse` (stdlib) | 3.9+ | CLI flags for one-command run | Already used; add `--dry-run`, `--brands`, `--refresh` flags |
| `time.sleep` (stdlib) | 3.9+ | Rate limit compliance | 0.25–0.3s between calls, 5–8s on 429 — already implemented |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| stdlib urllib | `requests` library | `requests` is cleaner but adds a dependency; stdlib works fine for this |
| Supabase anon key upsert | Supabase service_role key | Service role bypasses RLS and allows bulk operations — useful if needed for updates |

**Installation:**
```bash
# No new dependencies — pure Python 3.9+ stdlib only
python3 --version  # verify 3.9+
```

**Version verification:** Python 3.9.6 confirmed on machine.

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── ml_fetch_active.py         # Existing: scrape active catalog products
├── ml_enrich_prices.py        # Existing: enrich with prices
├── ml_import_db.py            # Existing: upsert to Supabase
├── ml_scrape_new.py           # Existing: targeted store/product scraping
├── check_recommendations.py   # Existing: audit affiliate link health
└── ml_refresh_catalog.py      # NEW: orchestrator for annual refresh

ml_data_active/                # Existing: per-brand JSON output from ml_fetch_active
ml_data_enriched/              # Existing: enriched JSON with prices
```

### Pattern 1: Refresh-Mode Upsert
**What:** Instead of DELETE + INSERT (destructive), use Supabase's `ON CONFLICT (catalog_product_id) DO UPDATE` to update existing rows and insert new ones. Requires adding `catalog_product_id` column to the `laptops` table as a unique constraint.

**When to use:** Every refresh run — preserves manually-edited fields like `influencer_note` while updating price, image, affiliate_link, availability_warning.

**The gap today:** The current `laptops` table has no `catalog_product_id` column (see schema.sql). This column must be added in a migration before upsert-by-catalog-id is possible.

**Example:**
```python
# Source: ml_import_db.py pattern, extended for upsert
req = urllib.request.Request(
    f"{supabase_url}/rest/v1/laptops",
    data=json.dumps(rows).encode(),
    method="POST",
    headers={
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",  # upsert mode
    },
)
```

### Pattern 2: Stale Seller Detection
**What:** For each `catalog_product_id` in the DB, call `GET /products/{id}/items?limit=5`. If response is `None` (404) or `results` is empty, mark the product as unavailable. Uses the exact same logic already proven in `ml_fetch_active.py::get_best_item()`.

**When to use:** During refresh run, after fetching new data. Run against existing DB rows to find which products no longer have active quality sellers.

**Example:**
```python
# Source: ml_fetch_active.py::get_best_item() — already verified working
def is_product_active(catalog_product_id: str) -> bool:
    url = f"{ML_API}/products/{catalog_product_id}/items?limit=20"
    data = fetch(url)
    if not data or not data.get("results"):
        return False
    QUALITY = {"gold_pro", "gold_special", "gold_premium"}
    return any(
        item.get("listing_type_id") in QUALITY
        and item.get("international_delivery_mode", "none") == "none"
        for item in data["results"]
    )
```

### Pattern 3: Affiliate Link Auto-Generation
**What:** Append `?matt_d2id={ML_AFFILIATE_D2ID}` to the ML catalog product permalink. This is already done in `ml_scrape_new.py` and the AFFILIATE_D2ID is stored in `.env.local` as `ML_AFFILIATE_D2ID`.

**When to use:** Whenever a new product is added or when refreshing existing products that have empty or stale affiliate_link.

**Example:**
```python
# Source: ml_scrape_new.py::product_to_laptop() — already proven pattern
AFFILIATE_D2ID = os.environ.get("ML_AFFILIATE_D2ID", "")

def make_affiliate_link(catalog_product_id: str) -> str:
    base = f"https://www.mercadolibre.com.ar/p/{catalog_product_id}"
    if AFFILIATE_D2ID:
        return f"{base}?matt_d2id={AFFILIATE_D2ID}"
    return base
```

**Important:** The `check_recommendations.py` audit shows existing records use this exact format: `https://www.mercadolibre.com.ar/p/MLA37740033?matt_d2id=...`. This confirms the format is correct and already in production use.

### Pattern 4: One-Command Orchestrator
**What:** A single `ml_refresh_catalog.py` script that runs the full pipeline: scrape → enrich → detect stale → upsert.

**Example structure:**
```python
# Pseudocode for orchestrator
def main():
    # 1. Scrape fresh catalog products (calls ml_fetch_active logic)
    scrape_active_products(brands=args.brands, out_dir="ml_data_active")
    
    # 2. Enrich with prices (calls ml_enrich_prices logic)
    enrich_prices(in_dir="ml_data_active", out_dir="ml_data_enriched")
    
    # 3. Auto-generate affiliate links
    attach_affiliate_links(data_dir="ml_data_enriched")
    
    # 4. Detect stale products in DB
    stale_ids = detect_stale_products_in_db(supabase_url, supabase_token)
    
    # 5. Mark stale as unavailable / delete
    handle_stale(stale_ids, mode=args.stale_mode)  # "flag" or "delete"
    
    # 6. Upsert fresh data
    upsert_to_db(data_dir="ml_data_enriched", supabase_url, supabase_token)
```

### Anti-Patterns to Avoid
- **DELETE + INSERT on full table:** Destroys manually-curated `influencer_note` and `recommendation_score` edits. Use upsert by `catalog_product_id`.
- **Scraping listing HTML pages:** ML renders with JS — HTML scraping of listing pages (used in `ml_scrape_new.py`'s store approach) returns incomplete results. The `/products/search` API is the correct approach.
- **Using `/sites/MLA/search` with client_credentials:** This endpoint is documented as blocked for client_credentials grants (note in `ml_fetch_active.py` docstring). Use `/products/search` instead.
- **Ignoring `international_delivery_mode`:** International listings are lower quality for Argentine buyers. `ml_fetch_active.py` already filters local-first — preserve this.
- **Setting affiliate_link manually for bulk runs:** The `ml_scrape_new.py` pattern proves auto-generation via `?matt_d2id=` works. Manual workflow is only needed for non-catalog-product items.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Custom backoff | Existing `fetch()` in scripts | Already handles 429 with exponential backoff + configurable wait |
| Catalog product dedup | Custom hash/fingerprint | `catalog_product_id` as unique key | ML catalog IDs are stable identifiers — dedup by ID is reliable |
| Affiliate link validation | HTTP checker | `check_recommendations.py::check_link()` | Already handles ML redirect patterns, bot-block detection, bad destinations |
| Brand attribute filtering | String matching on title | ML `BRAND` attribute from `attributes[]` | `_get_attr(attrs, "BRAND")` is already implemented and tested in all scripts |

**Key insight:** Almost all required logic exists in the four existing Python scripts. Phase 12 is primarily about composition (orchestrator script) and adding the upsert migration, not building new capabilities.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Supabase `laptops` table — existing rows have `catalog_product_id` as text in JSON but NOT as a DB column | Add migration: `ALTER TABLE laptops ADD COLUMN catalog_product_id TEXT UNIQUE` — required for upsert-by-id |
| Stored data | `ml_data/`, `ml_data_active/`, `ml_data_enriched/` — existing JSON caches on disk | Safe to overwrite during refresh run; no migration needed |
| Stored data | `scripts/recommendation_audit.json` — last audit snapshot (2026-04-10) | Re-run `check_recommendations.py` after refresh to validate new data |
| Live service config | Supabase `laptops` table — 55+ rows with `influencer_note` and `recommendation_score` manually curated | Must use upsert (not truncate+insert) to preserve manually-edited fields |
| OS-registered state | None — no cron jobs, systemd units, or scheduled tasks detected | None |
| Secrets/env vars | `.env.local`: `ML_CLIENT_ID`, `ML_SECRET`, `ML_AFFILIATE_D2ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All present. New orchestrator reads from same `.env.local` — no changes needed |
| Build artifacts | `ml_data_enriched/` — stale from previous enrichment run | Safe to overwrite; orchestrator should write fresh output |

**Critical missing DB column:** The `laptops` table schema (see `supabase/schema.sql`) does NOT have a `catalog_product_id` column. All existing scripts store this ID in JSON but never push it to Supabase — the DB import (`ml_import_db.py::to_db_row()`) drops it. Adding this column with a UNIQUE constraint is the prerequisite migration for idempotent refresh runs.

## Common Pitfalls

### Pitfall 1: No Upsert Key — Full Table Replacement Risk
**What goes wrong:** Running `--clear` flag in `ml_import_db.py` deletes all DB rows before inserting. Any manually-added `influencer_note`, curated `recommendation_score`, or profile assignments are lost.
**Why it happens:** The original import script was designed for initial population, not refresh.
**How to avoid:** Add `catalog_product_id TEXT UNIQUE` to the schema. Use Supabase's `Prefer: resolution=merge-duplicates` header with POST to upsert. Never use `--clear` in refresh mode.
**Warning signs:** If the plan calls for `--clear` or `DELETE FROM laptops`, that's the destructive pattern.

### Pitfall 2: Missing catalog_product_id for Non-Catalog Items
**What goes wrong:** Some DB rows (especially manually inserted ones, like the Mac Studio seen in audit) may have `affiliate_link` pointing to a listing item URL (e.g., `.../mini-pc-apple-mac-studio...`) rather than a catalog product URL (`/p/MLA...`). These rows have no stable `catalog_product_id` to upsert against.
**Why it happens:** Manual DB population and the JS script (`ml-fetch-laptops.js`) didn't use catalog product IDs.
**How to avoid:** During refresh, identify rows with no `catalog_product_id` and handle separately (keep as-is, or manually refresh). The orchestrator should only upsert catalog-sourced rows.
**Warning signs:** `affiliate_link` URLs that don't contain `/p/MLA`.

### Pitfall 3: /products/search Returns status=active Products with No Active Sellers
**What goes wrong:** A product can be `status=active` in the product catalog but have zero active quality sellers (all gold_pro/gold_special listings expired). The scrape fetches the product but `get_best_item()` returns None.
**Why it happens:** "Product catalog active" != "seller listing active". These are separate statuses.
**How to avoid:** Always check `/products/{id}/items` after fetching from `/products/search`. This two-step verification is already implemented in `ml_fetch_active.py` — preserve it in the orchestrator.
**Warning signs:** `found_active` count much lower than `products queried` in script output.

### Pitfall 4: Rate Limit Amplification in Refresh Mode
**What goes wrong:** Refresh checks each existing DB row (potentially 200+ rows) against `/products/{id}/items` for stale detection, PLUS runs the normal brand scrape. Total API calls can exceed 500+ in one run.
**Why it happens:** Combining "check existing rows" with "fetch new data" doubles API volume.
**How to avoid:** Stagger calls with `time.sleep(0.25)`. The 1500 req/min limit (from ML docs) means 25 req/sec — the existing 0.25s sleep keeps the script well within limits. Add `--skip-stale-check` flag for faster runs.
**Warning signs:** Frequent 429 errors with longer backoff times required.

### Pitfall 5: Affiliate Link Format Confusion
**What goes wrong:** Two different affiliate link formats exist in the codebase: (1) `?matt_d2id=UUID` (used in `ml_scrape_new.py`) and (2) manual links from the ML affiliate dashboard that use `?matt_tool=` style. Both are valid but different tracking mechanisms.
**Why it happens:** The ML affiliate program launched in Argentina in late 2025 and introduced a new dashboard-based link format. The older `matt_d2id` parameter is the programmatic API approach.
**How to avoid:** Use `?matt_d2id={ML_AFFILIATE_D2ID}` for auto-generated links. The value is already in `.env.local`. Don't overwrite existing dashboard-generated links if they're already set.
**Warning signs:** Mixing link formats in the same DB run.

## Code Examples

Verified patterns from existing project scripts:

### Stale Product Detection (check existing DB rows)
```python
# Pattern from ml_fetch_active.py::get_best_item() — adapted for refresh
QUALITY_LISTING_TYPES = {"gold_pro", "gold_special", "gold_premium"}

def check_product_active(catalog_product_id: str, token: str) -> bool:
    """Returns True if the product has at least one quality local seller."""
    url = f"https://api.mercadolibre.com/products/{catalog_product_id}/items?limit=20"
    data = fetch(url, token)
    if not data or not data.get("results"):
        return False
    for item in data["results"]:
        if (item.get("listing_type_id") in QUALITY_LISTING_TYPES
                and item.get("international_delivery_mode", "none") == "none"):
            return True
    return False
```

### Supabase Upsert (requires catalog_product_id UNIQUE column)
```python
# Supabase POST with merge-duplicates — requires UNIQUE constraint on catalog_product_id
def upsert_batch(base_url: str, token: str, rows: list):
    req = urllib.request.Request(
        f"{base_url}/rest/v1/laptops",
        data=json.dumps(rows).encode(),
        method="POST",
        headers={
            "apikey": token,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()
```

### Affiliate Link Auto-Generation
```python
# Source: ml_scrape_new.py::product_to_laptop() — proven in production
def make_affiliate_link(catalog_product_id: str, d2id: str) -> str:
    base = f"https://www.mercadolibre.com.ar/p/{catalog_product_id}"
    return f"{base}?matt_d2id={d2id}" if d2id else base
```

### Supabase: Fetch All Existing catalog_product_ids from DB
```python
# Used to detect which current DB rows need stale checking
def fetch_db_catalog_ids(base_url: str, token: str) -> list[dict]:
    url = f"{base_url}/rest/v1/laptops?select=id,catalog_product_id,name&limit=500"
    req = urllib.request.Request(url, headers={
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())
```

### DB Migration for catalog_product_id
```sql
-- supabase/migrations/06_add_catalog_product_id.sql
ALTER TABLE laptops
  ADD COLUMN IF NOT EXISTS catalog_product_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS laptops_catalog_product_id_unique
  ON laptops (catalog_product_id)
  WHERE catalog_product_id IS NOT NULL;
```

Note: Use `WHERE catalog_product_id IS NOT NULL` because some manually-inserted rows have no catalog ID. A partial unique index avoids conflicts on NULL values.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `/sites/MLA/search` endpoint | `/products/search` for catalog products | Script evolution (see `ml_fetch_active.py` docstring) | Old endpoint blocked for client_credentials; new endpoint is the supported path |
| Manual affiliate link copy-paste | Auto-append `?matt_d2id=UUID` to catalog permalink | `ml_scrape_new.py` added this | Eliminates manual step; proven working |
| INSERT-only import | Upsert via `Prefer: resolution=merge-duplicates` | Needed for Phase 12 | Preserves manually-curated data |
| `ml_fetch_all.py` (no price) | `ml_fetch_active.py` (with price + seller quality filter) | Iteration on scripts | Active script is the right one to use |

**Deprecated/outdated:**
- `ml_fetch_all.py`: Fetches products without price data or seller quality filter. Superseded by `ml_fetch_active.py`.
- `ml_scrape_laptops.py` (original): No price fetching, requires manual affiliate link paste. Superseded by `ml_fetch_active.py`.
- `ml-fetch-laptops.js`: Uses `/sites/MLA/search` (blocked for client_credentials). Generates SQL directly without going through the JSON/upsert pipeline. Do not use.

## Open Questions

1. **Anon key vs service_role key for upsert**
   - What we know: Current scripts use the anon key. Anon key may have RLS restrictions on UPDATE operations if RLS is enabled on the `laptops` table.
   - What's unclear: Whether Supabase RLS is enabled on the `laptops` table (schema.sql doesn't show RLS config).
   - Recommendation: Test `Prefer: resolution=merge-duplicates` with anon key first. If 403, switch to service_role key (store in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`).

2. **How to handle manually-inserted rows with no catalog_product_id**
   - What we know: Some DB rows (e.g., Mac Studio, manually-added entries) likely have no `catalog_product_id`. The partial unique index handles this (NULLs are excluded from uniqueness).
   - What's unclear: Exact count of rows without catalog IDs.
   - Recommendation: During refresh, query `WHERE catalog_product_id IS NULL` — leave those rows untouched or flag for manual review.

3. **Profile assignment after adding new laptops**
   - What we know: Profile-to-laptop assignments live in `profiles.recommended_laptop_ids[]` (see `seed-profiles-81.sql`). The scraping/import pipeline doesn't touch profiles.
   - What's unclear: Whether new catalog laptops should be automatically assigned to profiles or done manually.
   - Recommendation: Out of scope for automated refresh. New laptops enter the catalog but profile assignments require human curation. The `usage_profiles` field on laptops (e.g., `gaming_rendimiento`) enables catalog filtering — that's sufficient for the quiz result page.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3.9+ | All scraping scripts | Yes | 3.9.6 | — |
| ML_CLIENT_ID / ML_SECRET | API auth | Yes | In `.env.local` | — |
| ML_AFFILIATE_D2ID | Auto affiliate links | Yes | In `.env.local` | Use empty string (link without tracking) |
| NEXT_PUBLIC_SUPABASE_URL | DB upsert | Yes | In `.env.local` | — |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | DB upsert | Yes | In `.env.local` | Try service_role key if anon fails |
| Internet access to api.mercadolibre.com | Scraping | Yes (assumed) | — | — |

**Missing dependencies with no fallback:** None identified.

## Validation Architecture

> `workflow.nyquist_validation` is absent from `.planning/config.json` — treating as enabled, but this phase is entirely backend scripts with no application test framework. Validation is done via dry-run flags and manual DB inspection.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (pure Python scripts — no test suite exists) |
| Config file | none |
| Quick run command | `python3 scripts/ml_refresh_catalog.py --dry-run --brands apple` |
| Full suite command | `python3 scripts/check_recommendations.py` (post-refresh audit) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-01 | Refresh produces updated JSON with active products | smoke | `python3 scripts/ml_fetch_active.py --dry-run --brands apple --per-brand 5` | No — Wave 0 |
| CAT-02 | Stale products flagged with `availability_warning=true` | smoke | `python3 scripts/ml_refresh_catalog.py --dry-run` | No — Wave 0 |
| CAT-03 | Affiliate links auto-generated for all new products | unit | manual inspection of output JSON | No |
| CAT-04 | DB upsert preserves existing `influencer_note` values | integration | `python3 scripts/ml_import_db.py --dry-run` | Yes |

### Sampling Rate
- **Per task:** `python3 scripts/ml_refresh_catalog.py --dry-run --brands apple`
- **Per wave:** `python3 scripts/check_recommendations.py --skip-links` (DB audit)
- **Phase gate:** Full `check_recommendations.py` run passes with no new FAIL entries

### Wave 0 Gaps
- [ ] `supabase/migrations/06_add_catalog_product_id.sql` — required before upsert mode works
- [ ] `scripts/ml_refresh_catalog.py` — main orchestrator (does not exist yet)

## Sources

### Primary (HIGH confidence)
- Direct code review: `scripts/ml_fetch_active.py`, `scripts/ml_scrape_new.py`, `scripts/ml_import_db.py`, `scripts/ml_enrich_prices.py`, `scripts/check_recommendations.py`
- Direct schema review: `supabase/schema.sql`, `supabase/migrations/03–05`
- `.env.local` inspection: confirmed ML credentials and affiliate UUID present

### Secondary (MEDIUM confidence)
- ML API: `/products/search?site_id=MLA&domain_id=MLA-NOTEBOOKS&status=active` — confirmed working by docstring in `ml_fetch_active.py`
- ML API: `/products/{id}/items` stale detection — confirmed by `ml_fetch_active.py::get_best_item()`
- Affiliate link format `?matt_d2id=UUID` — confirmed in `ml_scrape_new.py` and seen in `recommendation_audit.md` for live production records
- Rate limit: 1500 req/min (25 req/sec) — from Rollout.com API guide (single secondary source; existing 0.25s sleep is conservative)
- Supabase `Prefer: resolution=merge-duplicates` upsert pattern — standard Supabase REST API pattern

### Tertiary (LOW confidence)
- MercadoLibre affiliate program launched in Argentina November 2025, expanded March 2026 — from news articles; the `matt_d2id` parameter is the programmatic affiliate tracking ID confirmed by code, not official ML developer docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing; no new dependencies needed
- Architecture: HIGH — orchestrator pattern well-precedented by existing scripts
- Pitfalls: HIGH — discovered from direct code audit and audit report
- DB migration need: HIGH — confirmed schema does NOT have `catalog_product_id` column
- Affiliate link format: MEDIUM — proven in code and live production URLs, not from official ML affiliate docs

**Research date:** 2026-05-01
**Valid until:** 2026-11-01 (ML API stable; affiliate program expanding in Argentina so format may evolve)
