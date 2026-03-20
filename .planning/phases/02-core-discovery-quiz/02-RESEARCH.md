# Phase 2: Core Discovery Quiz - Research

**Researched:** 2026-03-20
**Domain:** Next.js App Router, Framer Motion carousel, Supabase profile lookup, localStorage state, React 19
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Quiz Structure**
- 3 steps × 3 cards = 27 profile combinations (3×3×3 = exact mathematical profiling)
- Each step shows a carousel of 3 cards; user navigates carousel to center the desired option, then taps Next
- Step 1 — Workload: Productividad & Estudio / Creación & Desarrollo / Gaming & Rendimiento
- Step 2 — Lifestyle: Máxima Portabilidad / Potencia Bruta / Ecosistema (Apple)
- Step 3 — Budget: Esencial / Equilibrado / Premium

**Card Interaction (Carousel Mechanic)**
- Cards face-up from start — ultra-minimalist: illustration + label only (no descriptions on card face)
- Layout: center card large and prominent, left/right cards partially visible (peeking) on both sides
- Left (←) and right (→) arrow buttons to navigate the carousel
- Center card = selected option — gets blue accent border (#0071E3) + subtle scale-up (scale 1.03)
- "Next · Siguiente" full-width button fixed at bottom to advance to next step
- "Volver al Inicio" exit link at very bottom, always visible
- Back arrow at top to return to previous step (preserves previous selection)
- Each card has a thematic illustration (see Specific Ideas for illustration descriptions per card)

**Profile-to-Laptop Mapping (Supabase)**
- A `profiles` Supabase table with 27 rows (one per combination)
- Columns: `workload` (enum), `lifestyle` (enum), `budget` (enum), `laptop_ids` (UUID[5]), `profile_name` (text), `profile_description` (text), `profile_image_url` (text)
- 27 fixed profiles — curated manually, not computed dynamically
- When quiz completes, look up the matching profile row by (workload, lifestyle, budget) and fetch the 5 laptops

**Quiz State (localStorage)**
- Quiz answers (step 1/2/3 selections) stored in localStorage — no user accounts, no DB writes for answers
- Completed profile result also stored locally: profile name, description, image, and 5 laptop IDs
- On app load: check localStorage — if profile exists, show profile avatar in Navbar

**Profile in Navbar**
- After quiz completion, a profile avatar/image appears in the Navbar (right side, replacing or alongside the "Find My Laptop" CTA)
- Tapping the profile avatar shows a popover/sheet with: profile name, description, and a "Rehacer quiz" button
- "Rehacer quiz" clears localStorage quiz data and navigates to `/quiz`

**Result View**
- Top section: profile name + short profile description + "Tus 5 mejores opciones" heading
- Body: vertical scroll list of 5 laptop cards
- Each laptop card shows: product image, model name, 2-3 simplified_tags, price, "Ver más" CTA
- Dummies/tech mode toggle applies to result cards — shows simplified_tags or technical specs
- Brief loading spinner/skeleton while fetching profile + laptops from Supabase

**Quiz Flow & Navigation**
- Progress indicator: "Paso X/3" label + segmented progress bar below the question heading
- Back arrow per step returns to previous carousel with selection preserved
- Step transitions: horizontal slide animation (Framer Motion) — steps slide left/right
- Result transition: fade in after spinner resolves
- "Volver al Inicio" always visible at bottom as a text link

### Claude's Discretion
- Exact Framer Motion animation parameters (duration, easing) — defined in UI-SPEC: 300ms easeInOut steps, 400ms easeOut result, spring(300, 30) drag
- Carousel snap behavior implementation details (CSS scroll snap vs JS) — UI-SPEC: Framer Motion JS as primary, CSS scroll-snap as fallback
- Skeleton loading design for result view — UI-SPEC: 5 animated pulse skeleton cards
- Error state if profile lookup fails (no match found) — UI-SPEC: role="alert", Spanish copy defined
- How to handle swipe gestures on mobile — UI-SPEC: Framer Motion drag="x" with 40px threshold

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 2 builds the full quiz experience at `/quiz`: a 3-step carousel quiz that maps user answers to one of 27 fixed profiles stored in Supabase, then renders the 5 recommended laptops for that profile. The UI-SPEC is fully approved and defines exact animation parameters, component inventory, accessibility contract, and copywriting.

The most critical pre-implementation finding is that **framer-motion is not yet installed** in the project. It is listed in `.planning/CONTEXT.md` and `STATE.md` as a chosen dependency but is absent from `package.json`. This must be the first task in Wave 0. Additionally, the shadcn `card` component has not yet been added to `src/components/ui/` and is required by `ResultLaptopCard`.

The architecture is a state-machine `QuizShell` component that owns step index + selections, persists to localStorage, and renders either the step carousel or the result view. All 11 new components are clearly defined in the UI-SPEC's Component Inventory table.

**Primary recommendation:** Build `QuizShell` as a single client component with a step state machine; delegate animation concerns to Framer Motion `AnimatePresence`; treat localStorage as the sole persistence layer; use a single Supabase `profiles` lookup query with a `.eq()` filter on all three enum columns.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.38.0 (latest) | Step slide transitions, carousel drag, result fade, avatar reveal | Already decided in CONTEXT.md; not yet installed |
| @supabase/supabase-js | ^2.99.2 (installed) | `profiles` table lookup + laptop IDs fetch | Singleton already at `src/lib/supabase.ts` |
| next | 16.2.0 (installed) | App Router, `"use client"` boundary, `useRouter` for navigation | Project foundation |
| react | 19.2.4 (installed) | `useState`, `useEffect`, `useCallback` for quiz state machine | Project foundation |
| lucide-react | ^0.577.0 (installed) | `ChevronLeft`, `ChevronRight`, `ArrowLeft` icons for nav arrows | Already installed |
| tailwindcss | ^4 (installed) | All layout, spacing, color tokens — `scale-[1.03]`, `animate-pulse` | Project foundation |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @base-ui/react | ^1.3.0 (installed) | `Dialog` (Sheet) for profile popover — render prop pattern | Profile avatar → sheet uses existing `sheet.tsx` |
| shadcn (card component) | N/A — CLI add | `ResultLaptopCard` base | Must be added via `npx shadcn add card` before building result view |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion drag for swipe | CSS scroll-snap only | Pure CSS loses the 40px threshold snap control and spring physics |
| localStorage | React Context only | Context resets on page reload; localStorage survives navigation away from `/quiz` |
| Supabase `profiles` table | Hardcoded profile map in JS | Hardcoded prevents CMS editing of profile names/descriptions; Supabase is already the data layer |

**Installation (missing dependencies):**
```bash
npm install framer-motion
npx shadcn add card
```

**Version verification (conducted 2026-03-20):**
- `framer-motion`: 12.38.0 (npm registry, verified)
- `shadcn card`: added via CLI, version follows shadcn preset

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── quiz/
│       ├── page.tsx                    # Route entry — renders QuizShell
│       └── result/                     # Optional sub-route (or same page with state)
├── components/
│   └── quiz/
│       ├── quiz-shell.tsx              # Step state machine + localStorage sync
│       ├── quiz-step.tsx               # Single step: heading + progress + carousel
│       ├── option-carousel.tsx         # Framer Motion carousel, 3 cards
│       ├── option-card.tsx             # Card face: illustration + label + selected state
│       ├── step-progress.tsx           # "Paso X/3" + segmented bar
│       ├── quiz-result.tsx             # Profile header + 5 laptop cards
│       ├── result-laptop-card.tsx      # Card: image, name, tags, price, "Ver más"
│       ├── result-skeleton.tsx         # 5 animated skeleton cards
│       ├── profile-sheet.tsx           # Profile sheet content (used by Navbar)
│       └── profile-avatar.tsx          # 32px circle with ring-primary
└── lib/
    └── supabase.ts                     # Existing singleton — add profiles query
```

### Pattern 1: Step State Machine in QuizShell

**What:** A single client component holds all quiz state: `currentStep` (0-2), `selections` (array[3]), `quizComplete`, `profileData`. All child components receive state via props.

**When to use:** When multiple steps share state and need coordinated transitions + localStorage persistence.

**Example:**
```typescript
// src/components/quiz/quiz-shell.tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QuizStep } from "./quiz-step";
import { QuizResult } from "./quiz-result";

const QUIZ_STORAGE_KEY = "quiz_state";

type QuizSelections = [string | null, string | null, string | null];

interface QuizState {
  selections: QuizSelections;
  completedProfile: ProfileResult | null;
}

export function QuizShell() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<QuizSelections>([null, null, null]);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [quizComplete, setQuizComplete] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (saved) {
      const parsed: QuizState = JSON.parse(saved);
      setSelections(parsed.selections);
    }
  }, []);

  const handleNext = () => {
    setDirection(1);
    if (currentStep === 2) {
      setQuizComplete(true);
    } else {
      setCurrentStep((s) => s + 1);
    }
    // persist selections to localStorage
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ selections }));
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  if (quizComplete) {
    return <QuizResult selections={selections} />;
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={currentStep}
        custom={direction}
        initial={{ x: direction * 60 + "%" , opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: direction * -60 + "%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <QuizStep
          stepIndex={currentStep}
          currentSelection={selections[currentStep]}
          onSelect={(value) => {
            const next = [...selections] as QuizSelections;
            next[currentStep] = value;
            setSelections(next);
          }}
          onNext={handleNext}
          onBack={handleBack}
        />
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 2: Framer Motion Carousel with Drag

**What:** The `OptionCarousel` tracks a `centerIndex` (0-2). Drag gesture with 40px threshold snaps to adjacent card. Arrow buttons also move `centerIndex`. The center card receives `aria-pressed="true"` and the selected visual state.

**When to use:** 3-option carousel with drag support and accessible arrow nav.

**Example:**
```typescript
// src/components/quiz/option-carousel.tsx
"use client";

import { motion, useAnimation } from "framer-motion";

interface OptionCarouselProps {
  options: Array<{ value: string; label: string; illustration: React.ReactNode }>;
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function OptionCarousel({ options, selectedValue, onSelect }: OptionCarouselProps) {
  const centerIndex = options.findIndex((o) => o.value === selectedValue) ?? 1;
  // Default center to index 1 if nothing selected yet

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -40 && centerIndex < 2) {
      onSelect(options[centerIndex + 1].value);
    } else if (info.offset.x > 40 && centerIndex > 0) {
      onSelect(options[centerIndex - 1].value);
    }
  };

  return (
    <div className="relative flex items-center justify-center overflow-visible">
      {/* Arrow buttons — 44px tap targets */}
      <button
        aria-label="Opción anterior"
        className="absolute left-0 z-10 flex items-center justify-center w-11 h-11"
        onClick={() => centerIndex > 0 && onSelect(options[centerIndex - 1].value)}
      />
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="flex gap-4"
      >
        {options.map((option, i) => {
          const isCenter = i === centerIndex;
          return (
            <motion.div
              key={option.value}
              animate={{
                scale: isCenter ? 1.03 : 0.92,
                opacity: isCenter ? 1 : 0.6,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`
                w-[280px] md:w-[320px] shrink-0 rounded-2xl border-2
                ${isCenter ? "border-primary ring-2 ring-primary/20" : "border-border"}
              `}
            >
              {/* OptionCard content */}
            </motion.div>
          );
        })}
      </motion.div>
      <button
        aria-label="Opción siguiente"
        className="absolute right-0 z-10 flex items-center justify-center w-11 h-11"
        onClick={() => centerIndex < 2 && onSelect(options[centerIndex + 1].value)}
      />
    </div>
  );
}
```

### Pattern 3: Supabase Profiles Lookup

**What:** After quiz completion, fetch the single matching profile row by all three enum values, then fetch the 5 laptops by their IDs.

**When to use:** Quiz completion → result view data fetching.

**Example:**
```typescript
// src/lib/supabase.ts — add alongside existing queries
import { supabase } from "@/lib/supabase";

export type WorkloadEnum = "productividad_estudio" | "creacion_desarrollo" | "gaming_rendimiento";
export type LifestyleEnum = "maxima_portabilidad" | "potencia_bruta" | "ecosistema_apple";
export type BudgetEnum = "esencial" | "equilibrado" | "premium";

export async function fetchProfile(
  workload: WorkloadEnum,
  lifestyle: LifestyleEnum,
  budget: BudgetEnum
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("workload", workload)
    .eq("lifestyle", lifestyle)
    .eq("budget", budget)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchLaptopsByIds(ids: string[]) {
  const { data, error } = await supabase
    .from("laptops")
    .select("*")
    .in("id", ids);

  if (error) throw error;
  return data;
}
```

### Pattern 4: localStorage Profile Sync with Navbar

**What:** Navbar reads `localStorage` on mount to determine if a completed profile exists. This drives the conditional render of `ProfileAvatar` vs "Find My Laptop" CTA.

**When to use:** Any component that needs to react to quiz completion state without a global store.

**Example:**
```typescript
// Inside Navbar (additive change only)
const [completedProfile, setCompletedProfile] = useState<StoredProfile | null>(null);

useEffect(() => {
  const saved = localStorage.getItem("quiz_completed_profile");
  if (saved) setCompletedProfile(JSON.parse(saved));
}, []);

// In JSX — replace "Find My Laptop" CTA slot:
{completedProfile ? (
  <ProfileAvatar profile={completedProfile} />
) : (
  <Button>
    <Link href="/quiz">Find My Laptop &rarr;</Link>
  </Button>
)}
```

### Pattern 5: Supabase Profiles Table DDL

**What:** The `profiles` table with composite unique constraint on (workload, lifestyle, budget) and a composite index for the lookup query.

**Per Supabase skill:** Use composite indexes for queries that filter by multiple columns (schema-partial-indexes rule). The lookup is always by all three enum columns — a composite index is correct here.

```sql
-- Supabase SQL editor
CREATE TYPE workload_enum AS ENUM (
  'productividad_estudio',
  'creacion_desarrollo',
  'gaming_rendimiento'
);

CREATE TYPE lifestyle_enum AS ENUM (
  'maxima_portabilidad',
  'potencia_bruta',
  'ecosistema_apple'
);

CREATE TYPE budget_enum AS ENUM (
  'esencial',
  'equilibrado',
  'premium'
);

CREATE TABLE profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workload    workload_enum NOT NULL,
  lifestyle   lifestyle_enum NOT NULL,
  budget      budget_enum NOT NULL,
  laptop_ids  uuid[] NOT NULL,           -- Array of 5 laptop UUIDs
  profile_name        text NOT NULL,
  profile_description text NOT NULL,
  profile_image_url   text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (workload, lifestyle, budget)   -- Enforces exactly 27 rows
);

-- Composite index: the lookup is always WHERE workload=? AND lifestyle=? AND budget=?
CREATE INDEX idx_profiles_lookup
  ON profiles (workload, lifestyle, budget);
```

### Anti-Patterns to Avoid

- **Global carousel state in URL params:** Don't encode the selected carousel option in query params — it causes a full-page re-render on each arrow click. Keep it in component state only.
- **Fetching laptops in a loop:** Don't call `supabase.from("laptops").select().eq("id", id)` 5 times. Use `.in("id", ids)` for a single query.
- **Reading localStorage in render:** Always read localStorage inside `useEffect` — SSR will fail otherwise (Next.js App Router renders server-side first).
- **AnimatePresence outside the condition:** The `AnimatePresence` wrapper must contain the conditionally rendered element, not be inside it.
- **Putting `"use client"` on `app/quiz/page.tsx`:** The page can be a Server Component; `QuizShell` carries the `"use client"` boundary. This preserves the ability to add server-side metadata later.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Step slide transitions | Custom CSS keyframes + JS class toggling | Framer Motion `AnimatePresence` + `motion.div` | Direction-aware enter/exit is 30+ lines of state management custom; AnimatePresence handles unmount animation automatically |
| Carousel drag snap | Touch event listeners + requestAnimationFrame | Framer Motion `drag="x"` + `onDragEnd` | Cross-browser touch/mouse unification, velocity-based snap, spring physics |
| Skeleton loading | Custom pulsing divs with CSS animations | Tailwind `animate-pulse` on placeholder divs | Already in Tailwind — 1 class, consistent timing |
| Sheet/modal for profile | Custom portal + focus trap | Existing `sheet.tsx` (base-ui Dialog) | Focus trap, escape key, ARIA roles all handled |
| Profile image circle | Custom CSS circle | Tailwind `rounded-full w-8 h-8 ring-2 ring-primary` | Design token aligned, no custom CSS |
| Enum validation | Zod schema for profile lookup | TypeScript union types for enum values | 27 fixed rows — TypeScript types sufficient, no runtime validation needed |

**Key insight:** Every interactive primitive in this phase already exists in the project stack (Framer Motion for animation, base-ui for modals, Tailwind for styling). The work is composition, not construction.

---

## Common Pitfalls

### Pitfall 1: localStorage SSR Crash

**What goes wrong:** `localStorage is not defined` error in production build or during hydration.

**Why it happens:** Next.js App Router renders components on the server first. `localStorage` is a browser-only API — accessing it outside `useEffect` causes an error during server render.

**How to avoid:** Always wrap `localStorage` access in `useEffect`. Never call `localStorage.getItem()` during render or in module-level code.

**Warning signs:** Build errors mentioning `window is not defined`, hydration mismatch warnings, or errors only appearing after `next build` (not `next dev`).

```typescript
// WRONG — crashes on server
const [profile, setProfile] = useState(
  JSON.parse(localStorage.getItem("quiz_completed_profile") ?? "null")
);

// CORRECT
const [profile, setProfile] = useState<StoredProfile | null>(null);
useEffect(() => {
  const saved = localStorage.getItem("quiz_completed_profile");
  if (saved) setProfile(JSON.parse(saved));
}, []);
```

### Pitfall 2: AnimatePresence key Collision

**What goes wrong:** Step transitions play in the wrong direction or skip entirely.

**Why it happens:** `AnimatePresence` tracks children by `key`. If the key doesn't change between steps, no exit/enter animation fires. If the `key` prop is the same for step 0 on forward and backward navigation, direction logic also breaks.

**How to avoid:** Pass `key={currentStep}` on the `motion.div` inside `AnimatePresence`. Pass `custom={direction}` and use the `custom` parameter in `variants` to determine x offset direction.

### Pitfall 3: Carousel Initial State (No Selection)

**What goes wrong:** On step load, no card is "center" because `selections[stepIndex]` is null. The carousel renders with all cards at scale 0.92 and no accent border.

**Why it happens:** Initial state has no selection. The carousel needs a default visual center.

**How to avoid:** Default the carousel to display the middle card (index 1) as visually centered on first load, but don't auto-write a selection to state. Only write to `selections` state when the user navigates arrows or taps a card. The "Next" button should be enabled only after the user has made an explicit selection.

### Pitfall 4: Supabase `.single()` Throwing on No Match

**What goes wrong:** `fetchProfile()` throws an error if no matching profile row exists (e.g., bad data seed, missing combination).

**Why it happens:** Supabase `.single()` returns an error object with `code: "PGRST116"` when 0 rows are returned.

**How to avoid:** Wrap the fetch in a try/catch and render the error state defined in the UI-SPEC (`role="alert"`, "No encontramos tu perfil" copy). Log the combination to console in development to help identify missing seed data.

### Pitfall 5: Profiles Table Not Seeded Before Testing

**What goes wrong:** Quiz completes but result view shows only the error state because the `profiles` table is empty.

**Why it happens:** The Supabase schema can be created but the 27 rows must be seeded manually before the quiz end-to-end flow works.

**How to avoid:** Wave 0 must include a seed SQL script for all 27 profiles. Without seed data, the result view cannot be tested at all. Include at least one complete seed row (e.g., "productividad_estudio + maxima_portabilidad + esencial") as a smoke test fixture.

### Pitfall 6: Navbar localStorage Read During SSR

**What goes wrong:** `ProfileAvatar` flickers on load (shows "Find My Laptop", then flashes to avatar).

**Why it happens:** The server renders the Navbar without localStorage (shows the CTA), then the client hydrates and reads localStorage (shows the avatar). This causes a visible flash.

**How to avoid:** Use `useState(null)` with `useEffect` read pattern (same as Pitfall 1). Render a stable placeholder during the SSR pass (e.g., render nothing in the avatar slot until hydration completes). This is acceptable UX given no user accounts.

---

## Code Examples

Verified patterns from existing project code and official Framer Motion docs:

### AnimatePresence for Step Transitions (Framer Motion 12.x)

```typescript
// Source: Framer Motion official docs — AnimatePresence with mode="wait"
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={{
      enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
    }}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {/* quiz step content */}
  </motion.div>
</AnimatePresence>
```

### Framer Motion Drag for Carousel (Framer Motion 12.x)

```typescript
// Source: Framer Motion official docs — drag with dragConstraints
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.15}
  onDragEnd={(_, info) => {
    if (info.offset.x < -40) moveCarousel(1);
    if (info.offset.x > 40) moveCarousel(-1);
  }}
  // Spring physics for snap
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
```

### Result Fade-In After Async Fetch

```typescript
// Source: Framer Motion official docs — animate on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  <QuizResult data={profileData} />
</motion.div>
```

### shadcn Card Component (to be added)

```bash
npx shadcn add card
# Generates: src/components/ui/card.tsx
# Usage in ResultLaptopCard:
```
```typescript
import { Card, CardContent, CardFooter } from "@/components/ui/card";
```

### Segmented Progress Bar

```typescript
// StepProgress component — no external dependency needed
export function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-small text-muted-foreground">Paso {currentStep + 1}/3</span>
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label="Progreso del quiz"
        className="flex gap-1"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= currentStep ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

### Profile Avatar + Sheet in Navbar (render prop pattern)

```typescript
// Matches existing base-ui SheetTrigger render prop pattern in sheet.tsx
<Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
  <SheetTrigger
    render={
      <button
        aria-label={`Tu perfil: ${profile.profile_name}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary"
      />
    }
  >
    <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
  </SheetTrigger>
  <SheetContent side="right">
    {/* ProfileSheet content */}
  </SheetContent>
</Sheet>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Radix UI (Radix Dialog) | base-ui Dialog via shadcn base-nova | shadcn base-nova preset | `SheetTrigger` uses `render` prop, not `asChild` — existing `sheet.tsx` already implements this |
| `framer-motion` v10 (useTransform, etc) | `framer-motion` v12 — `motion()` function, same AnimatePresence API | 2024 | v12 API for `AnimatePresence`, `motion.div`, `drag` is unchanged from v10/v11; upgrade-safe patterns above |
| HSL Tailwind tokens | oklch-based tokens via Tailwind v4 | Phase 1 | All color references must use CSS custom properties (`var(--primary)`, `text-primary`) not raw oklch values inline |
| `tailwind.config.ts` | CSS-only `@theme inline` in `globals.css` | Tailwind v4 | No `tailwind.config.ts` exists — extend theme via `globals.css` only |

**Deprecated/outdated:**
- `asChild` prop on SheetTrigger: Does not work with base-ui. Use `render` prop instead (already established in existing `sheet.tsx`).
- `next/router` (Pages Router): Not applicable — project uses App Router (`src/app/`). Use `useRouter` from `next/navigation`.

---

## Open Questions

1. **Framer Motion v12 compatibility with React 19**
   - What we know: framer-motion 12.38.0 is the current latest; React 19.2.4 is installed
   - What's unclear: Whether there are any known hydration issues with framer-motion 12 + React 19 (React 19 changed the hydration model)
   - Recommendation: Install and do a quick smoke test of `<motion.div>` in the quiz page before building all 11 components. No blockers reported in recent community posts as of 2026-03-20, but LOW confidence — verify during Wave 0.

2. **Profile image source for Navbar avatar**
   - What we know: `profiles.profile_image_url` is a text column; after quiz completion the URL is stored in localStorage
   - What's unclear: Whether profile images will be provided as Supabase Storage URLs or external URLs, and whether they'll be ready when the phase begins implementation
   - Recommendation: Build `ProfileAvatar` to accept an optional `imageUrl` and gracefully fall back to a colored initials circle (initials from profile name) if `imageUrl` is null or fails to load.

3. **Illustration SVGs source**
   - What we know: 9 SVG illustrations are required per the UI-SPEC Illustration Contract; 120×120px, monochromatic, flat/isometric line art
   - What's unclear: Whether the illustrations will be authored as static SVG files committed to the repo, imported as React components, or served from Supabase Storage
   - Recommendation: Place SVGs in `src/components/quiz/illustrations/` as React SVG components (`.tsx` files that export `() => <svg>…</svg>`). This is tree-shaken, type-safe, and avoids an additional image fetch per card.

---

## Validation Architecture

`workflow.nyquist_validation` is not present in `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or test directories found |
| Config file | None — Wave 0 must set up if tests are needed |
| Quick run command | N/A until framework installed |
| Full suite command | N/A until framework installed |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RF1.1 | Multi-step quiz renders 3 steps | unit | TBD | Wave 0 gap |
| RF1.2 | All 3 question types render correct options | unit | TBD | Wave 0 gap |
| RF1.3 | Profile lookup returns correct profile for given (workload, lifestyle, budget) | integration (Supabase mock) | TBD | Wave 0 gap |
| RNF1.1 | Quiz layout is mobile-first (no horizontal scroll) | manual/visual | N/A | manual |
| RNF1.3 | Step transitions animate smoothly | manual/visual | N/A | manual |
| RNF2.2 | All interactive elements have 44px touch target | manual/axe | N/A | manual |

### Sampling Rate

- **Per task commit:** Manual smoke test — navigate to `/quiz`, complete all 3 steps, verify result view renders
- **Per wave merge:** If unit test framework added in Wave 0: `npm test`
- **Phase gate:** Full manual walkthrough of quiz + profile avatar + "Rehacer quiz" flow before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `framer-motion` package install: `npm install framer-motion`
- [ ] shadcn card component: `npx shadcn add card` — generates `src/components/ui/card.tsx`
- [ ] Supabase `profiles` table: create DDL (SQL above) + seed at minimum 1 complete profile row
- [ ] `src/app/quiz/` directory: create `page.tsx` route entry
- [ ] `src/components/quiz/` directory: currently empty, all 11 components to be created
- [ ] SVG illustrations directory: `src/components/quiz/illustrations/` (9 SVG components)

---

## Sources

### Primary (HIGH confidence)

- Existing project code at `src/` — confirmed installed packages, component patterns, and base-ui render prop pattern
- `package.json` — confirmed framer-motion is NOT installed, all other deps verified
- `src/components/ui/sheet.tsx` — confirmed base-ui render prop pattern for SheetTrigger
- `src/components/layout/navbar.tsx` — confirmed existing Navbar structure for profile avatar integration point
- `src/types/laptop.ts` — confirmed `UsageProfile` type needs extending for new enum values
- `.planning/phases/02-core-discovery-quiz/02-CONTEXT.md` — all locked decisions
- `.planning/phases/02-core-discovery-quiz/02-UI-SPEC.md` — animation parameters, component inventory, accessibility contract
- npm registry — `framer-motion` 12.38.0 verified 2026-03-20

### Secondary (MEDIUM confidence)

- Framer Motion v12 `AnimatePresence` + `drag` API — patterns based on training knowledge of v10/v11/v12 (API has been stable across versions); recommend verifying against official docs during Wave 0
- Supabase `.single()` error behavior (`PGRST116`) — based on known Supabase JS client behavior, consistent with `@supabase/supabase-js` v2 docs

### Tertiary (LOW confidence)

- React 19 + framer-motion 12 hydration compatibility — no known issues as of training knowledge cutoff August 2025; version 12.38.0 postdates cutoff, verify during Wave 0 smoke test

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against npm registry and package.json; framer-motion absence confirmed
- Architecture: HIGH — based directly on UI-SPEC Component Inventory and existing project patterns
- Pitfalls: HIGH (SSR localStorage, AnimatePresence key) / MEDIUM (framer-motion v12 React 19 compat)
- Supabase schema: HIGH — standard Postgres patterns; composite index per skill guidelines

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable stack; 30-day window appropriate)
