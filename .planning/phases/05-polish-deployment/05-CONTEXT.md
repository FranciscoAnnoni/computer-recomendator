# Phase 5: Polish & Deployment - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the existing app with final animations, responsive validation across all breakpoints (mobile → desktop), and performance optimization focused on mobile fluidity. Deploy is explicitly deferred to the end of Phase 5 or beyond — not in scope for planning now.

No new features. No new routes. Only refinements to what exists.
</domain>

<decisions>
## Implementation Decisions

### Animations — Scope

- **D-01:** The existing animations (quiz carousel, catalog stagger, compare popLayout, profile fade-up) are considered done. **Do not add more to those flows.**
- **D-02:** Two specific gaps must be addressed:
  - **Home page hero** (`src/app/page.tsx`) — zero animation today. Add a subtle `fade-up` entrance on the heading + subtitle + CTA, staggered. This is the first impression of the app and the only page without any motion.
  - **DetailOverlay** (`src/components/catalog/detail-overlay.tsx`) — no Framer Motion at all. Add an `AnimatePresence` enter/exit: slide-up from bottom on mobile (sheet feel), fade+scale on desktop.
- **D-03:** All new animations must respect the established pattern: short duration (≤ 250ms), ease-out, no bounce. Match the Apple-minimalist feel already in place.
- **D-04:** No new animations beyond D-02. User is happy with the rest of the app.

### Performance — Mobile Fluidity First

- **D-05:** Primary optimization target is **mobile smoothness** — no lag, no jank, fluid scroll and interactions. Desktop is secondary.
- **D-06:** Replace all `<img>` tags with `next/image` in `CatalogCard` and `CompareCard`. This enables automatic lazy loading, WebP conversion, and proper sizing — the highest-impact change for mobile performance.
- **D-07:** Audit animation `duration` values across the codebase. Any animation over 300ms on mobile should be reduced. The goal is "fast and snappy", not "slow and impressive".
- **D-08:** No specific Lighthouse score target — optimize by feel. If scroll is smooth and images load progressively, it's done.
- **D-09:** No bundle analysis, no code splitting changes, no Server Component refactors in this phase — those are over-engineering for now.

### Responsive — Mobile + Desktop

- **D-10:** Target: all breakpoints from mobile (320px) to wide desktop. No tablet-specific designs needed — the existing Tailwind breakpoint progression (sm/md/lg) covers it.
- **D-11:** Validation method: manual browser testing using Chrome DevTools device emulation across: iPhone SE (375px), iPhone 14 Pro (430px), iPad (768px — must look reasonable even if not primary), MacBook 13" (1280px), wide desktop (1440px+).
- **D-12:** Any layout issues found during validation are fixed inline as part of this phase. No separate "bug fix" phase.
- **D-13:** Focus areas for responsive checks: Navbar hamburger menu, Quiz carousel, Catalog card grid, DetailOverlay (full-screen on mobile), Compare page column layout (2 on mobile, 3 on desktop).

### SEO — Basics Only

- **D-14:** Add basic SEO to every public page: `<title>`, `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`). Use Next.js `metadata` export (static where possible, dynamic where needed).
- **D-15:** OG image: use a static social preview image (`/public/og-image.png`) — no dynamic generation needed for this phase.
- **D-16:** No sitemap, no `robots.txt`, no structured data in this phase — low priority, can be Phase 6.
- **D-17:** SEO is not the priority — it's a nice-to-have that gets done if animation + responsive + performance work completes without issues.

### Deployment — Deferred

- **D-18:** Deployment (Vercel/Netlify, custom domain, env setup) is explicitly **out of scope** for planning this phase. It is the very last step — only after everything else is validated. Will be addressed at the end or in Phase 6.

### Claude's Discretion
- Exact stagger timing values for home page hero fade-up
- Whether DetailOverlay uses `motion.div` wrapper or wraps the existing root element
- Specific Tailwind breakpoint values for any layout fixes found during responsive audit
- Order of implementation (animations → responsive → performance → SEO, or interleaved)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Animation Patterns
- `src/components/catalog/catalog-client.tsx` — containerVariants + cardVariants stagger pattern (lines ~49+); AnimatePresence for detail overlay trigger
- `src/components/quiz/quiz-shell.tsx` — AnimatePresence with direction-based slide between steps
- `src/components/compare/comparator-client.tsx` — AnimatePresence `mode="popLayout"` for slot entry/exit
- `src/app/profile/page.tsx` — fade-up with y offset pattern

### Files Needing Changes
- `src/app/page.tsx` — Home hero, currently no animation (D-02)
- `src/components/catalog/detail-overlay.tsx` — No Framer Motion (D-02)
- `src/components/catalog/catalog-card.tsx` — Uses `<img>` (D-06)
- `src/components/compare/compare-card.tsx` — Uses `<img>` (D-06)

### Design Tokens
- `src/app/globals.css` — All design tokens, typography scale, dark mode tokens

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `motion`, `AnimatePresence` from `framer-motion` — already installed, used across 10+ files
- `tw-animate-css` — imported in globals.css, available for CSS-based animations as fallback
- `next/image` — available but not yet used in CatalogCard or CompareCard (both use `<img>`)

### Established Patterns
- All animated components use `"use client"` — no server component animation issues
- Framer Motion variant pattern: define variants object outside component, pass to `motion.*` — established in catalog-client.tsx and quiz-shell.tsx
- Dark mode via `next-themes` class strategy — all new UI must respect `.dark` class
- Apple-minimalist: short durations, no bounce, ease-out — match existing feel

### Integration Points
- DetailOverlay is rendered inside `CatalogClient` with conditional show/hide — wrapping with `AnimatePresence` + `motion.div` must happen at the AnimatePresence boundary in catalog-client.tsx, not inside detail-overlay.tsx
- Home page is a Server Component — Framer Motion on it requires extracting animated section to a `"use client"` child component (e.g., `HeroSection`)
- Next.js `metadata` export: each `page.tsx` can export `export const metadata: Metadata = { ... }` — no layout changes needed for SEO
</code_context>

<specifics>
## Specific Ideas

- User's words: "no se trabe, que no se vea laggi, que sea muy fluida" — this is the definition of done for performance. Not a Lighthouse score, not a metric. Just feel.
- "priorizemos más esfuerzos en mobile" — when trade-offs exist, mobile wins.
- DetailOverlay on mobile should feel like a native bottom sheet sliding up — consistent with how the LaptopPicker Sheet already behaves.
- Home page animation should be tasteful and quick — the user said "no abusar". One clean stagger fade-up is enough.
</specifics>

<deferred>
## Deferred Ideas

- Deployment (Vercel/Netlify, custom domain) — explicit user decision, deferred to end of phase or Phase 6
- Sitemap + robots.txt — Phase 6
- Dynamic OG images — Phase 6 or never
- Bundle analyzer / code splitting audit — out of scope, over-engineering for now
- Tablet-specific layout designs — not needed, existing breakpoints are sufficient

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 05-polish-deployment*
*Context gathered: 2026-04-03*
