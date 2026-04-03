---
phase: 5
slug: polish-deployment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework in project |
| **Config file** | none |
| **Quick run command** | `npm run build` (compile check) |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` to catch compile errors
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Build must be green + manual visual checks complete
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Behavior | Test Type | Automated Command | Status |
|---------|------|------|----------|-----------|-------------------|--------|
| next/image: remotePatterns | TBD | 1 | next.config.ts allows Supabase hostname | Build check | `npm run build` | ⬜ pending |
| next/image: CatalogCard | TBD | 1 | No `<img>` in catalog-card.tsx | Code audit | `grep -r "<img" src/components/catalog/catalog-card.tsx` | ⬜ pending |
| next/image: CompareCard | TBD | 1 | No `<img>` in compare-card.tsx | Code audit | `grep -r "<img" src/components/compare/compare-card.tsx` | ⬜ pending |
| Home hero animation | TBD | 1 | HeroSection extracted as client component | Code audit | `grep -r "use client" src/components/home/` | ⬜ pending |
| DetailOverlay animation | TBD | 1 | AnimatePresence wraps DetailOverlay in catalog-client | Code audit | `grep -A5 "AnimatePresence" src/components/catalog/catalog-client.tsx` | ⬜ pending |
| Animation durations | TBD | 1 | All new variants use duration ≤ 0.25s | Code review | `grep -r "duration" src/components/home/ src/components/catalog/detail-overlay.tsx` | ⬜ pending |
| SEO metadata | TBD | 2 | All 4 pages export metadata with OG tags | Code audit | `grep -r "export const metadata" src/app/` | ⬜ pending |
| OG image | TBD | 2 | Static og-image.png exists in /public | File check | `ls public/og-image.png` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test infrastructure setup required. All phase validation is manual inspection or build-time checks.

*Existing infrastructure (npm build + lint) covers all automated verification for this phase.*

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Home hero fade-up animation | Visual animation | Open app, hard-refresh, observe heading + subtitle + CTA fade up staggered |
| DetailOverlay slide-up on mobile | Visual + interaction | Open catalog, tap a card, verify bottom-sheet slide-up on 375px/430px |
| DetailOverlay fade+scale on desktop | Visual + interaction | Open catalog, click a card, verify fade+scale at 1280px+ |
| No animation jank on mobile | Feel-based per D-08 | Scroll catalog on iPhone SE simulation, swipe quiz, verify no lag |
| Responsive layout at 375px | Chrome DevTools | Check navbar, quiz, catalog grid, compare columns at 375px |
| Responsive layout at 430px | Chrome DevTools | Same checks at 430px (iPhone 14 Pro) |
| Responsive layout at 768px | Chrome DevTools | Same checks at 768px (iPad) |
| Responsive layout at 1280px | Chrome DevTools | Same checks at 1280px (MacBook 13") |
| Responsive layout at 1440px+ | Chrome DevTools | Same checks at 1440px+ (wide desktop) |
| Page titles correct in browser tab | Manual | Visit each page, verify title shown in browser tab |
| OG tags present | curl check | `curl -s http://localhost:3000 \| grep "og:"` |

---

## Validation Sign-Off

- [ ] All tasks have build-check or manual verify protocol
- [ ] No `will-change` manually added (negative grep)
- [ ] Wave 0: no infrastructure gaps (manual-only phase)
- [ ] All animation durations ≤ 0.25s in new code
- [ ] Build passes after each wave
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
