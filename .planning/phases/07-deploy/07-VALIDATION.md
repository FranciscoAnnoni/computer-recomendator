---
phase: 7
slug: deploy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework detected in project |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green + manual smoke test passed
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | DEP-03 | build | `npm run build` | ✅ | ⬜ pending |
| 7-01-02 | 01 | 1 | DEP-01, DEP-02 | manual smoke | Visit prod URL, complete quiz | N/A — post-deploy | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

*No new test files needed — build verification (`npm run build`) is the automated proxy. DEP-01 and DEP-02 are verified by manual smoke testing after deployment.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Public URL accessible | DEP-01 | Post-deploy environment check | Visit the Vercel production URL in a browser without any local setup |
| Supabase data loads in production | DEP-02 | Requires production database connectivity | Complete the full quiz on production URL, verify laptop recommendations load from real data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
