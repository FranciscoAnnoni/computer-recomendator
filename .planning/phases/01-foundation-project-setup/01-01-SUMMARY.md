---
phase: 01-foundation-project-setup
plan: "01"
subsystem: ui
tags: [nextjs, tailwind, shadcn, next-themes, typescript, inter-font, dark-mode]

requires: []

provides:
  - Next.js 16.2 App Router project with TypeScript and Tailwind v4
  - shadcn/ui initialized (Nova preset, Radix, oklch color system)
  - Apple-minimalist design tokens: white/gray palette, #0071E3 accent blue
  - Dark mode class strategy via next-themes ThemeProvider
  - Inter font loaded via next/font with --font-inter CSS variable
  - Typography scale: heading (56px/700), subhead (28px/500), body (17px/400), small (12px/400)
  - Folder scaffolding: components/layout, components/quiz, components/catalog, components/compare, hooks, types

affects:
  - 02-data-foundation
  - 03-quiz-feature
  - 04-catalog-feature
  - 05-compare-feature

tech-stack:
  added:
    - next@16.2.0
    - react@19.2.4
    - tailwindcss@4
    - shadcn@4.0.8
    - next-themes@0.4.6
    - lucide-react
    - class-variance-authority
    - clsx
    - tailwind-merge
    - tw-animate-css
  patterns:
    - Tailwind v4 CSS-based config (no tailwind.config.ts — config lives in globals.css @theme)
    - oklch color values for all design tokens (Tailwind v4 native format)
    - shadcn/ui components in src/components/ui/ added via CLI
    - ThemeProvider client component wraps children in root layout

key-files:
  created:
    - src/components/theme-provider.tsx
    - src/components/ui/button.tsx
    - src/lib/utils.ts
    - components.json
    - src/components/layout/.gitkeep
    - src/components/quiz/.gitkeep
    - src/components/catalog/.gitkeep
    - src/components/compare/.gitkeep
    - src/hooks/.gitkeep
    - src/types/.gitkeep
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "Used Tailwind v4 oklch color format instead of HSL — Tailwind v4 uses oklch natively and shadcn init generates oklch values"
  - "shadcn/ui Nova preset with Radix selected via -d flag defaults"
  - "Inter font via next/font/google with --font-inter CSS variable binding"
  - "ThemeProvider uses class strategy with defaultTheme system for OS-aware dark mode"
  - "Apple blue accent #0071E3 mapped to oklch(0.55 0.2 248)"

patterns-established:
  - "All design tokens live in globals.css @theme block — single source of truth"
  - "Client components use 'use client' directive at top of file"
  - "shadcn components added individually via npx shadcn@latest add [component]"
  - "Dark mode via .dark class on html element, ThemeProvider manages toggle"

requirements-completed: [RNF1.1, RNF1.2, RNF3.1]

duration: 6min
completed: 2026-03-19
---

# Phase 01 Plan 01: Foundation Setup Summary

**Next.js 16.2 with Tailwind v4, shadcn/ui (Nova/Radix), Inter font, Apple-minimalist oklch design tokens, and class-based dark mode via next-themes**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-19T03:49:41Z
- **Completed:** 2026-03-19T03:56:00Z
- **Tasks:** 2 completed
- **Files modified:** 10

## Accomplishments
- Next.js 16.2 App Router project with TypeScript, Tailwind v4, and ESLint configured
- Apple-minimalist color palette applied: white bg, #1D1D1F text, #0071E3 accent blue in oklch format
- Dark mode configured with class strategy via next-themes; ThemeProvider wraps root layout
- shadcn/ui button component available; all component directories scaffolded
- Inter font loaded and bound to --font-inter CSS variable; Apple typography scale in globals.css

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js project with Tailwind and shadcn/ui** - `d0898c5` (feat)
2. **Task 2: Configure Apple-minimalist design tokens and dark mode** - `a612fb2` (feat)

## Files Created/Modified
- `src/app/globals.css` - Apple palette in oklch, dark mode .dark section, typography tokens, @theme config
- `src/app/layout.tsx` - Inter font, ThemeProvider wrapper, corrected metadata
- `src/app/page.tsx` - Minimal landing page demonstrating design tokens and shadcn Button
- `src/components/theme-provider.tsx` - Client-side next-themes wrapper
- `src/components/ui/button.tsx` - shadcn Button primitive
- `src/lib/utils.ts` - Tailwind class merging utility
- `components.json` - shadcn/ui configuration (Nova preset, Radix, aliases)
- `package.json` - Dependencies: next, react, tailwind, shadcn, next-themes, lucide-react
- `src/components/{layout,quiz,catalog,compare}/.gitkeep` - Directory scaffolding
- `src/hooks/.gitkeep`, `src/types/.gitkeep` - Directory scaffolding

## Decisions Made
- **Tailwind v4 + oklch**: The plan specified HSL values for CSS custom properties (`--primary: 211`), but Next.js 16.2 scaffolds Tailwind v4 which uses oklch natively. shadcn init generates oklch values. Adapted all design tokens to oklch format while preserving the same visual colors. Apple blue `#0071E3` = `oklch(0.55 0.2 248)`.
- **shadcn Nova preset**: Used `npx shadcn@latest init -d` which selected Nova (Lucide/Geist) preset with Radix components — best match for shadcn v4 defaults.
- **No tailwind.config.ts**: Tailwind v4 does not use a config file; all configuration is CSS-based in `globals.css` using `@theme` blocks. Typography tokens (heading, subhead, body, small) defined as CSS custom properties in `@theme inline`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created Next.js project in temp directory to bypass conflict check**
- **Found during:** Task 1 (project initialization)
- **Issue:** `npx create-next-app@latest .` rejects directories with existing files (.planning/, .gemini/, README.md)
- **Fix:** Created scaffold in /tmp/next-scaffold, copied all generated files to project root, then ran `npm install`
- **Files modified:** All Next.js scaffold files
- **Verification:** Build passes with zero errors
- **Committed in:** d0898c5 (Task 1 commit)

**2. [Rule 1 - Adaptation] Used oklch instead of HSL for design tokens**
- **Found during:** Task 2 (design token configuration)
- **Issue:** Plan specified HSL format (`--primary: 211`) but Tailwind v4 generates oklch values; mixing formats would cause inconsistency
- **Fix:** Converted all Apple palette colors to oklch equivalents; preserved visual accuracy
- **Files modified:** src/app/globals.css
- **Verification:** Build passes, colors visually correct in page.tsx landing
- **Committed in:** a612fb2 (Task 2 commit)

---

**Total deviations:** 2 auto-adapted (1 blocking workaround, 1 framework adaptation)
**Impact on plan:** Both adaptations required for framework compatibility. Visual output matches Apple-minimalist palette intent exactly.

## Issues Encountered
- `create-next-app` blocks initialization in directories with existing files — worked around with temp directory approach
- shadcn v4 interactive prompts don't support `--yes` flag; used `-d` for defaults
- Tailwind v4 has no `tailwind.config.ts` — all config is CSS-based (affects plan's acceptance criterion for `tailwind.config.ts contains "darkMode"`, adapted to globals.css `@custom-variant dark`)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Design system foundation complete: all tokens, components, and folder structure ready
- Phase 02 (data foundation / Supabase) can proceed immediately
- All subsequent UI phases can import from @/components/ui, use Tailwind design tokens, and rely on dark mode working

---
*Phase: 01-foundation-project-setup*
*Completed: 2026-03-19*
