# Phase 3: Product Catalog & Detail View - Research

**Researched:** 2026-03-24
**Domain:** Next.js App Router catalog page, Supabase filtered queries, Framer Motion overlay, base-ui/shadcn component patterns
**Confidence:** HIGH

---

## Summary

Phase 3 builds the laptop catalog at `/catalog` as a pure client-driven page (no SSR required — filters and localStorage reads are client-only). The stack is already fully installed: Next.js 16.2, Tailwind v4, Framer Motion 12.38, base-ui 1.3 (shadcn Sheet/Card/Button), lucide-react, and Supabase JS client. No new packages are needed.

The biggest architectural decision is how the detail overlay handles deep-linking. `ResultLaptopCard` currently navigates to `/catalog/${laptop.id}` — a URL route. The CONTEXT decision is that the overlay is NOT a navigation but a state layer on top of `/catalog`. The recommended pattern is a parallel `@modal` route segment (Next.js App Router intercepting route) OR a URL-search-param approach (`/catalog?laptop=<id>`). The search-param approach is simpler: catalog page reads `?laptop=` from `useSearchParams()`, renders the `DetailOverlay` when present, and updates the URL via `router.push`/`router.replace` without a page transition. This keeps the overlay closeable via browser Back and shareable via URL without adding a new route segment.

Supabase query strategy: load all laptops once (`select * from laptops`) and filter client-side. With the catalog likely under a few hundred rows this is viable and eliminates waterfall round-trips for each filter change. For the first 100 results "paginated" requirement: slice the client-side filtered array to 100 then expose a "Cargar más" button that advances the slice.

**Primary recommendation:** Client-side filter + slice pagination over Supabase data; `?laptop=<id>` search-param for detail overlay; Framer Motion `AnimatePresence` + `motion.div` for the overlay enter/exit.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Catalog Page Structure — Two Sections
- Section 1 — Quiz Profile (conditional): Visible only if user has a completed profile in localStorage. Shows two buttons: "Rehacer quiz" and "Ver laptops del perfil". Does NOT display the 5 cards inline — user taps to navigate.
- Section 2 — Global Catalog: All laptops in a single-column list (mobile-first; columns expanded in future iterations). Filtered and searchable.
- No "featured" or "promoted" laptop — all treated equally in the global catalog.

#### Catalog Card Design
- Cards are elongated/tall — distinct from the compact quiz result cards.
- Card layout (top to bottom): square product image → title → price → description → simplified_tags as pills → tech spec labels (CPU, RAM, storage, GPU, battery) → "Ver más" button.
- Laptops with an influencer recommendation show a star badge (★) in the top-right corner of the card.
- Tapping "Ver más" opens a full-screen overlay (not page navigation).

#### Filter & Search
- A "Filtrar" button opens a drawer/panel with all available filter options; user configures and confirms.
- Filter dimensions: brand, price range, screen size, weight, usage profile, OS, and any available spec field.
- Text search: instant-filter by name, brand, or any text field.
- Results are paginated — first 100 results load after applying filters; real-time updates as filters change.
- Empty state: friendly message suggesting to remove filters.

#### Detail Overlay
- Opens as a full-screen overlay on top of the catalog (not a new route/navigation). Close button in top-right corner.
- Layout: product image beside title and price (not hero at top).
- Specs always visible — dummies/tech toggle is removed entirely. Show simplified_tags + all tech specs together, no switch.
- Tech spec labels displayed: CPU, RAM, storage, GPU, battery, OS, screen size, weight.
- "Comprar Ahora" button: generic but prominent, links to affiliate_link (external, opens new tab).
- Influencer section (only in overlay, not in catalog card): "Recomendación de experto" label + influencer_note text + score shown as "X/10".
- Laptops without an influencer note: no influencer section in overlay.

#### Database Schema Updates (laptops table)
The following columns must be added to the existing `laptops` Supabase table and `Laptop` TypeScript type:
- `os` (text)
- `screen_size` (text)
- `weight` (text)
- `battery` (text)

#### Profiles Table (backend clarification)
- The `profiles` table maps 81 combinations: `workload × lifestyle × budget × os_preference` (3×3×3×3).
- This phase must ensure the Supabase `profiles` table schema and seed data account for all 81 rows.

#### Dummies/Tech Mode Toggle — Removed
- The dummies/tech mode toggle concept is fully removed from the app.
- `simplified_tags` field is kept in the data model and displayed as tag pills on cards — just without any toggle mechanism.

### Claude's Discretion
- Exact drawer/panel component for filters (shadcn Sheet or custom)
- Pagination implementation details (infinite scroll vs. load-more button)
- Overlay animation (Framer Motion entry/exit)
- Skeleton loading for catalog and detail overlay
- Filter chip display in the active-filters summary

### Deferred Ideas (OUT OF SCOPE)
- Multi-column grid layout (2-3 cols on tablet/desktop) — Phase 5 polish iteration
- Sorting options (price asc/desc, score, name) — add to backlog
- Laptop comparison "select to compare" from catalog cards — Phase 4
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RF2.1 | List of laptops curated by the influencer | Supabase `select * from laptops` query; client-side render |
| RF2.2 | Each laptop entry must show image, model name, simplified benefits, personal recommendation note, price | CatalogCard component with all fields from Laptop type; star badge for influencer_note presence |
| RF2.3 | Filtering and sorting capabilities (Price, Brand, Usage) | Client-side filter state + useMemo filtering; FilterDrawer via shadcn Sheet |
| RF4.1 | Full details of a laptop, including both technical and simplified specs | DetailOverlay component; Laptop type extended with os/screen_size/weight/battery |
| RF4.2 | Direct link to purchase or view externally | "Comprar Ahora" button → affiliate_link, target="_blank" rel="noopener noreferrer" |
| RNF1.1 | Mobile-first responsive design | Single-column catalog list; overlay full-screen on mobile |
| RNF1.2 | Apple Minimalist aesthetic | Existing design tokens in globals.css; no new tokens needed |
| RNF1.3 | Minimalist animations (fade-ins, smooth slide transitions) | Framer Motion 12.38 AnimatePresence + motion.div for overlay; stagger for card list mount |
| RNF2.1 | Fast initial load (especially on mobile) | Skeleton loading; single Supabase fetch; client-side slice pagination |
| RNF2.2 | High accessibility standards (WCAG 2.1 Level AA) | 44px touch targets; aria-label on star badge and close button; focus trap via Sheet (Radix Dialog primitives) |
</phase_requirements>

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.0 | App Router, page routing, useSearchParams | Already installed; App Router is the project pattern |
| @supabase/supabase-js | ^2.99.2 | Data fetching from `laptops` table | Established Supabase singleton in project |
| framer-motion | 12.38.0 | DetailOverlay slide-up animation + card stagger | Already installed; AnimatePresence required for mount/unmount animation |
| @base-ui/react | 1.3.0 | Sheet (FilterDrawer), Button, Card primitives | Established in Phase 1 via shadcn base-nova preset |
| lucide-react | ^0.577.0 | Icons: Search, Filter, X, Cpu, HardDrive, Star, etc. | Established icon library per components.json |
| tailwindcss | ^4 | Utility classes, design tokens | Established; CSS-based config via globals.css @theme |
| tw-animate-css | ^1.4.0 | Skeleton shimmer via `animate-pulse` | Already imported in globals.css |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation `useSearchParams` | built-in | Read `?laptop=<id>` to trigger overlay | CatalogPage client component for overlay state |
| next/navigation `useRouter` | built-in | Push/replace URL when opening/closing overlay | DetailOverlay open/close handlers |
| React `useMemo` | built-in | Derive filtered + sliced laptop list from raw data + filter state | Avoids re-filtering on every render unrelated to filter changes |
| React `useCallback` | built-in | Stable filter change handlers | Prevent unnecessary re-renders in FilterDrawer |
| React `useState` | built-in | Filter state, pagination offset, drawer open state | CatalogPage orchestrates all local state |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side filtering | Supabase server-side filtered queries | Server queries add latency per filter change; client-side is instant with small datasets |
| `?laptop=<id>` search param | Next.js intercepting route `@modal` | Intercepting routes are more powerful but add folder complexity; search-param is sufficient here |
| Load-more button | Infinite scroll (IntersectionObserver) | Load-more is simpler, more accessible, works without JS scroll events |

**Installation:** No new packages required. All dependencies already present.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── catalog/
│       └── page.tsx              # Server Component shell → renders CatalogClient
├── components/
│   └── catalog/
│       ├── catalog-client.tsx    # "use client" — owns all state, reads useSearchParams
│       ├── catalog-card.tsx      # "use client" — card with hover animation
│       ├── catalog-skeleton.tsx  # Server-compatible (no state)
│       ├── detail-overlay.tsx    # "use client" — Framer Motion AnimatePresence
│       ├── filter-drawer.tsx     # "use client" — Sheet from base-ui
│       └── active-filter-bar.tsx # "use client" — dismissible chip row
├── lib/
│   └── catalog-data.ts           # fetchAllLaptops() Supabase query
└── types/
    └── laptop.ts                 # Add: os, screen_size, weight, battery fields
```

### Pattern 1: Server Component Shell + Client Island

**What:** `src/app/catalog/page.tsx` is a Server Component that renders `<CatalogClient />` (a `"use client"` component). The server component itself does nothing but render the client island.

**When to use:** When the page requires `useSearchParams`, `useState`, or localStorage — all client-only APIs.

**Why not fetch in Server Component:** `useSearchParams()` is required to read the `?laptop=<id>` query param for the overlay. Server Components cannot use React hooks. The full catalog data fetch happens inside `CatalogClient` via `useEffect` → Supabase client (already a browser singleton).

```typescript
// src/app/catalog/page.tsx
import { CatalogClient } from "@/components/catalog/catalog-client";

export default function CatalogPage() {
  return <CatalogClient />;
}
```

### Pattern 2: URL Search Param for Overlay State

**What:** Detail overlay open/close state is persisted in the URL as `?laptop=<uuid>`. Opening an overlay calls `router.push("/catalog?laptop=<id>")`. Closing calls `router.push("/catalog")`. The overlay is rendered in `CatalogClient` by reading `searchParams.get("laptop")`.

**Why not component state:** URL-based state makes the overlay back-button closeable and the URL shareable. No new route segment needed.

```typescript
// Inside CatalogClient (simplified)
const searchParams = useSearchParams();
const activeLaptopId = searchParams.get("laptop");
const activeLaptop = useMemo(
  () => laptops.find((l) => l.id === activeLaptopId) ?? null,
  [laptops, activeLaptopId]
);

// Opening:
router.push(`/catalog?laptop=${laptop.id}`, { scroll: false });

// Closing:
router.push("/catalog", { scroll: false });
```

### Pattern 3: Framer Motion AnimatePresence for Full-Screen Overlay

**What:** `DetailOverlay` is wrapped in `AnimatePresence`. It renders conditionally based on `activeLaptop !== null`. Framer Motion handles enter (slide-up from y:100%) and exit (slide-down) animations.

**Key constraint:** `AnimatePresence` requires the animated child to have a unique `key` prop, and the condition must be on the child — not the parent — for exit animations to fire correctly.

```typescript
// Source: Framer Motion 12 docs — AnimatePresence conditional rendering
import { AnimatePresence, motion } from "framer-motion";

// Inside CatalogClient render:
<AnimatePresence>
  {activeLaptop && (
    <motion.div
      key={activeLaptop.id}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1],   // Apple spring (enter)
      }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <DetailOverlay laptop={activeLaptop} onClose={handleClose} />
    </motion.div>
  )}
</AnimatePresence>
```

**Exit duration:** use a separate `exit` prop with `duration: 0.25` and `ease: "easeIn"` as specified in UI-SPEC.

### Pattern 4: Client-Side Filtering with useMemo

**What:** All laptops are fetched once. Filter state is React `useState`. A `useMemo` derives the filtered+sliced result.

```typescript
const filteredLaptops = useMemo(() => {
  let result = laptops;

  // Text search — name, brand, simplified_tags
  if (searchText) {
    const q = searchText.toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.simplified_tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Brand filter
  if (filters.brands.length > 0) {
    result = result.filter((l) => filters.brands.includes(l.brand));
  }

  // Price range
  if (filters.priceMin !== null) result = result.filter((l) => l.price >= filters.priceMin!);
  if (filters.priceMax !== null) result = result.filter((l) => l.price <= filters.priceMax!);

  // OS
  if (filters.os.length > 0) result = result.filter((l) => filters.os.includes(l.os));

  // ... other dimensions

  return result;
}, [laptops, searchText, filters]);

const visibleLaptops = useMemo(
  () => filteredLaptops.slice(0, page * PAGE_SIZE),
  [filteredLaptops, page]
);
```

`PAGE_SIZE = 100` per CONTEXT decision.

### Pattern 5: shadcn Sheet for FilterDrawer (base-ui pattern)

**What:** Use existing `Sheet` + `SheetContent` with `side="bottom"` on mobile (default) and `side="right"` on desktop. Established render-prop trigger pattern from Navbar.

```typescript
// Source: existing sheet.tsx and navbar.tsx patterns
<Sheet open={filterOpen} onOpenChange={setFilterOpen}>
  <SheetTrigger render={<button aria-label="Abrir filtros" />}>
    <Filter className="size-4" />
    <span>Filtrar</span>
  </SheetTrigger>
  <SheetContent
    side="bottom"          // mobile: bottom sheet
    className="md:data-[side=bottom]:hidden"  // hide bottom sheet on desktop
  >
    ...
  </SheetContent>
</Sheet>
```

**NOTE on responsive side:** base-ui Sheet does not support dynamic `side` based on viewport at render time (it's a static prop). Recommended approach: use `side="bottom"` universally — the Sheet's `max-h` and `rounded-t-xl` class on the content make it natural on all breakpoints. This matches the FilterDrawer layout spec.

### Anti-Patterns to Avoid

- **Using `ResultLaptopCard` for catalog cards:** The UI-SPEC explicitly requires a new `CatalogCard` component with a different elongated layout. Do not modify or extend `ResultLaptopCard`.
- **Supabase filtered queries per filter change:** Each filter change calling Supabase adds 100-500ms latency. Fetch once, filter client-side.
- **`router.push` with full scroll reset:** Always pass `{ scroll: false }` when opening/closing overlay to prevent page jumping.
- **Using OFFSET pagination with Supabase:** The skill `data-pagination.md` flags this as MEDIUM-HIGH impact issue. Use cursor-based OR client-side slicing. Since we filter client-side, slicing the in-memory array is preferred.
- **Rendering `AnimatePresence` children without `key` prop:** Exit animations will not fire. The `key` must be on the direct child of `AnimatePresence`.
- **Using `Link` inside `Button` (base-ui):** The existing codebase decision: base-ui Button does not support `asChild`. Wrap `Link` outside `Button` or use a native `<a>` element inside `Button` children. For "Comprar Ahora" as an external link: use `<a href={laptop.affiliate_link} target="_blank" rel="noopener noreferrer">` styled as a button via `buttonVariants` CVA class directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Filter drawer panel | Custom modal/panel | shadcn `Sheet` (already in `/ui/sheet.tsx`) | Focus trap, keyboard dismiss, accessibility handled by base-ui Dialog primitives |
| Slide-up overlay animation | CSS keyframes or JS timers | Framer Motion `AnimatePresence` + `motion.div` | Exit animations require mount/unmount lifecycle integration that only AnimatePresence provides |
| Skeleton loading shimmer | Custom shimmer CSS | `animate-pulse` from tw-animate-css (already imported) | Already available; matches existing design tokens |
| Search debounce | Manual `setTimeout`/`clearTimeout` | Inline debounce with `useCallback` + `useRef` OR simply accept the `useMemo` cost (tiny dataset) | For < 200 items, 200ms debounce with `useRef` timer is sufficient; no library needed |
| Focus trap in overlay | Custom focus management | Framer Motion overlay renders above everything; if using Sheet for overlay, base-ui handles it. If using `motion.div`, add `onKeyDown` for Escape + initial focus via `autoFocus` on close button | Custom focus management has subtle bugs on screen readers |

**Key insight:** Every UI primitive needed (Sheet, Card, Button) is already installed. The work is composition, not installation.

---

## Database Schema Updates

### Supabase Table Migration

Add 4 columns to the `laptops` table:

```sql
-- Migration: add Phase 3 spec columns
ALTER TABLE laptops
  ADD COLUMN IF NOT EXISTS os TEXT,
  ADD COLUMN IF NOT EXISTS screen_size TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS battery TEXT;
```

These are nullable TEXT columns with no constraints — they display "—" in the UI when null.

### TypeScript Type Update

```typescript
// src/types/laptop.ts — add to Laptop interface
os: string | null;          // e.g., "Windows 11", "macOS Sequoia"
screen_size: string | null; // e.g., '14"'
weight: string | null;      // e.g., "1.4 kg"
battery: string | null;     // e.g., "Up to 18h"
```

All 4 are nullable because existing rows won't have data until seed/update is run.

### Profiles Table — 81 Combinations

The `profiles` table requires rows for all 81 combinations of:
- `workload`: productividad_estudio | creacion_desarrollo | gaming_rendimiento (3)
- `lifestyle`: maxima_portabilidad | movil_flexible | escritorio_fijo (3)
- `budget`: esencial | equilibrado | premium (3)
- `os_preference`: windows | macos | abierto (3)

3 × 3 × 3 × 3 = 81 rows. This phase must seed all missing rows. The seed script should use a cross-product of the 4 enum arrays with `upsert` (on conflict do nothing) to be idempotent.

### Indexes for Catalog Queries

Per the project's Supabase Postgres skill:

```sql
-- Support brand filtering
CREATE INDEX IF NOT EXISTS laptops_brand_idx ON laptops (brand);

-- Support OS filtering (new column)
CREATE INDEX IF NOT EXISTS laptops_os_idx ON laptops (os);

-- Support influencer_note presence check (star badge in card)
CREATE INDEX IF NOT EXISTS laptops_influencer_note_idx ON laptops (influencer_note)
  WHERE influencer_note IS NOT NULL;
```

The `usage_profiles` column already has a GIN index (established in Phase 01-03 per STATE.md).

---

## Common Pitfalls

### Pitfall 1: AnimatePresence Exit Animation Not Firing

**What goes wrong:** The overlay closes instantly without the slide-down exit animation.
**Why it happens:** `AnimatePresence` requires the animated child to unmount conditionally. If the condition is placed on a wrapper instead of the direct child, or if `key` is missing, Framer Motion cannot intercept the unmount.
**How to avoid:** Place the conditional `{activeLaptop && <motion.div key={activeLaptop.id} ...>}` as a direct child of `<AnimatePresence>`. Never wrap it in an extra div with the condition.
**Warning signs:** Overlay disappears without animation on close.

### Pitfall 2: useSearchParams Requires Suspense Boundary

**What goes wrong:** Build error — "useSearchParams() should be wrapped in a suspense boundary".
**Why it happens:** In Next.js App Router, `useSearchParams()` causes the component to opt into dynamic rendering. Without a Suspense boundary, the static shell cannot pre-render.
**How to avoid:** Wrap `CatalogClient` (the component calling `useSearchParams`) inside `<Suspense fallback={<CatalogSkeleton />}>` in `catalog/page.tsx`.

```typescript
// src/app/catalog/page.tsx
import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton count={6} />}>
      <CatalogClient />
    </Suspense>
  );
}
```

### Pitfall 3: base-ui Button Does Not Support asChild

**What goes wrong:** "Comprar Ahora" needs to be an `<a>` tag (external link) but render as a primary Button style.
**Why it happens:** base-ui `Button` does not have `asChild` prop (established decision from Phase 01-02 STATE.md).
**How to avoid:** Use `buttonVariants()` from CVA directly on a native `<a>` element:

```typescript
import { buttonVariants } from "@/components/ui/button";

<a
  href={laptop.affiliate_link}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`Comprar ${laptop.name} (abre en nueva pestaña)`}
  className={buttonVariants({ variant: "default", size: "lg" })}
>
  Comprar Ahora
</a>
```

### Pitfall 4: localStorage Read on Server

**What goes wrong:** Server Component reading `localStorage` throws `ReferenceError: localStorage is not defined`.
**Why it happens:** `localStorage` is browser-only. If any parent component is a Server Component and tries to read it, it crashes.
**How to avoid:** All localStorage reads (`PROFILE_STORAGE_KEY`) must happen inside `CatalogClient` (a `"use client"` component) within a `useEffect`.

### Pitfall 5: influencer_note Is Currently Non-Nullable in TypeScript

**What goes wrong:** TypeScript type `Laptop.influencer_note: string` — not nullable. Checking `laptop.influencer_note` for truthiness may mislead if empty string is stored.
**Why it happens:** The current type definition in `src/types/laptop.ts` declares `influencer_note: string` (non-nullable). The CONTEXT requires showing the influencer section only when `influencer_note is not null`. A database row with an empty string would pass a `!== null` check but show blank content.
**How to avoid:** Update `influencer_note: string | null` in the TypeScript type, and use `laptop.influencer_note !== null && laptop.influencer_note.length > 0` as the guard. Same applies to `recommendation_score`.

### Pitfall 6: Sheet side Prop Cannot Be Dynamic

**What goes wrong:** Attempting to set `side={isMobile ? "bottom" : "right"}` causes hydration mismatch.
**Why it happens:** Server and client may disagree on `isMobile` during SSR. The `side` prop determines CSS class names baked into the component.
**How to avoid:** Use `side="bottom"` consistently. Control visual width via `className` on `SheetContent` — on desktop, override with `sm:max-w-md` (or similar) to give the filter drawer a right-side-panel feel without changing the slide direction. The existing `SheetContent` already has `data-[side=right]:sm:max-w-sm` responsive class.

---

## Code Examples

Verified patterns from existing codebase:

### Supabase: Fetch All Laptops

```typescript
// src/lib/catalog-data.ts
import { supabase } from "@/lib/supabase";
import type { Laptop } from "@/types/laptop";

export async function fetchAllLaptops(): Promise<Laptop[]> {
  const { data, error } = await supabase
    .from("laptops")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Laptop[]) ?? [];
}
```

### Framer Motion: Stagger Card List Mount

```typescript
// Source: Framer Motion 12 docs — staggerChildren
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04, // 40ms stagger per UI-SPEC
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

// Usage:
<motion.ul variants={containerVariants} initial="hidden" animate="show">
  {visibleLaptops.map((laptop) => (
    <motion.li key={laptop.id} variants={cardVariants}>
      <CatalogCard laptop={laptop} onVerMas={handleVerMas} />
    </motion.li>
  ))}
</motion.ul>
```

### CatalogCard: Star Badge Pattern

```typescript
// Absolute-positioned badge, only renders when influencer_note is truthy
{laptop.influencer_note && (
  <span
    aria-label="Recomendado por experto"
    className="absolute top-2 right-2 text-primary text-lg leading-none select-none"
  >
    ★
  </span>
)}
```

### Filter State Shape

```typescript
interface CatalogFilters {
  brands: string[];
  priceMin: number | null;
  priceMax: number | null;
  screenSizes: string[];
  weights: string[];
  usageProfiles: UsageProfile[];
  os: string[];
}

const EMPTY_FILTERS: CatalogFilters = {
  brands: [],
  priceMin: null,
  priceMax: null,
  screenSizes: [],
  weights: [],
  usageProfiles: [],
  os: [],
};
```

### ActiveFilterBar: Dismissible Chip

```typescript
// Filter chip with dismiss
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-small border border-border">
  {label}
  <button
    onClick={() => onRemove(filterKey)}
    aria-label={`Quitar filtro ${label}`}
    className="ml-0.5 hover:text-foreground"
  >
    <X className="size-3" />
  </button>
</span>
```

---

## Validation Architecture

Config `workflow.nyquist_validation` is not present (key absent) — treat as enabled. However, the project has no test infrastructure (`package.json` has no test script, no test directory, no test framework). This phase does not add test infrastructure — the planner should note no automated test commands exist.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RF2.1 | Catalog renders all laptops from Supabase | manual-smoke | N/A — no test runner | ❌ Wave 0 |
| RF2.2 | Card shows image, name, price, tags, specs, star badge | manual-visual | N/A | ❌ Wave 0 |
| RF2.3 | Filters narrow visible laptop list | manual-interaction | N/A | ❌ Wave 0 |
| RF4.1 | Detail overlay shows full specs | manual-visual | N/A | ❌ Wave 0 |
| RF4.2 | "Comprar Ahora" opens affiliate link in new tab | manual-interaction | N/A | ❌ Wave 0 |

### Wave 0 Gaps

No test infrastructure exists. Manual verification via `npm run dev` is the only test path for this phase. Adding test infrastructure is out of scope for Phase 3 per project CONTEXT.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `asChild` prop (Radix UI pattern) | render prop pattern (base-ui) | Phase 01-02 | All trigger components use `render={<element />}` not `asChild` |
| HSL color tokens | oklch color tokens | Phase 01-01 | All color values in globals.css use oklch format |
| `tailwind.config.ts` | CSS-based `@theme inline` in globals.css | Phase 01-01 (Tailwind v4) | No tailwind.config.ts file exists |
| Toggle dummies/tech mode | Removed entirely | Phase 03 context | `simplified_tags` still exists as data; no toggle UI |

**Deprecated/outdated:**
- `dummies_mode` / tech toggle: fully removed. Do not create any state or UI for it.
- `influencer_note: string` (non-nullable): must be updated to `string | null` to match database reality.

---

## Open Questions

1. **Existing laptop data in Supabase — os/screen_size/weight/battery populated?**
   - What we know: 4 new columns will be added via ALTER TABLE migration.
   - What's unclear: Whether existing laptop rows have data for these fields (likely empty/null after migration). Seed data may need updating.
   - Recommendation: Plan a seed task that updates existing laptop rows with realistic placeholder values for os/screen_size/weight/battery. Otherwise the DetailOverlay will show blank spec rows.

2. **ProfileResult storage shape in localStorage**
   - What we know: `PROFILE_STORAGE_KEY` stores a `ProfileResult & { laptops: Laptop[] }` object (from `QuizResult`).
   - What's unclear: The catalog's "Ver laptops del perfil" button needs to filter the catalog to only the profile's `laptop_ids`. Should it (a) navigate with a search param `?profile=true` and read localStorage, or (b) navigate to `/quiz/result` to re-show the quiz result page?
   - Recommendation: Implement as a filter: tap "Ver laptops del perfil" sets a transient `profileFilter` state in `CatalogClient` that filters `laptops` to those in `completedProfile.laptop_ids`. No navigation needed. Clear the filter via ActiveFilterBar or "Limpiar todo".

3. **ResultLaptopCard links to `/catalog/${laptop.id}` — route vs overlay mismatch**
   - What we know: `ResultLaptopCard` uses `<Link href={'/catalog/${laptop.id}'}>`. With the `?laptop=<id>` search-param approach, this link will route to a 404.
   - What's unclear: Whether to create a redirect from `/catalog/[id]` to `/catalog?laptop=[id]` or update `ResultLaptopCard` to use the new URL pattern.
   - Recommendation: Update `ResultLaptopCard`'s link to `/catalog?laptop=${laptop.id}` as part of this phase. This is a 1-line change in an existing file.

---

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/types/laptop.ts`, `src/types/quiz.ts`, `src/lib/quiz-data.ts`, `src/components/ui/sheet.tsx`, `src/components/ui/button.tsx`, `src/components/layout/navbar.tsx`, `src/components/quiz/result-laptop-card.tsx`, `src/app/globals.css`
- `package.json` — verified all installed versions
- `.planning/phases/03-product-catalog-detail-view/03-CONTEXT.md` — locked decisions
- `.planning/phases/03-product-catalog-detail-view/03-UI-SPEC.md` — visual/interaction contract
- `.claude/skills/supabase-postgres-best-practices/references/data-pagination.md` — pagination pattern
- `.claude/skills/supabase-postgres-best-practices/references/query-missing-indexes.md` — index guidance
- `.planning/STATE.md` — established decisions (render prop, asChild, oklch tokens)

### Secondary (MEDIUM confidence)
- Framer Motion 12 AnimatePresence pattern: verified against installed version 12.38.0 in node_modules; API is stable and unchanged since v10
- Next.js App Router `useSearchParams` + Suspense requirement: well-documented Next.js 13+ behavior, consistent with Next.js 16.2

### Tertiary (LOW confidence)
- None. All claims are verifiable from codebase inspection or installed library versions.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json, versions confirmed from node_modules
- Architecture: HIGH — patterns derived from existing codebase (Navbar, ResultLaptopCard, Sheet usage)
- Database schema: HIGH — derived from CONTEXT.md locked decisions + existing Laptop type
- Pitfalls: HIGH — grounded in existing codebase decisions (render prop, asChild, oklch) and documented Next.js behaviors
- Validation: HIGH — confirmed no test infrastructure exists in package.json

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable framework stack; 30 days)
