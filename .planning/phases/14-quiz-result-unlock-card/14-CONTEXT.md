# Phase 14: Quiz Result Unlock Card — Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** User discussion

<domain>
## Phase Boundary

Replace the current auto-navigate celebration flow with a two-step sequence:
1. Confetti loads while Supabase fetch runs (existing `QuizCelebration` behavior, keep it)
2. After fetch completes, show `IdealPcCard` modal (new) instead of auto-navigating
3. User manually dismisses the card → navigate to /profile (existing route)

The "Ideal PC Card" shows computed specs derived purely from the 4 quiz answers — no real product, no DB data. It's a conceptual spec sheet that tells the user what their perfect machine looks like before showing the actual recommendations.

</domain>

<decisions>
## Implementation Decisions

### Animation Style
- **Fade + scale from center** (Framer Motion `initial={{ scale: 0.85, opacity: 0 }}` → `animate={{ scale: 1, opacity: 1 }}`)
- Overlay backdrop: `bg-black/70 backdrop-blur-sm` (same as QuizCelebration)
- Card enters after confetti exits — two-phase sequence within QuizResult/QuizCelebration flow

### Card Content
- Title: "Tu PC ideal" with an unlock icon (LockOpen from lucide-react)
- Specs grid (6 items): OS, RAM, Almacenamiento, GPU, Pantalla, Batería
- Each spec has an icon + label + value
- One-line profile descriptor below specs (maps to workload+lifestyle combo)
- CTA button: "Ver mis recomendaciones" — primary blue button, dismisses modal and navigates

### Ideal Specs Computation
Pure TypeScript function `computeIdealSpecs(workload, lifestyle, budget, osPreference)` → `IdealSpecs` object.
No DB call, no async. Deterministic lookup.

Spec matrix:

**RAM:**
- esencial → 8 GB
- equilibrado → 16 GB
- premium + productividad_estudio → 16 GB
- premium + creacion_desarrollo → 32 GB
- premium + gaming_rendimiento → 32 GB

**Storage:**
- esencial → 256 GB SSD
- equilibrado → 512 GB SSD
- premium → 1 TB SSD

**GPU:**
- productividad_estudio (any budget) → "Integrada" (iGPU)
- creacion_desarrollo + esencial/equilibrado → "Integrada"
- creacion_desarrollo + premium + windows → "Dedicada (RTX 4060)"
- creacion_desarrollo + premium + macos → "Apple GPU 30 núcleos"
- gaming_rendimiento + esencial → "Dedicada (RTX 4060)"
- gaming_rendimiento + equilibrado → "Dedicada (RTX 4070)"
- gaming_rendimiento + premium → "Dedicada (RTX 4090)"

**Screen:**
- maxima_portabilidad → '13"–14"'
- escritorio_fijo → '15"–17"'

**Battery:**
- maxima_portabilidad → "10+ horas"
- escritorio_fijo → "4–6 horas"

**OS label:**
- windows → "Windows 11"
- macos → "macOS"

**Profile descriptor (workload × lifestyle):**
- productividad_estudio + maxima_portabilidad → "Para el estudiante que rinde en cualquier lugar"
- productividad_estudio + escritorio_fijo → "Para el profesional que trabaja desde casa"
- creacion_desarrollo + maxima_portabilidad → "Para el creativo siempre en movimiento"
- creacion_desarrollo + escritorio_fijo → "Para el diseñador con setup fijo"
- gaming_rendimiento + maxima_portabilidad → "Para el gamer que juega desde donde sea"
- gaming_rendimiento + escritorio_fijo → "Para el gamer con setup dedicado"

### Integration Point
- Change happens in `QuizCelebration` OR `QuizResult` — keep `QuizCelebration` as-is for confetti, add new `IdealPcCard` component
- `QuizResult` orchestrates: confetti shows → when `backendComplete`, confetti exits then `IdealPcCard` appears
- `IdealPcCard` receives `selections` (from QuizResult props) + `onDone` callback
- On dismiss: call `onDone` which routes to /profile (existing `handleNavigate`)

### Component location
- `src/components/quiz/ideal-pc-card.tsx` — new component
- `src/lib/ideal-specs.ts` — pure computation function
- Modify `src/components/quiz/quiz-result.tsx` — orchestrate card sequence

### Visual design
- Card: `rounded-2xl border bg-card shadow-2xl` max-w-sm (mobile-first)
- Top badge: "DESBLOQUEADO" small uppercase label in brand blue
- LockOpen icon (lucide) above the title
- Specs in a 2-column grid (icon + text each row)
- Separator before descriptor line
- Full-width CTA button at bottom

### Claude's Discretion
- Exact Framer Motion timing values (spring vs ease, duration)
- Whether confetti exit overlaps with card entrance or is sequential
- Exact icon choices per spec category (from lucide-react already installed)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Quiz flow (source of truth)
- `src/components/quiz/quiz-result.tsx` — orchestrates fetch + celebration, integration point
- `src/components/quiz/quiz-celebration.tsx` — existing confetti overlay (modify or wrap)
- `src/components/quiz/quiz-shell.tsx` — passes selections down to QuizResult
- `src/types/quiz.ts` — Workload/Lifestyle/Budget/OsPreference types + QUIZ_STEPS

### UI patterns
- `src/components/ui/button.tsx` — Button component (use for CTA)
- Any existing modal/overlay component in `src/components/ui/` for reference

### Animation
- Framer Motion already installed, used in quiz-shell.tsx and quiz-celebration.tsx

</canonical_refs>

<specifics>
## Specific Ideas

- The card should feel like "unlocking" something rare — a collectible spec card
- "DESBLOQUEADO" badge in brand blue (#0071E3 / oklch(0.55 0.2 248)) at the top
- Confetti exits first (QuizCelebration fade-out), THEN card fades+scales in — not simultaneous
- The profile loads in the background while the card is shown (no extra latency)
- On mobile (375px), card must fit without horizontal scroll — max-w-[90vw] fallback

</specifics>

<deferred>
## Deferred Ideas

- Sound effect on card reveal (out of scope for this phase)
- Sharing the ideal spec card to social media (future feature)
- Animated spec values (counting up numbers) — too complex for now, static values only

</deferred>

---

*Phase: 14-quiz-result-unlock-card*
*Context gathered: 2026-05-19*
