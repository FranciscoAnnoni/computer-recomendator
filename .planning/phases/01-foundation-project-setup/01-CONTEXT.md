# Phase 1: Foundation & Project Setup - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize the Next.js project scaffold with Tailwind CSS, design tokens, shadcn/ui components, basic layout components (Navbar, Footer, Container), and the Supabase schema for laptop data. Everything else (quiz, catalog, comparison) builds on this foundation.

</domain>

<decisions>
## Implementation Decisions

### Next.js Router & Structure
- App Router (not Pages Router)
- `src/` wrapper folder: `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/types/`
- Components organized as: `components/ui/` (shadcn primitives), `components/layout/` (Navbar, Footer, Container), `components/quiz/`, `components/catalog/`, `components/compare/`
- shadcn/ui as the component library — components added via CLI into `components/ui/`

### Design Tokens & Visual Style
- Color palette: Pure Apple neutral — `#FFFFFF / #F5F5F7` bg, `#1D1D1F` text, `#6E6E73` secondary, `#0071E3` accent/CTA, `#D2D2D7` border
- Font: Inter (from Google Fonts via `next/font`)
- Typography scale: Heading 56px/700, Subhead 28px/500, Body 17px/400, Small 12px/400
- Dark mode supported from the start — configure Tailwind `dark:` class and shadcn theme toggling in Phase 1

### Navigation Layout
- Navbar: Logo left + `[ Catalog ] [ Compare ] [ Find My Laptop → ]` right. Sticky with frosted glass (backdrop-blur) + border-bottom on scroll.
- Mobile: Hamburger menu (top-right) → slide-in sheet with nav links and CTA
- Footer: Copyright only — `© 2026 Computer Recomendator`. Ultra-minimal.

### Laptop Data Structure
- Database: Supabase, set up in Phase 1 — define schema now, no migration later
- Single `laptops` table with two display layers (no separate tables):
  - `id`, `name`, `brand`, `price`
  - Technical: `cpu`, `ram`, `gpu`, `storage`
  - Dummies mode: `simplified_tags[]` (e.g., "Very Fast", "Supports Photoshop")
  - Filtering: `usage_profiles[]` (design, programming, study, general)
  - Influencer: `influencer_note`, `recommendation_score`
  - Links: `affiliate_link`, `image_url`
- "Dummies mode" toggle is client-side state only — both datasets live in the same row; UI chooses which to render

### Claude's Discretion
- Exact Tailwind config details (spacing scale, border radius, animation easing)
- shadcn/ui theme configuration specifics (CSS custom properties mapping)
- TypeScript type definitions for the laptop schema
- Supabase client setup pattern (singleton, server vs client components)

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and in:
- `.planning/PROJECT.md` — Vision, brand aesthetic, tech stack decisions
- `.planning/REQUIREMENTS.md` — Full functional and non-functional requirements (RNF1.1–1.3 for design, RNF2.1 for performance)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — project is a clean slate (only README files exist)

### Established Patterns
- None established — this phase defines the patterns all subsequent phases will follow

### Integration Points
- Supabase client will be initialized in `src/lib/supabase.ts` — used by catalog, quiz, and comparison phases
- Design tokens set here become the design contract for all UI in Phases 2–5
- Layout components (Navbar, Footer) wrap every page via `src/app/layout.tsx`

</code_context>

<specifics>
## Specific Ideas

- Navbar "Find My Laptop →" button = primary CTA, uses accent blue, links to `/quiz`
- Frosted glass navbar: `backdrop-blur-md bg-white/80 dark:bg-black/80` on scroll
- shadcn/ui for all interactive primitives (Button, Card, Sheet for mobile nav, Badge for tags)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-project-setup*
*Context gathered: 2026-03-19*
