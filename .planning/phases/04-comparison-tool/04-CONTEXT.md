# Phase 4: Comparison Tool - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the `/compare` page: a dedicated comparison view where users select up to 3 laptops (desktop) or 2 laptops (mobile) and see them side by side with technical specs. Accessible via Navbar. No selection trigger from the catalog page — the comparator manages its own laptop selection entirely.

</domain>

<decisions>
## Implementation Decisions

### Route & Entry Point
- **D-01:** Dedicated page at `/compare`, linked from Navbar as a top-level nav item.
- **D-02:** No "add to compare" trigger on the catalog cards — the comparator is self-contained. Users select laptops from within the compare page itself.

### Slot System & Progressive Disclosure
- **D-03:** Page loads with **2 slots**: slot 1 is pre-filled with a random laptop from the catalog, slot 2 is an empty "+" dashed slot.
- **D-04:** When both slots are filled (desktop only), a **3rd "+" slot** appears alongside the two filled laptops.
- **D-05:** Mobile cap: **maximum 2 laptops** on mobile. The 3rd slot is desktop-only (`hidden sm:flex` pattern or similar breakpoint).
- **D-06:** Max 3 laptops total (RF3.1). No 4th slot ever.

### Empty Slot Visual
- **D-07:** Empty slot: dashed border card, large "+" icon centered, "Seleccionar PC N..." label below (N = slot number). Matches the reference mockup.
- **D-08:** When an empty slot is tapped, open a modal/drawer to select a laptop.

### Laptop Picker (Modal/Drawer)
- **D-09:** Tapping "+" opens a **modal or bottom drawer** containing the full catalog list with a search input.
- **D-10:** Search filters by name and brand in real time.
- **D-11:** Already-selected laptops are greyed out / disabled in the picker (prevent duplicates).

### Spec Display
- **D-12:** Each laptop column shows specs as **horizontal rows separated by dividers** — matching the reference mockup style.
- **D-13:** Spec rows (in order): Model name (header), GPU, CPU, RAM, Storage, Price.
- **D-14:** Technical specs only — no "for dummies" simplified tags in the comparison view.
- **D-15:** Spec labels use the existing bracket style where applicable: `[ GPU: NVIDIA RTX 4090 ]` — consistent with CatalogCard's `SpecRow` pattern.

### Layout & Visual Style
- **D-16:** Cards are **equal-width columns** laid out in a flex row. On desktop: up to 3 columns. On mobile: 2 columns max.
- **D-17:** Page header: large "Comparador" title + slot count indicator (e.g., `[2] [3] [4]` bracket tabs showing how many laptops are being compared).
- **D-18:** Selected laptop card: laptop image at top (square, object-cover) → model name → spec rows.
- **D-19:** Apple-minimalist aesthetic — consistent with the rest of the app (white/light bg in light mode, dark in dark mode). The mockup's dark aesthetic is the dark mode variant.

### Removing a Laptop
- **D-20:** Claude's Discretion — small ✕ button on each filled card to remove and reset that slot to "+".

### State Management
- **D-21:** Claude's Discretion — comparison state can be local React state (no persistence needed; compare page is ephemeral).

### Claude's Discretion
- Exact animation/transition when a laptop is added or removed from a slot
- Whether the slot count indicator is interactive (clickable tabs) or purely decorative
- Exact modal vs bottom-sheet decision for the picker on mobile
- Loading skeleton for the random pre-filled laptop on first render

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing components to reuse/extend
- `src/components/catalog/catalog-card.tsx` — SpecRow pattern (`[ label: value ]` display), card layout conventions
- `src/components/layout/navbar.tsx` — Where to add the Compare nav link
- `src/components/ui/button.tsx` — Button variants in use
- `src/lib/catalog-data.ts` — Catalog data source / Supabase query pattern for fetching laptops
- `src/types/laptop.ts` — Laptop type definition (fields available: name, brand, gpu, cpu, ram, storage, price, image_url, etc.)

### Planning context
- `.planning/phases/01-foundation-project-setup/01-CONTEXT.md` — Navbar structure, component folder conventions (`components/compare/`)
- `.planning/phases/03-product-catalog-detail-view/03-CONTEXT.md` — Catalog card layout, filter drawer pattern (reuse for picker modal)

### Requirements
- `RF3.1` — Select at least 2 and up to 3 laptops for comparison
- `RF3.2` — Visual comparison of simplified specs (performance bars, compatibility icons) — NOTE: user has decided technical specs (text rows) instead of bars/icons for this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/catalog/catalog-card.tsx` → `SpecRow` component (`[ label: value ]` with mono font) — reuse directly in comparison cards
- `src/components/compare/` — folder already scaffolded (empty), ready for new components
- Existing Supabase client pattern from `src/lib/catalog-data.ts` — reuse to fetch catalog for picker and for random pre-fill
- Filter drawer pattern from Phase 3 — repurpose as the laptop picker bottom-sheet/modal

### Established Patterns
- Apple-minimalist cards with `rounded-xl border border-border bg-card` — apply to comparison slots
- `hidden sm:flex` / `sm:hidden` breakpoint pattern used throughout for mobile/desktop splits
- `framer-motion` available for slot transitions (card appear/disappear)
- Dark mode via `dark:` Tailwind classes — already configured globally

### Integration Points
- **Navbar** (`src/components/layout/navbar.tsx`): Add `[ Comparar ]` link between `[ Catalog ]` and `[ Find My Laptop → ]`
- **Route**: Create `src/app/compare/page.tsx`
- **Components folder**: All compare components go in `src/components/compare/`

</code_context>

<specifics>
## Specific Ideas

- **Reference mockup:** `/Users/FranciscoAnnoni/Downloads/3-comparador.png` — shows the target layout: large "Comparador" heading, `[2] [3] [4]` bracket slot indicator, side-by-side cards with laptop image + spec rows + dividers, dashed-border empty slot with centered "+".
- **Apple comparator inspiration** — clean, spacious, column-based. Each laptop is a card column, specs align across columns.
- **The "[2] [3] [4]" indicator** from the mockup likely shows the number of laptops currently being compared (active slot count).

</specifics>

<deferred>
## Deferred Ideas

- "For dummies" simplified spec toggle in the comparison view — out of scope for this phase, could be Phase 6 improvement
- Sharing/exporting the comparison — future phase
- Saving a comparison to favorites — future phase

</deferred>

---

*Phase: 04-comparison-tool*
*Context gathered: 2026-04-02*
