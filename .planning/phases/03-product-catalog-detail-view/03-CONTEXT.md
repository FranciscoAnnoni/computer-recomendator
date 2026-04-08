# Phase 3: Product Catalog & Detail View - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the laptop catalog at `/catalog`: two distinct sections (quiz profile section + global catalog), filter/search functionality, and a full-screen overlay detail view per laptop. Comparison tool is a separate phase.

</domain>

<decisions>
## Implementation Decisions

### Catalog Page Structure — Two Sections
- **Section 1 — Quiz Profile (conditional):** Visible only if user has a completed profile in localStorage. Shows two buttons: "Rehacer quiz" and "Ver laptops del perfil". Does NOT display the 5 cards inline — user taps to navigate.
- **Section 2 — Global Catalog:** All laptops in a single-column list (mobile-first; columns expanded in future iterations). Filtered and searchable.
- No "featured" or "promoted" laptop — all treated equally in the global catalog.

### Catalog Card Design
- Cards are elongated/tall — distinct from the compact quiz result cards.
- Card layout (top to bottom): square product image → title → price → description → simplified_tags as pills → tech spec labels (CPU, RAM, storage, GPU, battery) → "Ver más" button.
- Laptops with an influencer recommendation show a **star badge** (★) in the top-right corner of the card.
- Tapping "Ver más" opens a full-screen overlay (not page navigation).

### Filter & Search
- A "Filtrar" button opens a drawer/panel with all available filter options; user configures and confirms.
- Filter dimensions: brand, price range, screen size, weight, usage profile, OS, and any available spec field.
- Text search: instant-filter by name, brand, or any text field.
- Results are **paginated** — first 100 results load after applying filters; real-time updates as filters change.
- Empty state: friendly message suggesting to remove filters (e.g., "No encontramos laptops con estos filtros. Probá quitando alguno.").

### Detail Overlay
- Opens as a **full-screen overlay** on top of the catalog (not a new route/navigation). Close button in top-right corner.
- Layout: product image beside title and price (not hero at top).
- Specs always visible — **dummies/tech toggle is removed entirely**. Show simplified_tags + all tech specs together, no switch.
- Tech spec labels displayed: CPU, RAM, storage, GPU, battery, OS, screen size, weight.
- "Comprar Ahora" button: generic but prominent, links to `affiliate_link` (external, opens new tab).
- Influencer section (only in overlay, not in catalog card): "Recomendación de experto" label + `influencer_note` text + score shown as "X/10".
- Laptops without an influencer note: no influencer section in overlay.

### Database Schema Updates (laptops table)
The following columns must be added to the existing `laptops` Supabase table and `Laptop` TypeScript type:
- `os` (text) — e.g., "Windows 11", "macOS Sequoia"
- `screen_size` (text) — e.g., '14"'
- `weight` (text) — e.g., "1.4 kg"
- `battery` (text) — e.g., "Up to 18h"

### Profiles Table (backend clarification)
- The `profiles` table maps **81 combinations**: `workload × lifestyle × budget × os_preference` (3×3×3×3).
- The 4th dimension (`os_preference`: windows | macos | abierto) is already in the frontend code and `fetchProfile()` query.
- This phase must ensure the Supabase `profiles` table schema and seed data account for all 81 rows.

### Dummies/Tech Mode Toggle — Removed
- The dummies/tech mode toggle concept is fully removed from the app.
- The dark/light theme toggle (ThemeToggle component) is unaffected and stays.
- `simplified_tags` field is kept in the data model and displayed as tag pills on cards — just without any toggle mechanism.

### Claude's Discretion
- Exact drawer/panel component for filters (shadcn Sheet or custom)
- Pagination implementation details (infinite scroll vs. load-more button)
- Overlay animation (Framer Motion entry/exit)
- Skeleton loading for catalog and detail overlay
- Filter chip display in the active-filters summary

</decisions>

<specifics>
## Specific Ideas

- Card layout is "alargada" (tall/elongated) — image square on top, content stacked below, "Ver más" at bottom.
- Star badge (★) in the top-right corner of catalog cards that have an influencer recommendation.
- Detail overlay has a close button in the top-right corner.
- "Comprar Ahora" button should be prominent and visually distinct (primary CTA).
- Influencer section uses "Recomendación de experto" as label (anonymous, no specific influencer identity shown).
- Score displayed as plain number: e.g., "8/10".

</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and in:

### Project & requirements
- `.planning/PROJECT.md` — Vision, Apple minimalist aesthetic, catalog and comparison feature goals
- `.planning/REQUIREMENTS.md` — RF2.x (catalog requirements), RNF1.x (design/UX)

### Prior phase decisions
- `.planning/phases/01-foundation-project-setup/01-CONTEXT.md` — Design tokens, shadcn/ui components, Supabase client setup
- `.planning/phases/02-core-discovery-quiz/02-CONTEXT.md` — Quiz profile shape (ProfileResult), localStorage keys, Navbar integration

### Existing types (verify before modifying)
- `src/types/laptop.ts` — Laptop interface (needs `os`, `screen_size`, `weight`, `battery` added)
- `src/types/quiz.ts` — QuizState, ProfileResult, QUIZ_STORAGE_KEY, PROFILE_STORAGE_KEY
- `src/lib/quiz-data.ts` — fetchProfile (4 params), fetchLaptopsByIds

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/quiz/result-laptop-card.tsx` — Existing laptop card (quiz result style). Catalog card is a NEW component with different layout — do not reuse this directly.
- `src/components/ui/card.tsx` — shadcn Card primitive, use as base for catalog card.
- `src/components/ui/sheet.tsx` — shadcn Sheet, candidate for filter drawer and detail overlay.
- `src/components/ui/button.tsx` — shadcn Button, use for "Ver más", "Filtrar", "Comprar Ahora", "Rehacer quiz".
- `src/lib/supabase.ts` — Supabase singleton client.
- `src/lib/utils.ts` — Utility functions.

### Established Patterns
- App Router: new catalog page at `src/app/catalog/page.tsx`.
- Tailwind Apple design tokens: `#0071E3` accent, `#1D1D1F` text, `#F5F5F7` bg, `#D2D2D7` border.
- Framer Motion already installed — use for overlay enter/exit animation.
- localStorage keys: `QUIZ_STORAGE_KEY` and `PROFILE_STORAGE_KEY` from `src/types/quiz.ts` — read these to determine if quiz section should appear.
- shadcn/ui render prop pattern (not asChild) — established in Phase 1.

### Integration Points
- Navbar "Catalog" link already exists — it points to `/catalog`.
- `ResultLaptopCard` links to `/catalog/${laptop.id}` — this route now triggers the detail overlay (or a `[id]` route that renders the overlay on top of the catalog).
- `Laptop` type in `src/types/laptop.ts` must be extended with `os`, `screen_size`, `weight`, `battery`.
- Profile section in catalog reads from `PROFILE_STORAGE_KEY` in localStorage — same key used by Navbar ProfileAvatar.

</code_context>

<deferred>
## Deferred Ideas

- Multi-column grid layout (2-3 cols on tablet/desktop) — Phase 5 polish iteration
- Sorting options (price asc/desc, score, name) — add to backlog
- Laptop comparison "select to compare" from catalog cards — Phase 4

</deferred>

---

*Phase: 03-product-catalog-detail-view*
*Context gathered: 2026-03-24*
