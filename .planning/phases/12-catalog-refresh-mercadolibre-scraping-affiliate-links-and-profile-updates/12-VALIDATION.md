---
phase: 12
slug: catalog-refresh-mercadolibre-scraping-affiliate-links-and-profile-updates
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `python -m pytest scripts/tests/ -x -q` |
| **Full suite command** | `python -m pytest scripts/tests/ -v` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `python -m pytest scripts/tests/ -x -q`
- **After every plan wave:** Run `python -m pytest scripts/tests/ -v`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 0 | DB migration | integration | `python -m pytest scripts/tests/test_migration.py -x -q` | ❌ W0 | ⬜ pending |
| 12-01-02 | 01 | 1 | Catalog scraper | unit | `python -m pytest scripts/tests/test_scraper.py -x -q` | ❌ W0 | ⬜ pending |
| 12-01-03 | 01 | 1 | Stale seller detection | unit | `python -m pytest scripts/tests/test_stale_check.py -x -q` | ❌ W0 | ⬜ pending |
| 12-01-04 | 01 | 2 | Affiliate link generation | unit | `python -m pytest scripts/tests/test_affiliate.py -x -q` | ❌ W0 | ⬜ pending |
| 12-02-01 | 02 | 2 | Orchestrator dry-run | integration | `python scripts/refresh_catalog.py --dry-run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/tests/__init__.py` — test package init
- [ ] `scripts/tests/conftest.py` — shared fixtures (mock ML API responses, test DB connection)
- [ ] `scripts/tests/test_migration.py` — stubs for DB migration validation
- [ ] `scripts/tests/test_scraper.py` — stubs for catalog scraper
- [ ] `scripts/tests/test_stale_check.py` — stubs for stale seller detection
- [ ] `scripts/tests/test_affiliate.py` — stubs for affiliate link generation
- [ ] `pip install pytest pytest-mock` — if not already installed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full refresh end-to-end | Phase 12 goal | Requires live ML API + Supabase | Run `python scripts/refresh_catalog.py --dry-run` and verify output looks correct |
| Affiliate link validity | Phase 12 | Requires browser to verify ML affiliate tracking | Click a generated link, confirm affiliate ID is in URL |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
