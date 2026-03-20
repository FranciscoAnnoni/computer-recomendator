# Phase 2: Core Discovery Quiz - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full quiz experience at `/quiz`: a 3-step carousel quiz that maps user answers to one of 27 fixed profiles, then shows the 5 recommended laptops for that profile. Includes: quiz state persisted in localStorage, profile avatar in Navbar after completion, and ability to redo the quiz from the profile. Catalog, detail view, and comparison are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Quiz Structure
- 3 steps × 3 cards = 27 profile combinations (3×3×3 = exact mathematical profiling)
- Each step shows a carousel of 3 cards; user navigates carousel to center the desired option, then taps Next
- Step 1 — **Workload**: Productividad & Estudio / Creación & Desarrollo / Gaming & Rendimiento
- Step 2 — **Lifestyle**: Máxima Portabilidad / Potencia Bruta / Ecosistema (Apple)
- Step 3 — **Budget**: Esencial / Equilibrado / Premium

### Card Interaction (Carousel Mechanic)
- Cards face-up from start — ultra-minimalist: illustration + label only (no descriptions on card face)
- Layout: center card large and prominent, left/right cards partially visible (peeking) on both sides
- Left (←) and right (→) arrow buttons to navigate the carousel
- **Center card = selected option** — gets blue accent border (#0071E3) + subtle scale-up (scale 1.03)
- "Next · Siguiente" full-width button fixed at bottom to advance to next step
- "Volver al Inicio" exit link at very bottom, always visible
- Back arrow at top to return to previous step (preserves previous selection)
- Each card has a thematic illustration (see Specific Ideas for illustration descriptions per card)

### Profile-to-Laptop Mapping (Supabase)
- A `profiles` Supabase table with 27 rows (one per combination)
- Columns: `workload` (enum), `lifestyle` (enum), `budget` (enum), `laptop_ids` (UUID[5]), `profile_name` (text), `profile_description` (text), `profile_image_url` (text)
- 27 fixed profiles — curated manually, not computed dynamically
- When quiz completes, look up the matching profile row by (workload, lifestyle, budget) and fetch the 5 laptops

### Quiz State (localStorage)
- Quiz answers (step 1/2/3 selections) stored in localStorage — no user accounts, no DB writes for answers
- Completed profile result also stored locally: profile name, description, image, and 5 laptop IDs
- On app load: check localStorage — if profile exists, show profile avatar in Navbar

### Profile in Navbar
- After quiz completion, a profile avatar/image appears in the Navbar (right side, replacing or alongside the "Find My Laptop" CTA)
- Tapping the profile avatar shows a popover/sheet with: profile name, description, and a "Rehacer quiz" button
- "Rehacer quiz" clears localStorage quiz data and navigates to `/quiz`

### Result View
- Top section: profile name (e.g., "Creador Portable Equilibrado") + short profile description + "Tus 5 mejores opciones" heading
- Body: vertical scroll list of 5 laptop cards
- Each laptop card shows: product image, model name, 2-3 simplified_tags, price, "Ver más" CTA
- Dummies/tech mode toggle (from Phase 1 design) applies to result cards — shows simplified_tags or technical specs
- Brief loading spinner/skeleton while fetching profile + laptops from Supabase

### Quiz Flow & Navigation
- Progress indicator: "Paso X/3" label + segmented progress bar below the question heading
- Back arrow per step returns to previous carousel with selection preserved
- Step transitions: horizontal slide animation (Framer Motion) — steps slide left/right
- Result transition: fade in after spinner resolves
- "Volver al Inicio" always visible at bottom as a text link

### Claude's Discretion
- Exact Framer Motion animation parameters (duration, easing)
- Carousel snap behavior implementation details (CSS scroll snap vs JS)
- Skeleton loading design for result view
- Error state if profile lookup fails (no match found)
- How to handle swipe gestures on mobile (in addition to arrow buttons)

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and in:

### Project requirements
- `.planning/PROJECT.md` — Vision, quiz description ("card flip" concept, Apple minimalist aesthetic, Framer Motion)
- `.planning/REQUIREMENTS.md` — RF1.1–RF1.3 (quiz requirements), RNF1.1–1.3 (design requirements)

### Prior phase decisions
- `.planning/phases/01-foundation-project-setup/01-CONTEXT.md` — Design tokens, component structure, Supabase client setup, shadcn/ui component list

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — shadcn Button, use for "Next · Siguiente" and "Rehacer quiz"
- `src/components/ui/sheet.tsx` — base-ui Sheet (render prop pattern), use for profile popover on mobile
- `src/components/layout/container.tsx` — page wrapper, quiz page uses this
- `src/components/layout/navbar.tsx` — needs modification to show profile avatar after quiz completion
- `src/lib/supabase.ts` — Supabase singleton client, use for profile + laptop fetch
- `src/types/laptop.ts` — `Laptop` and `UsageProfile` types already defined

### Established Patterns
- App Router (`src/app/`) — quiz lives at `src/app/quiz/page.tsx`, results at `src/app/quiz/result/page.tsx` (or same route with state)
- Tailwind CSS with Apple design tokens in `globals.css` — use `accent` (#0071E3), `foreground`, `muted-foreground`
- Framer Motion already chosen — use for carousel animation and step transitions
- shadcn/ui render prop pattern (not asChild) — see Phase 1 STATE.md decisions

### Integration Points
- Navbar (`src/components/layout/navbar.tsx`) — add profile avatar slot on the right; conditionally render based on localStorage
- `src/lib/supabase.ts` — add `profiles` table query alongside existing `laptops` table queries
- New Supabase table needed: `profiles` (27 rows) — schema must be added to Supabase before this phase can complete
- `UsageProfile` type in `src/types/laptop.ts` — may need updating to match new workload enum values

</code_context>

<specifics>
## Specific Ideas

### Quiz reference design
- User provided a reference image showing: dark background, large center card with illustration, partial side cards peeking, ← → arrow buttons mid-screen, "Paso 1/3" + progress dots below, full-width "Next · Siguiente" button, "Volver al Inicio" text link at bottom
- The aesthetic in the reference was sci-fi/dark — adapt layout pattern to the project's Apple minimalist style (white/light bg, clean typography, #0071E3 accents)

### Card illustrations per option (user-specified)
**Step 1 — Workload:**
- Productividad & Estudio → notebook, bar charts, or multiple browser windows (isometric)
- Creación & Desarrollo → video editing timeline interface or code node graph
- Gaming & Rendimiento → disassembled joystick (isometric) or PC fan/turbine

**Step 2 — Lifestyle:**
- Máxima Portabilidad → feather or ultra-thin laptop silhouette profile view
- Potencia Bruta → stylized engine block or robust microchip with heat sinks
- Ecosistema (Apple) → wireframe of connected devices (phone + watch + laptop)

**Step 3 — Budget:**
- Esencial → coin or simple ascending curve chart
- Equilibrado → flat-style balance scale (architectural line style)
- Premium / Sin Límites → faceted diamond in geometric wireframe lines or infinity symbol

### Profile naming convention
- Profile names combine the 3 choices meaningfully (e.g., "Creador Portable Equilibrado", "Gamer Potente Premium")
- 27 profile names + descriptions to be authored manually in Supabase

### "Reroll the cards" UX
- Profile avatar in Navbar is tappable → sheet/popover
- Shows profile name, description, maybe the 3 selected cards as small thumbnails
- "Rehacer quiz" button clears state and goes to `/quiz`

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-discovery-quiz*
*Context gathered: 2026-03-20*
