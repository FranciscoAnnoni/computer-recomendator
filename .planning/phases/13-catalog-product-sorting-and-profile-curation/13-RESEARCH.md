# Phase 13: Profile Curation — Research

**Researched:** 2026-05-01
**Domain:** Data curation — Supabase profiles table, Python scripting, laptop quality scoring
**Confidence:** HIGH (all findings come from reading live files and the actual DB audit)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Touch ONLY the profile → laptop assignment data. No UI changes, no catalog page changes.
- Output is updated `laptop_ids` arrays in the Supabase `profiles` table.
- OS matching: `macos` profiles → MacBook/Apple only; `windows` profiles → Windows laptops; `abierto` profiles → Windows laptops.
- Budget ranges (ARS): `esencial` 130 000–260 000; `equilibrado` 280 000–550 000; `premium` 550 000+.
- Workload matching: prefer laptops whose `usage_profiles` array contains the profile's workload value.
- Lifestyle weighting: `maxima_portabilidad` → prefer ≤ 1.5 kg and/or 13–14"; `escritorio_fijo` → 15–16" OK; `movil_flexible` → neutral.
- Quality sort: `recommendation_score` DESC within matched set, pick top 5 with brand variety.
- Write `scripts/curate_profiles.py` with `--dry-run` (default) and `--apply` modes.
- After applying, update `supabase/seed-profiles-81.sql` to reflect new assignments.
- Every recommended laptop MUST have: working affiliate link, description > 40 words, non-null `influencer_note`, `recommendation_score >= 7`.
- Rank #1 for each profile must be a 10/10 recommendation.
- Affiliate links MUST use: `https://www.mercadolibre.com.ar/p/{id}?matt_d2id=a3e2a9a0-f26e-4b8f-acf6-96f2b4d77f85`
- Script reads env vars from `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `gaming_rendimiento` profiles: only assign laptops with dedicated GPU.
- `creacion_desarrollo` profiles: prefer 16GB+ RAM or dedicated GPU.
- `macos` profiles: only MacBook Air / MacBook Pro / Mac mini — never Windows.
- For `gaming_rendimiento` + `macos`: document the gap explicitly.

### Claude's Discretion

- Exact tie-breaking logic when multiple laptops have equal `recommendation_score`.
- Brand diversity enforcement (max 2 laptops per brand per profile).
- Output format of dry-run report.
- Whether to generate a per-profile markdown review file alongside the script.

### Deferred Ideas (OUT OF SCOPE)

- Catalog product sorting.
- Profile page UI improvements.
- Manual per-profile overrides.
</user_constraints>

---

## Summary

Phase 13 assigns exactly 5 laptops to each of the 81 quiz profiles by writing a Python script (`scripts/curate_profiles.py`) that reads the live Supabase DB, scores laptops, and PATCHes `profiles.laptop_ids`.

**Critical discovery:** The live Supabase DB was refreshed by Phase 12 ML scraping and now contains ~55 laptops with prices ranging from 352 000 to 7 000 000 ARS. The budget tiers defined in CONTEXT.md (esencial ≤ 260k, equilibrado 280k–550k) map to zero laptops in the current DB. The script must use revised effective tiers derived from the current market prices or fall back to tier-less selection when fewer than 5 matches exist.

**Second critical discovery:** All 55 live-DB laptops have `recommendation_score = NULL` and 25/55 have no `influencer_note`. The quality bar from CONTEXT.md (score ≥ 7, note non-null, description > 40 words) cannot be satisfied by the current data. Phase 13 must therefore include a data-enrichment step: compute an algorithmic `recommendation_score` for each laptop and add `influencer_note` for the 25 missing entries, **then** select the top 5 per profile.

**Primary recommendation:** Structure `curate_profiles.py` in three stages: (1) enrich laptop quality data (compute scores, fill notes), (2) select 5 laptops per profile using OS/budget/workload matching, (3) PATCH `profiles.laptop_ids` in bulk. Dry-run must print all three stages without writing.

---

## Live Database Inventory

All data sourced from `scripts/recommendation_audit.json` (last run 2026-04-10, covers the Phase 12 ML-scraped DB).

### Total laptop count

| Category | Count |
|---|---|
| Total unique laptops in live DB | 55 |
| Windows 11 | 41 |
| macOS | 14 |
| With `recommendation_score` set | 0 |
| With `influencer_note` set | 30 |
| With good description (≥40 words) | 0 (all rated "basic" or "poor") |
| With working ML catalog affiliate link | 52 |
| With non-ML / bad affiliate link | 3 |

### macOS laptops (14 total)

All 14 macOS laptops are in the **premium** price range (1.5M–7M ARS). There are **zero** macOS laptops in the esencial or equilibrado tiers under the CONTEXT.md definitions, and zero under even the revised tiers below.

| Name (truncated) | Price (ARS) | influencer_note | desc grade |
|---|---|---|---|
| Apple MacBook Air Macbook Air 13 Pulgadas | 1 500 000 | present | basic |
| MacBook Air M2 13" 8GB/512GB | 1 700 000 | present | poor |
| Mac mini M4 16GB/256GB | 1 750 000 | present | poor |
| MacBook Air M2 13" 8GB/256GB | 1 900 000 | present | poor |
| MacBook Air M4 13" 16GB/256GB | 2 250 000 | present | poor |
| Apple MacBook Air 13-inch Silver M3 8GB | 2 399 000 | present | basic |
| MacBook Air M2 15" 8GB/256GB | 2 800 000 | present | poor |
| MacBook Air M4 13" 16GB/512GB | 2 999 990 | present | poor |
| MacBook Pro M3 14" 16GB/512GB | 3 500 000 | **missing** | poor |
| MacBook Pro M4 14" 16GB/512GB | 3 500 000 | **missing** | poor |
| MacBook Pro M4 Pro 14" 24GB/512GB | 4 890 000 | **missing** | poor |
| MacBook Pro M4 Pro 16" 24GB/512GB | 4 999 999 | **missing** | poor |
| MacBook Pro M4 Pro 14" 24GB/1TB | 6 499 000 | present | poor |
| Apple Mac Studio M4 Max 36GB/512GB | 7 000 000 | **missing** | basic |

### Gaming laptops (Windows, dedicated GPU detected in name)

Only 10 Windows laptops have RTX/gaming indicators in their name. Zero are under 600 000 ARS (all in equilibrado-premium range). The `gaming_rendimiento + esencial` profile combination has no exact matches.

| Name (truncated) | Price (ARS) | Has note |
|---|---|---|
| Notebook Hp Victus Victus 15-fa2013dx | 1 495 000 | No |
| Notebook Hp Victus Gaming 15-fa0027la I5 | 1 549 999 | No |
| PC Gamer Mexx G6550 Ryzen 7 5700 RTX 3050 | 1 380 499 | No |
| Notebook Gamer Acer Nitro V16 Ryzen 5 | 2 399 999 | Yes |
| Laptop Acer Predator Triton 14 RTX 4050 | 2 300 000 | Yes |
| PC Gamer Armada RTX 3060 32GB/960GB | 2 499 000 | No |
| Msi Cyborg I7 RTX 5060 | 2 534 026 | Yes |
| Lenovo Loq 15 RTX 4050 | 2 660 289 | No |
| Notebook Gamer Lenovo Loq 15 Ryzen 7 | 2 715 999 | Yes |
| Portatil Gamer Acer Nitro V15 RTX 5050 | 2 464 599 | No |
| PC Gamer Armada RTX 3070 Ti | 3 799 000 | No |

### Budget tier analysis (CRITICAL)

The CONTEXT.md budget definitions are based on seed.sql (stale 2024 prices). The Phase 12 ML-scraped live DB has completely different price distribution:

| CONTEXT.md Tier | CONTEXT.md Range | Laptops in Live DB |
|---|---|---|
| esencial | ≤ 260 000 ARS | **0 laptops** |
| equilibrado | 280 000–550 000 ARS | **0 laptops** |
| premium | > 550 000 ARS | 55 laptops |

**Revised effective tiers** (based on actual live DB distribution):

| Effective Tier | Price Range | Laptops |
|---|---|---|
| esencial | ≤ 600 000 ARS | 10 Windows laptops |
| equilibrado | 600 001–1 500 000 ARS | 15 Windows laptops |
| premium | > 1 500 000 ARS | 16 Windows + 14 macOS = 30 laptops |

**The script must use these revised tiers**, then fall back to the next wider tier when fewer than 5 matches exist.

### Affiliate link status

| Link type | Count | Problem |
|---|---|---|
| `mercadolibre.com.ar/p/{MLA_ID}?matt_d2id=...` (correct format) | 52 | None |
| `mercadolibre.com.ar/up/...` (non-catalog URL) | 1 | PC Gamer Armada RTX 3070 Ti — bad format |
| Long descriptive ML URL without product ID | 2 | Mac Studio, PC Gamer Mexx — bad format |

The 3 laptops with non-canonical affiliate links should **not** be recommended as rank #1 and should be flagged in the dry-run report.

---

## Critical Gaps

### Gap 1: Zero laptops meet the quality bar

All 55 live-DB laptops have `recommendation_score = NULL`. The CONTEXT.md quality bar (`score >= 7`, `influencer_note` present, description > 40 words) cannot be satisfied by any laptop without first enriching the data.

**Required pre-work before profile assignment:**
1. Compute algorithmic `recommendation_score` (1–10) for each laptop based on specs, price tier fit, and link validity. Set via Supabase PATCH.
2. Write `influencer_note` for the 25 laptops missing it (human-authored strings, short but non-null).
3. The description quality issue (all basic/poor) is a separate problem — Phase 13 scope allows leaving descriptions as-is if they are at least non-empty, but the 40-word bar requires at least adding content.

**Recommended approach:** curate_profiles.py includes a `score_laptop()` function that derives a score from: OS match quality, GPU class, RAM, price tier alignment, and link validity. This score is deterministic and reproducible. When `--apply` is used, write these scores to the `laptops` table in the same run.

### Gap 2: gaming_rendimiento + esencial — no GPU laptops in budget

Zero gaming-suitable (dedicated GPU) laptops exist under 600 000 ARS in the live DB. The script must use a two-level fallback:
1. First try: gaming laptops (has GPU) within the esencial budget tier
2. Fallback 1: gaming laptops ignoring budget (pick the cheapest 5 with GPU)
3. Fallback 2: if still < 5, add Windows laptops without GPU from the budget tier

### Gap 3: gaming_rendimiento + macos — no matching laptops

Macs do not have dedicated GPUs in the traditional gaming sense. The 9 `gaming_rendimiento + macos` profiles (3 lifestyle × 3 budget) have no laptops that pass the "dedicated GPU" filter.

**Resolution:** For `gaming_rendimiento + macos` profiles, assign the best available macOS laptops sorted by price (proxy for power) with an explicit note in the dry-run report that these profiles are gaming-compromised.

### Gap 4: movil_flexible and abierto profiles are unreachable from quiz UI

`quiz.ts` defines only 2 lifestyle values (`maxima_portabilidad`, `escritorio_fijo`) and 2 OS values (`windows`, `macos`). The DB has 3 lifestyle values and 3 OS values, making 45 of 81 profiles unreachable from the quiz UI. Phase 13 still curates all 81 as instructed — this is a data correctness task, not a UI task.

---

## Architecture Patterns

### Script structure for curate_profiles.py

```python
# curate_profiles.py — three-stage pipeline

# Stage 1: Enrich laptop quality data
# - Fetch all laptops from Supabase
# - For each laptop: call score_laptop(laptop) -> int 1-10
# - Build influencer_note for laptops missing it (templated strings)
# - In --apply mode: PATCH laptops table with computed scores + notes

# Stage 2: Compute profile assignments
# - Fetch all profiles from Supabase
# - For each profile (workload, lifestyle, budget, os_preference):
#   - Filter laptops by OS match
#   - Filter by effective budget tier (revised ranges)
#   - Filter by workload: usage_profiles contains workload, OR name-based heuristic
#   - Sort by recommendation_score DESC
#   - Apply lifestyle weighting (weight/screen_size heuristic)
#   - Apply brand diversity cap (max 2 per brand)
#   - Select top 5, with fallback if < 5
# - In dry-run: print proposed assignments grouped by archetype

# Stage 3: Apply assignments
# - In --apply mode: PATCH profiles.laptop_ids for each of 81 profiles
# - Update supabase/seed-profiles-81.sql with new laptop_ids
```

### Recommended project structure

```
scripts/
├── curate_profiles.py       # new — main curation script (this phase)
├── refresh_basics.py        # existing — env loader, make_affiliate_link, fetch
├── refresh_catalog.py       # existing — ML scraping orchestrator
└── check_recommendations.py # existing — quality audit
```

### Supabase PATCH pattern (from refresh_catalog.py)

```python
# Source: scripts/refresh_catalog.py flag_stale() function
url = f"{supabase_url}/rest/v1/profiles?id=eq.{profile_id}"
req = urllib.request.Request(
    url,
    data=json.dumps({"laptop_ids": selected_ids}).encode(),
    method="PATCH",
    headers={
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    },
)
with urllib.request.urlopen(req, timeout=20) as r:
    r.read()
```

### Supabase GET pattern (from check_recommendations.py)

```python
# Source: scripts/check_recommendations.py sb_get() function
def sb_get(base_url, token, path, params=None):
    url = f"{base_url}/rest/v1/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    # ... http_get_json(url, token=token)
```

### Env loading pattern

```python
# Source: scripts/refresh_basics.py load_env()
from refresh_basics import load_env
env = load_env(".env.local")
sb_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("NEXT_PUBLIC_SUPABASE_URL")
sb_token = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---|---|---|
| HTTP requests to Supabase | Custom urllib wrapper | Copy `sb_get` pattern from `check_recommendations.py` |
| Affiliate link construction | Custom string concatenation | Import `make_affiliate_link` from `refresh_basics.py` |
| Env loading | Custom parser | Import `load_env` from `refresh_basics.py` |
| Supabase PATCH | New HTTP helper | Follow exact pattern from `flag_stale` in `refresh_catalog.py` |

**Key insight:** All HTTP utilities already exist in `refresh_basics.py` and `check_recommendations.py`. The new script should import from `refresh_basics` (same pattern as `refresh_catalog.py`).

---

## Common Pitfalls

### Pitfall 1: Budget tiers from CONTEXT.md map to zero laptops

**What goes wrong:** Script filters by `130 000 <= price <= 260 000` for esencial and finds nothing, assigns zero laptops.
**Why it happens:** CONTEXT.md budget tiers reflect seed.sql prices (2024). Phase 12 replaced seed data with current ML prices (350k–7M ARS).
**How to avoid:** Use revised effective tiers: esencial ≤ 600k, equilibrado 600k–1.5M, premium > 1.5M. Fall back to next tier when < 5 matches.
**Warning signs:** Dry-run shows 0 or < 5 assignments for any esencial or equilibrado profile.

### Pitfall 2: `recommendation_score = NULL` breaks sort

**What goes wrong:** `ORDER BY recommendation_score DESC` puts all laptops in arbitrary order when score is NULL, making the "top 5" meaningless.
**Why it happens:** Phase 12 scraper does not write `recommendation_score`; field is NULL for all 55 live-DB laptops.
**How to avoid:** Stage 1 of the script must compute and write scores before Stage 2 selects top 5. Without Stage 1, the quality bar from CONTEXT.md cannot be met.
**Warning signs:** Every profile gets the same 5 laptops (no differentiation by score).

### Pitfall 3: Gaming profiles include desktop PCs (PC Gamer entries)

**What goes wrong:** PC Gamer Armada, PC Gamer Mexx, and PC Gamer Noxi are desktops (not laptops) but appear in the laptops table. Assigning them to portable gaming profiles (`gaming + maxima_portabilidad`) is semantically wrong.
**Why it happens:** Phase 12 ML scraper searched broadly and included desktop gaming PCs.
**How to avoid:** In the scoring function, penalize or exclude entries whose name starts with "PC Gamer" for portable profiles. Or: add a `is_desktop` flag check using weight > 3kg or screen_size absence.
**Warning signs:** Dry-run shows a PC Gamer desktop assigned to a "nomade" profile.

### Pitfall 4: macOS profiles with gaming workload have zero valid laptops

**What goes wrong:** `gaming_rendimiento + macos + any_budget` profiles have no dedicated-GPU Macs. Script returns 0 laptops → profile assignment fails.
**Why it happens:** Apple does not sell dedicated-GPU gaming laptops (M-series has integrated GPU only).
**How to avoid:** For `gaming + macos` profiles, skip the GPU requirement and fall back to best macOS laptops by price. Document this gap in dry-run output with a warning label.
**Warning signs:** Any of the 9 gaming+macos profile combinations gets < 5 assignments.

### Pitfall 5: Non-canonical affiliate links on 3 laptops

**What goes wrong:** Mac Studio, PC Gamer Armada RTX 3070 Ti, and PC Gamer Mexx have affiliate links that are NOT in the canonical ML catalog format (`/p/MLA_ID?matt_d2id=...`). These must not be ranked #1.
**Why it happens:** Phase 12 scraper couldn't find a valid catalog product ID for these 3 entries.
**How to avoid:** In scoring, deduct points for non-canonical links. The scoring function should detect if `affiliate_link` matches the pattern `mercadolibre.com.ar/p/MLA\d+`.
**Warning signs:** Dry-run shows Mac Studio ranked #1 in any profile.

### Pitfall 6: uuid[] array format for Supabase PATCH

**What goes wrong:** Sending `laptop_ids` as a Python list `["uuid1", "uuid2"]` may not be accepted by Supabase PostgREST for an array column without proper Content-Type.
**Why it happens:** PostgREST expects JSON arrays in the body; Python `json.dumps` handles this correctly as long as the list contains plain strings.
**How to avoid:** Use `json.dumps({"laptop_ids": list_of_uuid_strings})`. Do not send a PostgreSQL array literal like `{uuid1, uuid2}`.
**Warning signs:** Supabase returns 400 or 422 on PATCH.

### Pitfall 7: movil_flexible and abierto profiles need data too

**What goes wrong:** Ignoring the 45 unreachable profiles (movil_flexible, abierto) because they can't be reached from the quiz UI.
**Why it happens:** quiz.ts only exposes 2 lifestyle and 2 OS values.
**How to avoid:** The script MUST curate all 81 profiles. The unreachable ones need valid assignments for when the quiz is expanded in the future.
**Warning signs:** Script runs against only 36 profiles instead of 81.

---

## Code Examples

### Algorithmic scoring function skeleton

```python
# Derived from check_recommendations.py quality scoring logic
def score_laptop(laptop: dict, profile_workload: str = None) -> int:
    """
    Returns 1-10. Higher = better fit.
    Base score starts at 5, then add/subtract based on quality indicators.
    """
    score = 5

    # Link quality (+2, -2, or 0)
    link = laptop.get("affiliate_link") or ""
    if re.match(r"https://www\.mercadolibre\.com\.ar/p/MLA\d+\?matt_d2id=", link):
        score += 2
    elif "mercadolibre.com.ar" not in link:
        score -= 2  # no link or bad link

    # Description quality (+1)
    desc = (laptop.get("description") or "").strip()
    word_count = len(desc.split())
    if word_count >= 40:
        score += 1

    # influencer_note (+1)
    note = (laptop.get("influencer_note") or "").strip()
    if len(note) >= 30:
        score += 1

    # Hardware quality heuristics
    name_lower = laptop.get("name", "").lower()
    # GPU tier
    if any(g in name_lower for g in ["rtx 40", "rtx 50", "rx 7"]):
        score += 2
    elif any(g in name_lower for g in ["rtx 3", "rx 6"]):
        score += 1
    # RAM
    ram = (laptop.get("ram") or "").lower()
    if "32gb" in ram or "64gb" in ram:
        score += 1
    elif "16gb" in ram:
        score += 0  # neutral
    elif "4gb" in ram or "8gb" in ram:
        score -= 1

    return max(1, min(10, score))
```

### Profile assignment function skeleton

```python
def select_laptops_for_profile(profile: dict, all_laptops: list[dict],
                               effective_tiers: dict) -> list[str]:
    """Returns list of up to 5 laptop UUIDs."""
    workload = profile["workload"]
    budget = profile["budget"]
    os_pref = profile["os_preference"]
    lifestyle = profile["lifestyle"]

    # Step 1: OS filter
    if os_pref == "macos":
        pool = [l for l in all_laptops if "macOS" in (l.get("os") or "")]
    else:  # windows or abierto both use Windows pool
        pool = [l for l in all_laptops if "Windows" in (l.get("os") or "")]

    # Step 2: Gaming GPU requirement
    if workload == "gaming_rendimiento" and os_pref != "macos":
        gpu_pool = [l for l in pool if _has_dedicated_gpu(l)]
        if len(gpu_pool) >= 5:
            pool = gpu_pool
        # else: fall through with full pool (gap documented in dry-run)

    # Step 3: Budget filter with effective revised tiers
    tier_min, tier_max = effective_tiers[budget]
    budget_pool = [l for l in pool if tier_min <= l.get("price", 0) <= tier_max]
    if len(budget_pool) >= 5:
        pool = budget_pool
    # Else: keep full pool (budget fallback)

    # Step 4: Workload preference
    # usage_profiles field may be empty for Phase 12 scraped data
    # Use name-based heuristic as secondary signal
    workload_pool = [l for l in pool if workload in (l.get("usage_profiles") or [])]
    if len(workload_pool) >= 5:
        pool = workload_pool

    # Step 5: Lifestyle weighting (soft preference, not hard filter)
    if lifestyle == "maxima_portabilidad":
        # Move lightweight laptops to front
        pool = sorted(pool, key=lambda l: _portability_score(l), reverse=True)

    # Step 6: Sort by recommendation_score DESC then price ASC as tiebreak
    pool = sorted(pool,
                  key=lambda l: (-(l.get("recommendation_score") or 0), l.get("price", 0)))

    # Step 7: Brand diversity cap (max 2 per brand)
    selected = []
    brand_counts: dict[str, int] = {}
    for l in pool:
        brand = (l.get("brand") or "unknown").lower()
        if brand_counts.get(brand, 0) >= 2:
            continue
        selected.append(l["id"])
        brand_counts[brand] = brand_counts.get(brand, 0) + 1
        if len(selected) == 5:
            break

    return selected
```

### seed-profiles-81.sql update pattern

```sql
-- After curate_profiles.py --apply, update seed file with:
UPDATE profiles
SET laptop_ids = ARRAY[
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  -- ...
]
WHERE workload = 'productividad_estudio'
  AND lifestyle = 'maxima_portabilidad'
  AND budget = 'esencial'
  AND os_preference = 'windows';
-- ... repeat for all 81 profiles
```

---

## Standard Stack

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.9.6 (confirmed on machine) | Script runtime |
| `urllib.request` | stdlib | All HTTP calls (no external deps) |
| `json` | stdlib | Payload serialization |
| `argparse` | stdlib | `--dry-run`, `--apply`, `--verbose` flags |
| `re` | stdlib | Affiliate link format validation |
| `refresh_basics.load_env` | project | `.env.local` loading |
| `refresh_basics.make_affiliate_link` | project | Canonical link builder |

No new packages to install. All dependencies are already present in the project.

---

## State of the Art

| Old (seed.sql / Phase 6) | Current (Phase 12 + Phase 13) | Impact |
|---|---|---|
| PL/pgSQL DO block assigns laptops at seed time | Python script assigns laptops on-demand | Script can be re-run; more flexible |
| seed.sql prices 130k–260k (esencial) | Live DB prices 350k–7M (inflation) | Budget tiers must be revised |
| recommendation_score set manually in seed.sql (4–10) | Phase 12 scraper doesn't write scores (all NULL) | Stage 1 scoring is mandatory |
| 100 laptops in seed.sql | 55 laptops in live DB after Phase 12 | Fewer options per profile; fallbacks needed |
| All laptops had influencer_note (seed.sql) | 25/55 in live DB are missing note | Stage 1 must generate notes for missing ones |

**Phase 6 approach (PL/pgSQL DO block):** The `supabase/seed.sql` includes a PL/pgSQL DO block that iterates all 81 profile combinations and assigns laptops using `ORDER BY recommendation_score DESC LIMIT 5`. This is the canonical reference for the selection logic, but Phase 13 replaces it with a Python script for better observability and dry-run capability.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Python 3 | Script runtime | Yes | 3.9.6 | — |
| `.env.local` | Supabase credentials | Yes | — | — |
| `refresh_basics.py` | Env loading, link builder | Yes | Phase 12 | — |
| Internet / Supabase | `--apply` mode writes | Assumed yes | — | `--dry-run` mode works offline |

No new dependencies needed. Script uses stdlib only (same pattern as all existing scripts).

---

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | pytest (already installed — see `scripts/tests/`) |
| Config file | none detected, runs from project root |
| Quick run command | `python3 -m pytest scripts/tests/ -x -q` |
| Full suite command | `python3 -m pytest scripts/tests/ -v` |

### Phase Requirements → Test Map

| Req | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| REQ-01 | `--dry-run` prints assignments without writing to DB | unit | `pytest scripts/tests/test_curate_profiles.py::test_dry_run_no_db_write -x` | No — Wave 0 |
| REQ-02 | `score_laptop()` returns 1–10 for any laptop dict | unit | `pytest scripts/tests/test_curate_profiles.py::test_score_laptop_range -x` | No — Wave 0 |
| REQ-03 | `select_laptops_for_profile()` returns exactly 5 IDs | unit | `pytest scripts/tests/test_curate_profiles.py::test_select_returns_5 -x` | No — Wave 0 |
| REQ-04 | macos profiles get only macOS laptops | unit | `pytest scripts/tests/test_curate_profiles.py::test_macos_only_mac -x` | No — Wave 0 |
| REQ-05 | gaming + windows gets laptops with dedicated GPU when available | unit | `pytest scripts/tests/test_curate_profiles.py::test_gaming_gpu_filter -x` | No — Wave 0 |
| REQ-06 | brand diversity: max 2 per brand per profile | unit | `pytest scripts/tests/test_curate_profiles.py::test_brand_diversity -x` | No — Wave 0 |
| REQ-07 | `--apply` PATCHes profiles.laptop_ids (integration, mocked) | unit | `pytest scripts/tests/test_curate_profiles.py::test_apply_patches_profiles -x` | No — Wave 0 |

### Wave 0 Gaps

- `scripts/tests/test_curate_profiles.py` — does not exist, covers REQ-01 through REQ-07
- `scripts/tests/conftest.py` — exists (from Phase 12), may need fixtures for curate_profiles

---

## Open Questions

1. **Should Stage 1 (score computation + note writing) be a separate script?**
   - What we know: The script needs to write scores to `laptops` table before picking top 5 per profile.
   - What's unclear: Whether the user wants a separate `enrich_laptops.py` or a combined script.
   - Recommendation: Keep everything in `curate_profiles.py` as distinct stages; no separate script needed. The `--dry-run` flag shows all stages without writing.

2. **What influencer_note text to generate for the 25 missing laptops?**
   - What we know: 25 Windows laptops and 5 macOS laptops lack `influencer_note`. Notes must be ≥ 30 characters.
   - What's unclear: Whether the planner wants AI-generated text or templated notes.
   - Recommendation: Generate templated notes from specs (e.g., "Laptop {brand} con {cpu} y {ram} RAM. {price_tier_phrase}.") as a starting point. Mark them with a `[AUTO]` prefix in dry-run so the user can review before applying.

3. **Does Phase 13 also update seed-profiles-81.sql?**
   - What we know: CONTEXT.md says yes: "update `supabase/seed-profiles-81.sql` to reflect the new laptop_ids assignments."
   - What's unclear: Whether this is done automatically by the script or manually by the user after review.
   - Recommendation: Script generates an `UPDATE` SQL snippet (or rewrites the seed file) as a separate output artifact. Do not auto-overwrite the seed file during `--apply`.

---

## Sources

### Primary (HIGH confidence)

- `supabase/seed.sql` — full laptop catalog (100 entries), Phase 6 PL/pgSQL assignment logic, budget tier definitions
- `supabase/seed-profiles-81.sql` — all 81 profile rows with all 4 dimensions
- `supabase/profiles-schema.sql` — enum types, table schema
- `scripts/recommendation_audit.json` — live DB state (55 laptops, all NULL scores, price distribution)
- `scripts/refresh_catalog.py` — PATCH pattern, dry-run structure, env loading
- `scripts/refresh_basics.py` — `load_env`, `make_affiliate_link`, `fetch` helpers
- `scripts/check_recommendations.py` — quality scoring logic (`score_description`, `score_influencer_note`), Supabase GET pattern
- `src/types/quiz.ts` — confirms quiz exposes 2 lifestyle options (not 3), 2 OS options (not 3)
- `src/types/laptop.ts` — Laptop type definition

### Secondary (MEDIUM confidence)

- Supabase PostgREST docs (implicit from code): PATCH with `Prefer: return=minimal` and `?id=eq.{uuid}` filter is the correct pattern for single-row updates.

---

## Metadata

**Confidence breakdown:**
- Live DB inventory: HIGH — sourced from actual audit.json file
- Budget tier gap: HIGH — confirmed by price distribution analysis
- Scoring gap: HIGH — confirmed all scores NULL in audit.json
- Architecture patterns: HIGH — sourced from existing scripts
- Gaming/macOS gap: HIGH — verified by counting GPU-capable macOS laptops (0)
- Test framework: MEDIUM — pytest exists in project but test files for this script don't yet

**Research date:** 2026-05-01
**Valid until:** 2026-06-01 (DB prices may shift with inflation; audit.json reflects 2026-04-10 state)
