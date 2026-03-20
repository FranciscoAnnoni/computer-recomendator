---
phase: 2
slug: core-discovery-quiz
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | `vite.config.ts` (vitest inline config) |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | framer-motion install | smoke | `node -e "require('framer-motion')"` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 0 | shadcn card component | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 0 | Supabase profiles schema | integration | manual SQL verify | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | QuizContext state machine | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | Answer→profile mapping | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | QuizShell renders steps | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 2 | Step transitions animate | visual | manual browser verify | ❌ W0 | ⬜ pending |
| 2-04-01 | 04 | 3 | RecommendationResult renders | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/quiz/quizLogic.test.ts` — stubs for answer→profile mapping
- [ ] `src/__tests__/quiz/QuizContext.test.tsx` — stubs for state machine
- [ ] `src/__tests__/quiz/QuizShell.test.tsx` — stubs for step rendering
- [ ] `src/__tests__/quiz/RecommendationResult.test.tsx` — stubs for result view
- [ ] `npm install framer-motion` — framer-motion not yet installed
- [ ] `npx shadcn add card` — card component not yet added

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Step transition animations | Smooth quiz step changes | Visual/animation — can't assert in jsdom | Navigate quiz, observe slide transitions |
| Supabase profiles seeded | At least 1 profile row | Requires live DB | Run seed script, verify in Supabase dashboard |
| SSR hydration (no flash) | No localStorage SSR crash | Requires browser | Run `npm run build && npm start`, check console errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
