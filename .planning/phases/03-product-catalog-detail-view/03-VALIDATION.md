---
phase: 3
slug: product-catalog-detail-view
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed |
| **Config file** | None |
| **Quick run command** | `npm run dev` (manual smoke) |
| **Full suite command** | N/A |
| **Estimated runtime** | Manual — no automated suite |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev`, spot-check the affected UI area
- **After every plan wave:** Full manual smoke test of catalog + overlay
- **Before `/gsd:verify-work`:** Manual verification of all acceptance criteria below
- **Max feedback latency:** Manual review per wave

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-DB-01 | DB migration | 1 | schema | manual-smoke | N/A — no test runner | ❌ Wave 0 | ⬜ pending |
| 3-DB-02 | Seed data | 1 | data | manual-smoke | N/A | ❌ Wave 0 | ⬜ pending |
| 3-UI-01 | Catalog page | 2 | RF2.1 | manual-visual | N/A | ❌ Wave 0 | ⬜ pending |
| 3-UI-02 | Catalog card | 2 | RF2.2 | manual-visual | N/A | ❌ Wave 0 | ⬜ pending |
| 3-UI-03 | Filter drawer | 2 | RF2.3 | manual-interaction | N/A | ❌ Wave 0 | ⬜ pending |
| 3-UI-04 | Detail overlay | 3 | RF4.1 | manual-visual | N/A | ❌ Wave 0 | ⬜ pending |
| 3-UI-05 | Buy button | 3 | RF4.2 | manual-interaction | N/A | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test infrastructure to install — project has no test framework
- [ ] Existing infrastructure covers all phase requirements via manual verification

*No automated test runner exists. All verification is manual via `npm run dev`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Catalog renders all laptops from Supabase | RF2.1 | No test runner | Load `/catalog`, verify grid shows laptops |
| Card shows image, name, price, tags, specs, star badge | RF2.2 | Visual | Inspect card layout; star badge visible on influencer laptops |
| Filters narrow visible laptop list | RF2.3 | Interaction | Open filter drawer, apply brand filter, confirm list updates |
| Detail overlay shows full specs | RF4.1 | Visual | Tap "Ver más", verify all spec rows appear |
| "Comprar Ahora" opens affiliate link in new tab | RF4.2 | Interaction | Click button, verify new tab opens to affiliate URL |
| Influencer section visible only in overlay | context | Visual | Confirm star badge on card; full note + score only in overlay |
| Profile section visible when localStorage has profile | context | Interaction | Complete quiz, navigate to `/catalog`, verify profile section appears |
| URL updates to `?laptop=<id>` when overlay opens | context | Interaction | Open overlay, check browser URL bar |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency acceptable (manual per wave)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
