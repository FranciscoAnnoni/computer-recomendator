# Phase 14: Quiz Result Unlock Card - Research

**Researched:** 2026-05-19
**Domain:** Framer Motion sequencing, React state machine, Tailwind v4 card design
**Confidence:** HIGH

## Summary

The codebase already contains every building block this phase needs. Framer Motion 12.38.0 is installed and actively used in `quiz-celebration.tsx` and `quiz-shell.tsx`. The quiz type system exposes all four answer types (`Workload`, `Lifestyle`, `Budget`, `OsPreference`) cleanly. `QuizResult` already owns the `backendComplete` boolean that is the exact trigger for the sequencing gate.

The implementation is a two-step state extension in `QuizResult`: when `backendComplete` flips to `true`, instead of calling `onDone` immediately (as `QuizCelebration` does today), `QuizResult` sets a new local state `showCard = true`. `QuizCelebration` exits via `AnimatePresence`, then `IdealPcCard` enters. The card calls `onDone` on dismiss, which routes to `/profile` (the existing `handleNavigate`).

`QuizCelebration` must NOT call `onDone` itself anymore — that responsibility moves to `QuizResult`'s orchestration loop. The simplest fix: when `backendComplete` is true, `QuizCelebration`'s timeout calls its own `setVisible(false)` but a new prop `onHidden` fires after the 400ms exit delay, signaling `QuizResult` to show the card.

**Primary recommendation:** Extend `QuizResult` with a 3-state machine (`loading | confetti | card`), thread `onHidden` through `QuizCelebration`, and build `IdealPcCard` as a standalone component with the `computeIdealSpecs` pure function in `src/lib/ideal-specs.ts`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Animation: fade + scale from center — `initial={{ scale: 0.85, opacity: 0 }}` to `animate={{ scale: 1, opacity: 1 }}`
- Overlay backdrop: `bg-black/70 backdrop-blur-sm` (same as QuizCelebration)
- Card enters after confetti exits — sequential, not simultaneous
- Title: "Tu PC ideal" with LockOpen lucide icon
- Specs grid: 6 items — OS, RAM, Almacenamiento, GPU, Pantalla, Batería
- One-line profile descriptor below specs (workload x lifestyle matrix)
- CTA: "Ver mis recomendaciones" button, primary blue, dismisses and navigates
- `computeIdealSpecs(workload, lifestyle, budget, osPreference)` — pure TS, no async
- Integration: `QuizResult` orchestrates, `QuizCelebration` kept as-is for confetti
- `IdealPcCard` receives `selections` + `onDone` callback
- File locations: `src/components/quiz/ideal-pc-card.tsx`, `src/lib/ideal-specs.ts`
- Card: `rounded-2xl border bg-card shadow-2xl` max-w-sm (mobile-first)
- Top badge: "DESBLOQUEADO" small uppercase in brand blue
- LockOpen above title
- Specs in 2-column grid
- Separator before descriptor
- Full-width CTA at bottom
- Exact spec matrix values (RAM/storage/GPU/screen/battery/OS) as specified in CONTEXT.md
- Profile descriptor matrix (6 workload x lifestyle combinations) as specified in CONTEXT.md

### Claude's Discretion

- Exact Framer Motion timing values (spring vs ease, duration)
- Whether confetti exit overlaps with card entrance or is sequential
- Exact icon choices per spec category (from lucide-react already installed)

### Deferred Ideas (OUT OF SCOPE)

- Sound effect on card reveal
- Sharing the ideal spec card to social media
- Animated spec values (counting up numbers) — static values only
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UNLOCK-01 | Full-screen overlay shows after quiz completion, before profile navigation | `QuizResult` `backendComplete` boolean is the exact trigger; add `showCard` state |
| UNLOCK-02 | `IdealPcCard` displays computed specs from 4 quiz answers | `computeIdealSpecs` pure function; types: `Workload`, `Lifestyle`, `Budget`, `OsPreference` already exported from `src/types/quiz.ts` |
| UNLOCK-03 | Confetti exits before card enters (sequential) | `onHidden` callback pattern threads between `QuizCelebration` exit and `QuizResult` state flip |
| UNLOCK-04 | Card is dismissible and navigates to /profile | `onDone` already wired to `handleNavigate` in `QuizResult` — pass through `IdealPcCard` |
| UNLOCK-05 | Card is mobile-safe at 375px viewport | `max-w-[min(384px,90vw)]` pattern; `w-full` CTA button; 2-col spec grid on all sizes |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.38.0 | AnimatePresence + motion.div for overlay/card transitions | Already used in quiz-celebration.tsx and quiz-shell.tsx |
| lucide-react | 0.577.0 | Icons for each spec row + LockOpen title icon | Already used in catalog and CatalogCard |
| tailwindcss | ^4 (v4) | Card styling with design tokens | Project standard; all tokens in globals.css @theme |
| @base-ui/react/button | (shadcn/ui) | CTA button via existing Button component | Existing `src/components/ui/button.tsx` |

### No new dependencies required

All libraries are already present. This phase is pure component authoring.

---

## Architecture Patterns

### State Machine in QuizResult

Current flow (2 states):
```
loading → confetti (confetti auto-navigates when backendComplete)
```

New flow (3 states):
```
loading → confetti → card → (navigate)
```

Implement with a single union type or two booleans. Recommended: two booleans (`backendComplete` already exists, add `showCard: boolean`).

The gate: `QuizCelebration` gains a new optional `onHidden` prop. When the existing `setTimeout(onDone, 400)` fires, call `onHidden` instead of `onDone`. `QuizResult` sets `showCard = true` in `onHidden`.

### QuizResult Orchestration Pattern

```typescript
// Source: derived from quiz-result.tsx + quiz-celebration.tsx analysis
const [backendComplete, setBackendComplete] = useState(false);
const [showCard, setShowCard] = useState(false);

// Pass to QuizCelebration:
// onDone={handleNavigate} is REMOVED from QuizCelebration's direct path
// onHidden={() => setShowCard(true)} is the new exit callback

return (
  <>
    <QuizCelebration
      show={!showCard}
      backendComplete={backendComplete}
      onHidden={() => setShowCard(true)}
    />
    <AnimatePresence>
      {showCard && (
        <IdealPcCard
          selections={selections}
          onDone={handleNavigate}
        />
      )}
    </AnimatePresence>
  </>
);
```

### QuizCelebration Minimal Change

Only change needed: rename `onDone` prop to `onHidden` (or add `onHidden` alongside `onDone` and remove the auto-navigate behavior). The internal `setTimeout(onDone, 400)` becomes `setTimeout(onHidden, 400)`.

Current code at line 35:
```typescript
setTimeout(onDone, 400);  // becomes setTimeout(onHidden, 400)
```

### IdealPcCard Component Pattern

```typescript
// src/components/quiz/ideal-pc-card.tsx
interface IdealPcCardProps {
  selections: [string | null, string | null, string | null, string | null];
  onDone: () => void;
}

// Overlay: fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm
// Card enters with: initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
// transition: { type: "spring", stiffness: 260, damping: 20 } — matches quiz-celebration spring feel
```

### computeIdealSpecs Function Pattern

```typescript
// src/lib/ideal-specs.ts
export interface IdealSpecs {
  os: string;
  ram: string;
  storage: string;
  gpu: string;
  screen: string;
  battery: string;
  profileDescriptor: string;
}

export function computeIdealSpecs(
  workload: Workload,
  lifestyle: Lifestyle,
  budget: Budget,
  osPreference: OsPreference
): IdealSpecs {
  // Deterministic lookup — no switch exhaustiveness issues because
  // all 4 types are narrow string unions from src/types/quiz.ts
}
```

The function body is a direct transcription of the CONTEXT.md spec matrix. Use chained conditionals or a nested lookup object — both are simple given the small input space (3 x 2 x 3 x 2 = 36 max combinations, but spec outputs collapse to fewer branches).

### Recommended Project Structure (additions only)

```
src/
├── components/quiz/
│   ├── ideal-pc-card.tsx    # NEW — IdealPcCard component
│   └── quiz-result.tsx      # MODIFY — add showCard state + onHidden threading
├── lib/
│   └── ideal-specs.ts       # NEW — computeIdealSpecs pure function
```

### Anti-Patterns to Avoid

- **Calling `onDone` from both components:** `QuizCelebration` must not navigate. Only `IdealPcCard.onDone` navigates. Leaving the old auto-navigate path in `QuizCelebration` would cause double-navigation.
- **Passing `selections` as typed tuple then losing nulls:** `computeIdealSpecs` must guard against null selections. Cast with `as Workload` etc. inside `IdealPcCard` after confirming all four are non-null (they always are when `QuizResult` renders, but a null guard is belt-and-suspenders).
- **Rendering `IdealPcCard` inside `AnimatePresence` without a key:** AnimatePresence needs a stable child key to detect mount/unmount — use `key="ideal-pc-card"` on the motion.div.
- **Using `z-40` for the card backdrop:** `QuizCelebration` uses `z-50`. The card should also use `z-50` (rendered after, so it stacks on top when both exist briefly during transition). Since they are sequential, not simultaneous, `z-50` on both is safe.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exit/enter sequencing between two overlays | Custom CSS class toggling + timers | `AnimatePresence` from framer-motion | AnimatePresence tracks child unmount and runs exit animation before removing DOM node |
| Icon per spec type | SVG strings | `lucide-react` named imports | Already installed, tree-shaken, consistent stroke width |
| Overlay backdrop | Custom portal | `fixed inset-0 z-50` div | Next.js app dir renders at body level; no portal needed for fixed overlays |

---

## Lucide Icon Recommendations (Claude's Discretion)

All icons verified present in lucide-react 0.577.0:

| Spec | Recommended Icon | Available | Rationale |
|------|-----------------|-----------|-----------|
| OS | `Globe` | YES | Neutral for both Windows and macOS |
| RAM | `MemoryStick` | YES | Already used in CatalogCard (STATE.md Phase 03) |
| Storage | `HardDrive` | YES | Standard, unambiguous |
| GPU | `Cpu` | YES | Closest to graphics chip concept |
| Screen | `Monitor` | YES | Clear, universal |
| Battery | `Battery` | YES | Already used in CatalogCard (STATE.md Phase 03) |
| LockOpen (title) | `LockOpen` | YES | Exact icon specified in CONTEXT.md |

Alternative for GPU: `Microchip` (also available). `Cpu` is better recognized.

---

## Common Pitfalls

### Pitfall 1: AnimatePresence Wrapping Both Components

**What goes wrong:** Wrapping both `QuizCelebration` and `IdealPcCard` inside a single `AnimatePresence` with `mode="wait"` causes the card to not appear until confetti is fully gone from the DOM. With `mode="wait"`, AnimatePresence will NOT mount the entering child until the exiting child unmounts.

**Why it matters:** This is actually the DESIRED behavior — the user decision says sequential, not simultaneous. `mode="wait"` is the correct choice here.

**How to avoid:** Use `mode="wait"` explicitly. Do not use `mode="popLayout"` (causes layout shift) or default mode (causes overlap).

**Warning signs:** If card and confetti appear at same time, check that `mode="wait"` is set.

### Pitfall 2: onDone Still Wired to QuizCelebration

**What goes wrong:** QuizCelebration internally calls `onDone` (now renamed `onHidden`) and navigates before the card shows.

**Why it happens:** Copy-paste from existing code path; the old `onDone` was the router.push call.

**How to avoid:** In `QuizResult`, the new `onHidden` prop passed to `QuizCelebration` must only call `setShowCard(true)`. `handleNavigate` is passed only to `IdealPcCard.onDone`.

### Pitfall 3: selections Tuple Has Nulls at Render Time

**What goes wrong:** `computeIdealSpecs` receives null for one of the four answers if the user somehow reached the result state with an incomplete quiz.

**Why it happens:** `selections` type is `[string | null, ...]` in QuizShell.

**How to avoid:** In `IdealPcCard`, destructure selections and cast: `const [w, l, b, os] = selections as [Workload, Lifestyle, Budget, OsPreference]`. This is safe because `QuizShell` only renders `QuizResult` after all 4 selections are made (the Next button is disabled until selection is made per step — check quiz-step logic if uncertain).

### Pitfall 4: Card Not Fitting at 375px

**What goes wrong:** `max-w-sm` (384px) causes 1px overflow on the smallest iPhone viewport.

**How to avoid:** Use `w-[min(384px,90vw)]` or `max-w-sm w-full mx-4`. The 2-col spec grid with icon+text needs to fit in ~340px effective content width. With `px-5` card padding and 2 cols, each col gets ~150px — sufficient for icons + short text like "8 GB", "Windows 11".

### Pitfall 5: backdrop-blur-sm Not Working in Safari

**What goes wrong:** `backdrop-blur-sm` can fail on older Safari when applied to a `fixed` element whose parent has `transform` or `will-change`.

**Why it happens:** WebKit bug with composited layers and backdrop-filter.

**How to avoid:** This is an overlay rendered directly in the body stacking context (fixed positioning). No transform on ancestors in this code path. The existing `QuizCelebration` uses `bg-black/70` without `backdrop-blur-sm` — if adding blur, test in Safari. If problematic, drop `backdrop-blur-sm`; `bg-black/70` alone achieves the darkening effect.

---

## Code Examples

### Sequential AnimatePresence with mode="wait"

```typescript
// Source: Framer Motion AnimatePresence docs + quiz-celebration.tsx existing pattern
<AnimatePresence mode="wait">
  {!showCard && (
    <QuizCelebration
      key="celebration"
      show={true}
      backendComplete={backendComplete}
      onHidden={() => setShowCard(true)}
    />
  )}
  {showCard && (
    <motion.div
      key="ideal-pc-card"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <IdealPcCard selections={selections} onDone={handleNavigate} />
    </motion.div>
  )}
</AnimatePresence>
```

### Spec Row in 2-Column Grid

```typescript
// Source: Tailwind v4 grid pattern, consistent with existing CatalogCard spec display
function SpecRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary shrink-0" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto text-xs font-medium">{value}</span>
    </div>
  );
}
// Grid container: className="grid grid-cols-2 gap-x-6 gap-y-3"
// (3 rows x 2 columns = 6 specs)
```

### "DESBLOQUEADO" Badge

```typescript
// Uses --primary token (oklch(0.55 0.2 248) = Apple blue #0071E3)
<span className="text-[10px] font-semibold tracking-widest text-primary uppercase">
  DESBLOQUEADO
</span>
```

### computeIdealSpecs Skeleton

```typescript
// Source: CONTEXT.md spec matrix, direct transcription
export function computeIdealSpecs(
  workload: Workload,
  lifestyle: Lifestyle,
  budget: Budget,
  osPreference: OsPreference
): IdealSpecs {
  const ram =
    budget === "esencial" ? "8 GB" :
    budget === "equilibrado" ? "16 GB" :
    (workload === "productividad_estudio") ? "16 GB" : "32 GB";

  const storage =
    budget === "esencial" ? "256 GB SSD" :
    budget === "equilibrado" ? "512 GB SSD" : "1 TB SSD";

  const gpu = (() => {
    if (workload === "productividad_estudio") return "Integrada";
    if (workload === "creacion_desarrollo") {
      if (budget !== "premium") return "Integrada";
      return osPreference === "macos" ? "Apple GPU 30 nucleos" : "Dedicada (RTX 4060)";
    }
    // gaming_rendimiento
    if (budget === "esencial") return "Dedicada (RTX 4060)";
    if (budget === "equilibrado") return "Dedicada (RTX 4070)";
    return "Dedicada (RTX 4090)";
  })();

  const screen = lifestyle === "maxima_portabilidad" ? '13"-14"' : '15"-17"';
  const battery = lifestyle === "maxima_portabilidad" ? "10+ horas" : "4-6 horas";
  const os = osPreference === "macos" ? "macOS" : "Windows 11";

  const descriptors: Record<Workload, Record<Lifestyle, string>> = {
    productividad_estudio: {
      maxima_portabilidad: "Para el estudiante que rinde en cualquier lugar",
      escritorio_fijo: "Para el profesional que trabaja desde casa",
    },
    creacion_desarrollo: {
      maxima_portabilidad: "Para el creativo siempre en movimiento",
      escritorio_fijo: "Para el disenador con setup fijo",
    },
    gaming_rendimiento: {
      maxima_portabilidad: "Para el gamer que juega desde donde sea",
      escritorio_fijo: "Para el gamer con setup dedicado",
    },
  };

  return { os, ram, storage, gpu, screen, battery, profileDescriptor: descriptors[workload][lifestyle] };
}
```

Note: Spanish special characters (tildes, enye) are fine in string literals — use them in final implementation (e.g., "diseñador", "núcleos").

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| `AnimatePresence` requires portal for modals | `fixed inset-0` inside regular component tree | Works in Next.js app dir — no portal needed for fixed-position overlays |
| Framer Motion `motion.div` with separate layout | Inline `motion.div` wrapping the overlay | Simpler, avoids LayoutGroup complexity for this use case |

---

## Open Questions

None that block planning. All decisions are locked in CONTEXT.md or resolvable from code inspection.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/config changes. All required libraries (framer-motion, lucide-react, tailwindcss, next) are already installed and verified above.

---

## Validation Architecture

`workflow.nyquist_validation` is not set in `.planning/config.json` (only `_auto_chain_active` is present). Key is absent, treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config files or test directories found in project |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| UNLOCK-01 | Overlay appears after quiz completion | manual-only | — | Requires browser rendering + quiz completion flow |
| UNLOCK-02 | computeIdealSpecs returns correct specs | unit | (no framework installed) | Pure function — testable if framework added |
| UNLOCK-03 | Confetti exits before card enters | manual-only | — | Animation sequencing requires visual inspection |
| UNLOCK-04 | CTA navigates to /profile | manual-only | — | Requires Next.js router in test env |
| UNLOCK-05 | Card fits at 375px viewport | manual-only | — | Viewport testing requires browser |

### Sampling Rate

No automated test framework is installed. Validation is manual: open quiz in browser, complete all 4 steps, observe overlay sequence, check mobile at 375px dev tools viewport.

### Wave 0 Gaps

No test infrastructure to create — the project has no existing test setup to extend. Manual testing is the validation strategy for this UI phase. If automated testing is desired, a future phase would need to add Jest/Vitest + React Testing Library.

---

## Sources

### Primary (HIGH confidence)
- Direct source code inspection: `quiz-result.tsx`, `quiz-celebration.tsx`, `quiz-shell.tsx`, `quiz.ts` — exact prop interfaces, state variables, and timing values
- `globals.css` @theme block — all design token values confirmed (oklch values for --primary, --card, --border, --muted-foreground)
- `package.json` — verified package versions: framer-motion 12.38.0, lucide-react 0.577.0
- `node_modules/lucide-react` runtime inspection — all 7 recommended icons confirmed present

### Secondary (MEDIUM confidence)
- `card.tsx` and `button.tsx` reviewed — confirmed base-ui Button works with `w-full` class, Card component uses `bg-card` token matching design

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified from package.json and node_modules
- Architecture: HIGH — derived directly from reading the existing source files; no assumptions
- Pitfalls: HIGH — derived from code analysis (AnimatePresence mode, null tuple, z-index) and known WebKit behavior
- Icon availability: HIGH — verified via node runtime inspection of installed lucide-react

**Research date:** 2026-05-19
**Valid until:** 2026-06-19 (stable libraries; framer-motion and lucide-react APIs are stable)
