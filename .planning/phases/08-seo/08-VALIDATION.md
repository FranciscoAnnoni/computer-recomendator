---
phase: 8
slug: seo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework configured |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite green + all curl smoke tests pass against `http://localhost:3000`
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 1 | SEO-01, SEO-02 | build + manual | `npm run build` / `curl -s http://localhost:3000 \| grep 'lang="es"'` | ❌ W0 | ⬜ pending |
| 8-01-02 | 01 | 1 | SEO-03 | manual | `curl -s http://localhost:3000/[page] \| grep og:title` | ❌ W0 | ⬜ pending |
| 8-01-03 | 01 | 1 | SEO-04 | manual | `curl -I http://localhost:3000/og-image.png` | ❌ W0 | ⬜ pending |
| 8-01-04 | 01 | 1 | SEO-05 | manual | `curl -s http://localhost:3000/[page] \| grep twitter:card` | ❌ W0 | ⬜ pending |
| 8-01-05 | 01 | 1 | SEO-06 | manual | `curl -s http://localhost:3000/robots.txt` | ❌ W0 | ⬜ pending |
| 8-01-06 | 01 | 1 | SEO-07 | manual | `curl -s http://localhost:3000/sitemap.xml` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All curl validations are manual — no test files to generate. The only automated gate is `npm run build`.

- [ ] `public/og-image.png` — must exist at 1200×630px before Phase 8 can be verified (SEO-04)

*No test framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `<html lang="es">` in page source | SEO-01 | No test framework; runtime HTML check | `curl -s http://localhost:3000 \| grep 'lang="es"'` |
| Unique Spanish titles per page | SEO-03 | Content inspection required | `curl -s http://localhost:3000/[page] \| grep og:title` for each route |
| `/og-image.png` returns 200 | SEO-04 | File existence check | `curl -I http://localhost:3000/og-image.png` |
| `twitter:card` on all pages | SEO-05 | Meta tag inspection | `curl -s http://localhost:3000/[page] \| grep twitter:card` |
| `/robots.txt` valid content | SEO-06 | Response content check | `curl -s http://localhost:3000/robots.txt` |
| `/sitemap.xml` all 5 routes | SEO-07 | XML content inspection | `curl -s http://localhost:3000/sitemap.xml` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
