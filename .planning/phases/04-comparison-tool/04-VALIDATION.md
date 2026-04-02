---
phase: 4
slug: comparison-tool
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework installed project-wide |
| **Config file** | none |
| **Quick run command** | Manual browser testing at localhost:3000/compare |
| **Full suite command** | Manual browser testing — mobile (375px) + desktop (1280px) |
| **Estimated runtime** | ~5 minutes manual review per plan |

---

## Sampling Rate

- **After every task commit:** Visual check in browser at localhost:3000/compare
- **After every plan wave:** Full manual checklist (mobile + desktop widths)
- **Before `/gsd:verify-work`:** Full suite must pass manual checklist
- **Max feedback latency:** ~5 minutes

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01 | 01 | 1 | RF3.1 | manual | N/A — no test framework | N/A | ⬜ pending |
| 04-02 | 01 | 1 | RF3.2 | manual | N/A — no test framework | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test infrastructure exists project-wide. Installing a test framework is out of scope for this phase.

*Existing infrastructure covers all phase requirements via manual browser testing.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Slot 1 pre-fills with random laptop on page load | D-03 | No test framework | Load /compare, verify slot 1 shows a laptop name/image |
| Slot 2 shows dashed "+" and "Seleccionar PC 2..." | D-07 | No test framework | Load /compare, verify slot 2 has dashed border and "+" |
| Tapping "+" opens picker modal with catalog list | D-09 | No test framework | Tap slot 2 "+", verify modal opens with laptop list |
| Search in picker filters by name/brand | D-10 | No test framework | Type in picker search, verify list filters |
| Filling slot 2 shows 3rd "+" slot (desktop) | D-04 | No test framework | On 1280px wide: fill both slots, verify 3rd "+" appears |
| Mobile shows max 2 slots, no 3rd slot | D-05 | No test framework | On 375px wide: fill both slots, verify no 3rd slot appears |
| Max 3 laptops total | RF3.1 | No test framework | Fill 3 slots on desktop, verify no 4th slot appears |
| Spec rows: GPU, CPU, RAM, Storage, Price | RF3.2 | No test framework | Verify all 5 spec rows render for each filled slot |
| Already-selected laptops disabled in picker | D-11 | No test framework | Open picker with slot 1 filled, verify that laptop is greyed out |
| Remove (✕) resets slot to "+" | D-20 | No test framework | Click ✕ on a filled slot, verify it resets to dashed "+" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: manual browser check after each task
- [ ] Wave 0: N/A (no test framework)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5 minutes
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
