# Phase 4: Comparison Tool - Research

**Researched:** 2026-04-02
**Domain:** Next.js 16.2 / React 19 / Tailwind v4 / Framer Motion — UI comparison page
**Confidence:** HIGH

## Summary

Phase 4 adds a dedicated `/compare` page: a self-contained comparison tool where users pick up to 3 laptops (2 on mobile) and see them side by side with technical spec rows. The Navbar already contains a `[ Compare ]` link pointing to `/compare`, and the `src/components/compare/` folder is scaffolded but empty. No database changes are needed — the page reuses `fetchAllLaptops()` and the existing `Laptop` type unchanged.

All primary dependencies are already installed: framer-motion 12.38.0, @base-ui/react 1.3.0 (powers Sheet/drawer), lucide-react, and Tailwind v4. The `SpecRow` component in `catalog-card.tsx` renders the `[ label: value ]` bracket style and must be extracted (or duplicated) into `src/components/compare/` for use in comparison cards. The `FilterDrawer` / `Sheet` pattern is the exact mechanism to reuse for the laptop picker modal.

The mockup (verified visually) confirms: large "Comparador" heading, `[2] [3] [4]` slot-count indicator, two-column cards on mobile with a filled card (image + spec rows) left and a dashed-border empty slot right, a "+" icon centered in empty slots, and spec rows separated by thin dividers.

**Primary recommendation:** Build three focused components — `CompareCard` (filled slot), `EmptySlot` (dashed "+" card), `LaptopPicker` (Sheet with search) — and compose them in `ComparatorClient` with local React state. No router params, no persistence, no Zustand.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Dedicated page at `/compare`, linked from Navbar as a top-level nav item.
- **D-02:** No "add to compare" trigger on the catalog cards — the comparator is self-contained. Users select laptops from within the compare page itself.
- **D-03:** Page loads with 2 slots: slot 1 is pre-filled with a random laptop from the catalog, slot 2 is an empty "+" dashed slot.
- **D-04:** When both slots are filled (desktop only), a 3rd "+" slot appears alongside the two filled laptops.
- **D-05:** Mobile cap: maximum 2 laptops on mobile. The 3rd slot is desktop-only (`hidden sm:flex` pattern or similar breakpoint).
- **D-06:** Max 3 laptops total (RF3.1). No 4th slot ever.
- **D-07:** Empty slot: dashed border card, large "+" icon centered, "Seleccionar PC N..." label below (N = slot number). Matches the reference mockup.
- **D-08:** When an empty slot is tapped, open a modal/drawer to select a laptop.
- **D-09:** Tapping "+" opens a modal or bottom drawer containing the full catalog list with a search input.
- **D-10:** Search filters by name and brand in real time.
- **D-11:** Already-selected laptops are greyed out / disabled in the picker (prevent duplicates).
- **D-12:** Each laptop column shows specs as horizontal rows separated by dividers — matching the reference mockup style.
- **D-13:** Spec rows (in order): Model name (header), GPU, CPU, RAM, Storage, Price.
- **D-14:** Technical specs only — no "for dummies" simplified tags in the comparison view.
- **D-15:** Spec labels use the existing bracket style where applicable: `[ GPU: NVIDIA RTX 4090 ]` — consistent with CatalogCard's `SpecRow` pattern.
- **D-16:** Cards are equal-width columns laid out in a flex row. On desktop: up to 3 columns. On mobile: 2 columns max.
- **D-17:** Page header: large "Comparador" title + slot count indicator (e.g., `[2] [3] [4]` bracket tabs showing how many laptops are being compared).
- **D-18:** Selected laptop card: laptop image at top (square, object-cover) → model name → spec rows.
- **D-19:** Apple-minimalist aesthetic — consistent with the rest of the app (white/light bg in light mode, dark in dark mode). The mockup's dark aesthetic is the dark mode variant.
- **D-20:** Small X button on each filled card to remove and reset that slot to "+".
- **D-21:** Comparison state is local React state (no persistence needed; compare page is ephemeral).

### Claude's Discretion

- Exact animation/transition when a laptop is added or removed from a slot
- Whether the slot count indicator is interactive (clickable tabs) or purely decorative
- Exact modal vs bottom-sheet decision for the picker on mobile
- Loading skeleton for the random pre-filled laptop on first render

### Deferred Ideas (OUT OF SCOPE)

- "For dummies" simplified spec toggle in the comparison view — out of scope for this phase, could be Phase 6 improvement
- Sharing/exporting the comparison — future phase
- Saving a comparison to favorites — future phase
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RF3.1 | Select at least 2 and up to 3 laptops for side-by-side comparison | Slot system (D-03 through D-06) maps directly; local state array `slots: (Laptop | null)[]` with max length 3 |
| RF3.2 | Visual comparison of simplified specs — user has overridden to technical text rows | Spec row pattern from `catalog-card.tsx` SpecRow component; D-12 through D-15 define exact rows and bracket style |
</phase_requirements>

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.0 | App Router page at `/compare` | Project standard |
| React | 19.2.4 | Component model + local state | Project standard |
| Tailwind CSS | v4 (CSS-based) | Layout, responsive breakpoints, dark mode | Project standard |
| framer-motion | 12.38.0 | Slot appear/disappear animations | Already used in catalog page |
| @base-ui/react | 1.3.0 | Sheet component (powers picker drawer) | Project's UI primitive library |
| lucide-react | 0.577.0 | Icons: `Plus`, `X`, `Search` | Project standard |
| class-variance-authority | 0.7.1 | Button variants | Already used project-wide |

### No New Installs Required
Every dependency is already in `package.json`. Phase 4 is purely additive UI work.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── compare/
│       └── page.tsx          # Server Component wrapper (Suspense boundary)
└── components/
    └── compare/
        ├── comparator-client.tsx    # "use client" — all state, orchestration
        ├── compare-card.tsx         # Filled slot: image + name + spec rows + X button
        ├── empty-slot.tsx           # Dashed "+" card
        ├── laptop-picker.tsx        # Sheet-based picker with search
        └── compare-spec-row.tsx     # [ label: value ] row (extracted from CatalogCard)
```

### Pattern 1: Server Page + Client Orchestrator
Mirrors the existing `/catalog` pattern exactly.

```typescript
// src/app/compare/page.tsx
import { Suspense } from "react";
import { ComparatorClient } from "@/components/compare/comparator-client";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-muted-foreground">Cargando...</div>}>
      <ComparatorClient />
    </Suspense>
  );
}
```

### Pattern 2: Local Slot State
Decision D-21 mandates local React state — no URL params, no localStorage.

```typescript
// Inside comparator-client.tsx
const [slots, setSlots] = useState<(Laptop | null)[]>([null, null]);
// slot[0] starts pre-filled with random laptop after data load
// slot[1] starts null
// slot[2] conditionally exists (desktop only) when slots 0+1 are filled
```

The slot array has a dynamic length (2 or 3), not a fixed 3, to keep the "3rd slot appears when both filled" logic simple:
- Length 2: always visible (slot 0 filled, slot 1 empty on initial load)
- Length 3: added client-side when slots[0] and slots[1] are both non-null AND viewport is >= sm breakpoint

**Desktop-only 3rd slot:** Use a `useMediaQuery("(min-width: 640px)")` hook (or the existing `useSheetSide` pattern in `filter-drawer.tsx`) to gate slot-3 visibility.

### Pattern 3: Pre-fill Random Laptop
```typescript
useEffect(() => {
  async function load() {
    const all = await fetchAllLaptops();
    setAllLaptops(all);
    if (all.length > 0) {
      const random = all[Math.floor(Math.random() * all.length)];
      setSlots([random, null]);
    }
  }
  load();
}, []);
```

### Pattern 4: Picker Sheet (reuse FilterDrawer architecture)
The `LaptopPicker` component mirrors the `FilterDrawer` pattern:
- Uses the same `useSheetSide()` hook: `"bottom"` on mobile, `"left"` on desktop
- Opens when an empty slot is tapped, passes back the chosen laptop
- Greys out already-selected laptops via `opacity-40 pointer-events-none` on list items

```typescript
interface LaptopPickerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  laptops: Laptop[];
  disabledIds: string[];  // IDs already in slots
  onSelect: (laptop: Laptop) => void;
}
```

### Pattern 5: CompareSpecRow (extracted from CatalogCard)
The existing `SpecRow` in `catalog-card.tsx` is a local function (not exported). Extract/duplicate it:

```typescript
// src/components/compare/compare-spec-row.tsx
export function CompareSpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 text-[12px] font-mono text-foreground leading-none border-t border-border">
      [ {label}: {value} ]
    </div>
  );
}
```

In the comparison card, spec rows are separated by `border-t border-border` (inline dividers), matching the mockup.

### Pattern 6: Slot Count Indicator `[2] [3] [4]`
From the mockup, the active slot count bracket is visually highlighted (rounded pill, lighter background). This maps to a simple decorative indicator:

```tsx
// The [2] tab is "active" (highlighted) when 2 slots exist, etc.
const slotCount = slots.length; // 2 or 3
{[2, 3].map((n) => (
  <span
    key={n}
    className={cn(
      "px-3 py-1 font-mono text-[14px] border border-border rounded-full",
      slotCount === n ? "bg-foreground text-background" : "text-muted-foreground"
    )}
  >
    [{n}]
  </span>
))}
```

Note: the mockup shows `[2] [3] [4]` but D-06 caps at 3 total. The indicator shows `[2]` and `[3]` only (or just counts the active slots). Claude's Discretion applies to whether these are interactive.

### Pattern 7: Framer Motion Slot Transitions
Reuse the `AnimatePresence` + `motion.div` pattern from `catalog-client.tsx`:

```typescript
// Slot card appear animation
<AnimatePresence mode="popLayout">
  {slots.map((laptop, i) => (
    <motion.div
      key={laptop?.id ?? `empty-${i}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {laptop ? (
        <CompareCard laptop={laptop} onRemove={() => removeSlot(i)} />
      ) : (
        <EmptySlot slotNumber={i + 1} onAdd={() => openPicker(i)} />
      )}
    </motion.div>
  ))}
</AnimatePresence>
```

`mode="popLayout"` ensures smooth reflow when the 3rd slot appears/disappears.

### Anti-Patterns to Avoid
- **Exporting SpecRow from catalog-card.tsx:** Do not modify catalog-card.tsx to export SpecRow. Duplicate/extract it into `compare-spec-row.tsx` to avoid coupling between catalog and compare features.
- **URL state for comparison:** D-21 is explicit — no URL params, no router.push for slot state. Keep it 100% local React state.
- **Three fixed slots always rendered:** Do not render all 3 slots unconditionally and hide the 3rd with CSS alone — this causes React key confusion during AnimatePresence. Dynamically add slot 3 to the array.
- **Using `<img>` without error handling:** The catalog pattern uses `onError` + fallback div. Apply the same to CompareCard images.
- **Nested `<main>` elements:** The root `layout.tsx` wraps content in `<main>`. The compare page's ComparatorClient should use a `<div>` or `<section>` wrapper, not another `<main>`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bottom sheet / modal picker | Custom absolute-positioned overlay | `Sheet` from `@base-ui/react` (already used in FilterDrawer) | Focus trap, keyboard nav, backdrop, animation — all handled |
| Responsive side detection | Manual window resize listener | `useSheetSide()` hook already written in `filter-drawer.tsx` | Already handles SSR hydration safely with `useEffect` |
| Slot appear/disappear animation | CSS transitions on conditional renders | `AnimatePresence` + `motion.div` from framer-motion | Handles exit animations correctly — CSS can't animate unmounting elements |
| Real-time search in picker | Debounce + state machinery | Simple `useMemo` filter on `query` state string | Catalog picker list is small; no debounce needed |

**Key insight:** Nearly every piece of this feature is a composition of already-built project patterns. The risk is over-engineering, not under-engineering.

## Common Pitfalls

### Pitfall 1: Navbar already has `/compare` — but route doesn't exist yet
**What goes wrong:** Clicking "Compare" in the current navbar gives a 404.
**Why it happens:** The navbar was updated earlier with `{ href: "/compare", label: "Compare" }` but the route was never created.
**How to avoid:** First task of Wave 0 or Plan 1 must be creating `src/app/compare/page.tsx`.
**Warning signs:** Build succeeds but navigating to `/compare` shows Next.js 404.

### Pitfall 2: Sheet `side="bottom"` on desktop cuts off tall picker list
**What goes wrong:** Bottom sheet has `max-h-[88vh]` (from `filter-drawer.tsx`), which may truncate a long laptop list.
**Why it happens:** Bottom sheet height is constrained; list doesn't scroll independently.
**How to avoid:** Use the `useSheetSide()` pattern — `"left"` on desktop (full height panel), `"bottom"` on mobile. The FilterDrawer already demonstrates this correctly.
**Warning signs:** Laptop list items invisible at bottom of picker on desktop.

### Pitfall 3: `AnimatePresence` key collisions when slot goes empty → filled → empty
**What goes wrong:** Animation glitches or components don't re-animate when a slot cycles.
**Why it happens:** Using `key={i}` (index) means React sees no change when a new laptop replaces an old one at the same index.
**How to avoid:** Use `key={laptop?.id ?? \`empty-${i}\`}` — the key changes when the laptop changes, triggering a proper exit + enter cycle.
**Warning signs:** New laptop card slides in without animating, or X button removes card without exit animation.

### Pitfall 4: Mobile 3rd slot logic leaking into viewport
**What goes wrong:** The 3rd slot appears on mobile, breaking the 2-column layout.
**Why it happens:** The media query hook initializes to a default before hydration, briefly showing 3 columns.
**How to avoid:** Initialize `const [isDesktop, setIsDesktop] = useState(false)` and set it in `useEffect`. This matches the `useSheetSide()` approach in filter-drawer. Alternatively, render the 3rd slot but wrap it in `hidden sm:flex` CSS — but then it's in the DOM; the JS-gated approach is cleaner for slot logic.
**Warning signs:** Brief layout flash on mobile showing 3 columns then collapsing to 2.

### Pitfall 5: `fetchAllLaptops()` called twice — once for slots, once for picker
**What goes wrong:** Two Supabase requests on page load.
**Why it happens:** Data fetched in ComparatorClient for pre-fill, then fetched again inside LaptopPicker.
**How to avoid:** Fetch once in `ComparatorClient`, store in `allLaptops` state, pass the array as a prop to `LaptopPicker`. This matches the catalog pattern where data flows down.

### Pitfall 6: `<main>` nesting — layout.tsx wraps in `<main>` already
**What goes wrong:** Nested `<main>` elements fail HTML validation and may cause accessibility issues.
**Why it happens:** `catalog-client.tsx` uses `<main className="px-4 sm:px-8 py-16">` — this is technically incorrect given the root layout already has `<main className="min-h-screen">`. Follow the catalog pattern but use `<div>` or `<section>` in the compare client to avoid further nesting.
**Warning signs:** HTML validator reports nested `<main>` elements.

## Code Examples

### Empty Slot Card
```tsx
// Source: D-07, D-08 from CONTEXT.md + mockup visual
export function EmptySlot({ slotNumber, onAdd }: { slotNumber: number; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card hover:border-foreground/40 transition-colors aspect-[3/4] w-full"
      aria-label={`Seleccionar PC ${slotNumber}`}
    >
      <Plus className="size-8 text-muted-foreground mb-2" />
      <span className="text-[13px] text-muted-foreground font-mono">
        Seleccionar PC {slotNumber}...
      </span>
    </button>
  );
}
```

### CompareCard skeleton structure
```tsx
// Source: D-12, D-13, D-15, D-18 from CONTEXT.md
export function CompareCard({ laptop, onRemove }: { laptop: Laptop; onRemove: () => void }) {
  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      {/* Remove button */}
      <button onClick={onRemove} className="absolute top-2 right-2 z-10" aria-label="Quitar">
        <X className="size-4 text-muted-foreground hover:text-foreground" />
      </button>
      {/* Image */}
      <div className="aspect-square w-full bg-muted">
        <img src={laptop.image_url} alt={laptop.name} className="w-full h-full object-cover" />
      </div>
      {/* Model name header */}
      <div className="px-3 py-2.5 font-semibold text-[13px] text-foreground leading-snug">
        {laptop.name}
      </div>
      {/* Spec rows */}
      <CompareSpecRow label="GPU" value={laptop.gpu} />
      <CompareSpecRow label="CPU" value={laptop.cpu} />
      <CompareSpecRow label="RAM" value={laptop.ram} />
      <CompareSpecRow label="Alma" value={laptop.storage} />
      <CompareSpecRow label="Precio" value={`$${laptop.price.toLocaleString()} USD`} />
    </div>
  );
}
```

### Columns layout with responsive 3rd slot
```tsx
// D-16, D-05 — flex row, equal width columns
<div className="flex gap-3 sm:gap-4 items-start">
  {/* Slot 0 — always rendered */}
  <div className="flex-1 min-w-0"> ... </div>
  {/* Slot 1 — always rendered */}
  <div className="flex-1 min-w-0"> ... </div>
  {/* Slot 2 — desktop only, conditional on both 0+1 filled */}
  {isDesktop && slots[0] && slots[1] && (
    <div className="flex-1 min-w-0"> ... </div>
  )}
</div>
```

### useSheetSide hook (already exists — copy from filter-drawer.tsx)
```typescript
// Source: src/components/catalog/filter-drawer.tsx (existing pattern)
function useSheetSide(): "left" | "bottom" {
  const [side, setSide] = useState<"left" | "bottom">("bottom");
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setSide(mq.matches ? "left" : "bottom");
    const handler = (e: MediaQueryListEvent) => setSide(e.matches ? "left" : "bottom");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return side;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn/ui radix Dialog/Sheet | @base-ui/react Dialog as Sheet primitive | Phase 01 (project start) | SheetTrigger uses `render` prop pattern, not `asChild` |
| tailwind.config.ts | CSS-based config via `globals.css @theme` | Phase 01 | No tailwind.config.ts file; tokens in globals.css |
| HSL color tokens | oklch color format | Phase 01 | All color tokens are oklch; don't use hex/hsl |
| Inter font | Roboto font via `next/font` | Phase 01 | CSS var is `--font-roboto`, class on `<html>` |

**Deprecated/outdated in this project:**
- `asChild` prop on SheetTrigger: Not supported by base-ui. Use the `render` prop pattern instead (see navbar.tsx line 89).
- `tailwind.config.ts`: Does not exist. All Tailwind customization is in `globals.css`.

## Open Questions

1. **Slot count indicator interactivity**
   - What we know: Mockup shows `[2] [3] [4]` bracket tabs. D-17 describes it as an indicator. Claude's Discretion.
   - What's unclear: Should clicking `[3]` expand to 3 slots, or should it just reflect current state?
   - Recommendation: Make it purely decorative (reflects current slot count). Adding interactivity creates competing UX with the "+" slot card itself.

2. **Picker as Sheet vs inline modal**
   - What we know: D-09 says "modal or bottom drawer." Sheet pattern (`@base-ui/react`) is already used for FilterDrawer.
   - What's unclear: Whether to use `Sheet` (slides from side/bottom) or a centered `Dialog` on desktop.
   - Recommendation: Use `Sheet` with the same `useSheetSide()` pattern for consistency with FilterDrawer — no new component types needed.

3. **Random pre-fill seed stability**
   - What we know: D-03 says slot 1 pre-fills with a random laptop. On re-render/refresh it'll pick a different one.
   - What's unclear: Should the random pick be stable within a session?
   - Recommendation: Use `useState` initialized to `null`, then set it once in `useEffect` after data loads. This gives one stable random pick per page visit, without any persistence.

## Environment Availability

Step 2.6: SKIPPED — Phase 4 is purely UI/component work. No new external tools, services, CLIs, or runtimes are required. All dependencies already installed in node_modules.

## Validation Architecture

`workflow.nyquist_validation` key is absent from `.planning/config.json` — treating as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test config files or test directories in project |
| Config file | None (no jest.config.*, vitest.config.*, pytest.ini found) |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RF3.1 | Max 3 slots, min 2 always shown, 3rd slot appears when 0+1 filled on desktop | manual-only | N/A — no test framework | N/A |
| RF3.2 | Spec rows display GPU, CPU, RAM, Storage, Price in bracket style | manual-only | N/A — no test framework | N/A |

### Sampling Rate
- No automated test framework is installed. Validation is manual browser testing.
- Recommended manual checklist per plan: verify slot behavior on mobile (375px) and desktop (1280px) widths.

### Wave 0 Gaps
No test infrastructure exists project-wide. Installing a test framework is out of scope for this phase. Manual browser testing is the validation strategy.

## Sources

### Primary (HIGH confidence)
- Direct file reads: `src/components/catalog/catalog-card.tsx`, `filter-drawer.tsx`, `detail-overlay.tsx`, `catalog-client.tsx`, `navbar.tsx`, `sheet.tsx` — all patterns verified from source
- `src/types/laptop.ts` — confirmed available fields (gpu, cpu, ram, storage, price, image_url, name, id)
- `package.json` — confirmed all dependencies installed, framer-motion 12.38.0
- `/Users/FranciscoAnnoni/Downloads/3-comparador.png` — mockup read directly (visual confirmation of layout)
- `04-CONTEXT.md` — all decisions D-01 through D-21 locked

### Secondary (MEDIUM confidence)
- Next.js App Router page pattern — confirmed by existing `/catalog/page.tsx` and `/quiz/page.tsx` in project

### Tertiary (LOW confidence)
- None — all findings come from direct project file reads.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via package.json and node_modules
- Architecture: HIGH — patterns verified from existing source files in this project
- Pitfalls: HIGH — identified from actual project code patterns and known React/framer-motion behaviors
- Mockup interpretation: HIGH — image read directly

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable; no external API dependencies)
