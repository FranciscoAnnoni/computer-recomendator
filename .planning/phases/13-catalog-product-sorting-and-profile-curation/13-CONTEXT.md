# Phase 13: Profile Curation — Context

**Gathered:** 2026-05-01
**Status:** Ready for planning
**Source:** User directive (command args)

<domain>
## Phase Boundary

This phase delivers **only one thing**: every one of the 81 quiz profiles has exactly 5 well-chosen, curated laptop recommendations that match the profile's dimensions (workload, lifestyle, budget, os_preference).

Out of scope: catalog product sorting, catalog page UI changes, any non-profile work.

**Core outcome:** A user who completes the quiz sees 5 laptops hand-picked for their archetype — not algorithmic fallbacks, but thoughtfully matched options with appropriate specs, price range, and OS.

</domain>

<decisions>
## Implementation Decisions

### Scope — profiles only
- Touch ONLY the profile → laptop assignment data
- No UI changes, no catalog page changes, no new features
- The output is updated `laptop_ids` arrays in the Supabase `profiles` table

### Selection criteria per profile (locked)
- **OS matching**: `macos` profiles → MacBook/Apple only; `windows` profiles → Windows laptops; `abierto` (open/Linux) profiles → Windows laptops (best Linux-compatible hardware)
- **Budget ranges** (ARS, approximate):
  - `esencial`: 130 000 – 260 000 ARS
  - `equilibrado`: 280 000 – 550 000 ARS
  - `premium`: 550 000+ ARS
- **Workload matching**: prefer laptops whose `usage_profiles` array contains the profile's workload value (productividad_estudio / creacion_desarrollo / gaming_rendimiento)
- **Lifestyle weighting**: `maxima_portabilidad` → prefer laptops ≤ 1.5 kg and/or 13–14"; `escritorio_fijo` → 15–16" OK; `movil_flexible` → neutral
- **Quality**: sort by `recommendation_score` DESC within matched set, pick top 5 with variety (avoid 5 identical brands)

### Curation approach
- Write a Python script `scripts/curate_profiles.py` with deterministic selection logic
- Script must support `--dry-run` (default) that prints proposed assignments without writing
- Script must support `--apply` to write to Supabase
- Script must output a human-readable summary per profile archetype group so the user can review before applying

### Seed file update
- After applying to Supabase, update `supabase/seed-profiles-81.sql` to reflect the new `laptop_ids` assignments (so the seed file stays in sync with DB)

### Claude's Discretion
- Exact tie-breaking logic when multiple laptops have equal recommendation_score
- Whether to add brand diversity enforcement (max 2 laptops per brand per profile)
- Output format of dry-run report
- Whether to generate a per-profile markdown review file alongside the script

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Profile data
- `supabase/profiles-schema.sql` — profiles table schema, enum types (workload_enum, lifestyle_enum, budget_enum, os_preference_enum)
- `supabase/seed-profiles-81.sql` — all 81 profile rows with names and dimensions

### Laptop data
- `supabase/seed.sql` — full laptop catalog with recommendation_score, usage_profiles, os, weight, brand, price
- `supabase/migrations/03_add_laptop_spec_columns.sql` — os, screen_size, weight, battery columns

### Existing scripts (pattern reference)
- `scripts/refresh_catalog.py` — how catalog orchestrator scripts are structured (dry-run pattern, Supabase upsert)
- `scripts/refresh_basics.py` — pure helper functions pattern
- `scripts/check_recommendations.py` — Supabase env loading, HTTP helpers, existing audit logic

### App types
- `src/types/quiz.ts` — ProfileResult type, quiz enums
- `src/types/laptop.ts` — Laptop type

</canonical_refs>

<specifics>
## Specific Requirements

- 81 profiles × 5 laptops = 405 total assignments
- Every profile must get exactly 5 laptop UUIDs (no empty arrays, no duplicates within a profile)
- For `gaming_rendimiento` profiles: only assign laptops with dedicated GPU (NVIDIA/AMD) in their specs — do NOT assign integrated-only laptops
- For `creacion_desarrollo` profiles: prefer laptops with 16GB+ RAM or dedicated GPU
- For `macos` profiles: only MacBook Air / MacBook Pro / Mac mini — never Windows laptops
- Script uses env vars from `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

</specifics>

<deferred>
## Deferred Ideas

- Catalog product sorting (explicitly out of scope per user directive)
- Profile page UI improvements
- Manual per-profile overrides (this phase is algorithmic with script; manual tweaks deferred to future session)

</deferred>

---

*Phase: 13-catalog-product-sorting-and-profile-curation*
*Context gathered: 2026-05-01 via user directive in /gsd:plan-phase args*
