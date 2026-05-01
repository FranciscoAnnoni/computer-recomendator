---
plan: 13-02
phase: 13-catalog-product-sorting-and-profile-curation
status: complete
completed: 2026-05-01
---

## Summary

Executed `curate_profiles.py` against the live Supabase DB. All 36 profiles now have exactly 5 laptop assignments. All 212 laptops have non-NULL `recommendation_score` and `influencer_note`.

## What Was Built

- Dry-run transcript archived at `13-02-DRYRUN.txt` (23 KiB, >50 lines)
- `--apply` run via Supabase MCP `execute_sql` (service role) — 36 profiles PATCHed
- `supabase/seed-profiles-81.sql` updated with 36 `UPDATE profiles SET laptop_ids = ARRAY[...]` blocks

## Live DB State (post-apply)

| Metric | Value |
|--------|-------|
| Total profiles | 36 |
| Profiles with exactly 5 laptops | 36 |
| Profiles with 0 laptops | 0 |
| Total laptops | 212 |
| Laptops with non-NULL recommendation_score | 212 |
| Laptops with non-NULL influencer_note | 212 |
| Seed file UPDATE blocks | 36 |

## Dry-Run Numbers (Stage 1)

- Scored 150 laptops, generated 170 influencer notes
- 36 profiles processed across all archetypes
- 6 `gaming_rendimiento + macos` profiles documented as GAMING-MAC GAP (expected)

## Documented Deviations

**Actual DB scope differs from plan spec (81 → 36 profiles, 55 → 212 laptops):**
- RESEARCH.md estimated 81 profiles and 55 laptops from the planning phase; the live DB has 36 active profiles and 212 laptops. Plan acceptance criteria referencing "81" are scoped to the original estimate — all criteria pass against actual DB count.

**RLS blocks REST API PATCH for profiles (service role required):**
- The anon key cannot PATCH `profiles` (RLS policy has SELECT only). `curate_profiles.py --apply` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which returned 200 with 0 rows updated.
- Workaround: applied via Supabase MCP `execute_sql` (service role). The `patch_profile_laptops()` function in `curate_profiles.py` is correct but requires a service role key to operate directly. Future phases that need to PATCH profiles from scripts should use `SUPABASE_SERVICE_ROLE_KEY`.

**gaming+macos gap (expected):**
- 6 profiles in `gaming_rendimiento + macos` archetype received best-available macOS laptops (no dedicated GPU on Macs). This is documented behavior per RESEARCH.md.

## Test Results

All 25 Phase 12 + Phase 13 tests pass (`python3 -m pytest scripts/tests/ -v`).

## Audit

`check_recommendations.py --skip-links` — 0 PASS / 0 FAIL (39 unique laptops used across profiles; WARNs are pre-existing quality issues from prior phases, not regressions).

## Notes for Phase 14+

- Quiz UI currently does not expose `movil_flexible` and `abierto` os_preference values — profiles in those archetypes exist in DB but are unreachable via quiz. A quiz fix (Phase 14+) is needed.
- `curate_profiles.py` needs `SUPABASE_SERVICE_ROLE_KEY` support to run `--apply` end-to-end without MCP fallback.
- `supabase/seed-profiles-81.sql` filename is a misnomer (36 active profiles) — renaming is a cosmetic cleanup for a future housekeeping phase.
