---
phase: 13
slug: catalog-product-sorting-and-profile-curation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest (already installed) |
| **Config file** | none — runs from project root |
| **Quick run command** | `python3 -m pytest scripts/tests/test_curate_profiles.py -x -q` |
| **Full suite command** | `python3 -m pytest scripts/tests/ -v` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `python3 -m pytest scripts/tests/test_curate_profiles.py -x -q`
- **After every plan wave:** Run `python3 -m pytest scripts/tests/ -v`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-T1 | 01 | 1 | REQ-01 | unit | `pytest scripts/tests/test_curate_profiles.py::test_dry_run_no_db_write -x` | ❌ W0 | ⬜ pending |
| 13-01-T2 | 01 | 1 | REQ-02 | unit | `pytest scripts/tests/test_curate_profiles.py::test_score_laptop_range -x` | ❌ W0 | ⬜ pending |
| 13-01-T3 | 01 | 1 | REQ-03 | unit | `pytest scripts/tests/test_curate_profiles.py::test_select_returns_5 -x` | ❌ W0 | ⬜ pending |
| 13-01-T4 | 01 | 1 | REQ-04 | unit | `pytest scripts/tests/test_curate_profiles.py::test_macos_only_mac -x` | ❌ W0 | ⬜ pending |
| 13-01-T5 | 01 | 1 | REQ-05 | unit | `pytest scripts/tests/test_curate_profiles.py::test_gaming_gpu_filter -x` | ❌ W0 | ⬜ pending |
| 13-01-T6 | 01 | 1 | REQ-06 | unit | `pytest scripts/tests/test_curate_profiles.py::test_brand_diversity -x` | ❌ W0 | ⬜ pending |
| 13-02-T1 | 02 | 2 | REQ-07 | unit | `pytest scripts/tests/test_curate_profiles.py::test_apply_patches_profiles -x` | ❌ W0 | ⬜ pending |
| 13-02-T2 | 02 | 2 | REQ-08 | integration | `python3 scripts/curate_profiles.py --dry-run 2>&1 \| grep "81 profiles"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/tests/test_curate_profiles.py` — stubs for REQ-01 through REQ-07 (pytest.importorskip pattern)
- [ ] `scripts/tests/conftest.py` — confirm exists from Phase 12, may need fixtures for mock laptop/profile data
