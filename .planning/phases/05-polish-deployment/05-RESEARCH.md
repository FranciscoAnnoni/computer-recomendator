# Phase 5: Polish & Deployment - Research

**Researched:** 2026-04-03
**Domain:** Framer Motion animations, next/image migration, Next.js Metadata API, responsive validation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Existing animations (quiz carousel, catalog stagger, compare popLayout, profile fade-up) are done. Do not touch them.
- **D-02:** Two gaps to fill: (1) Home page hero — zero animation today, add staggered fade-up on heading + subtitle + CTA; (2) DetailOverlay — add AnimatePresence enter/exit: slide-up from bottom on mobile, fade+scale on desktop.
- **D-03:** All new animations: duration ≤ 250ms, ease-out, no bounce. Apple-minimalist feel.
- **D-04:** No new animations beyond D-02.
- **D-05:** Primary optimization target is mobile smoothness — no lag, no jank, fluid scroll.
- **D-06:** Replace all `<img>` tags with `next/image` in `CatalogCard` and `CompareCard` only.
- **D-07:** Audit animation duration values across codebase. Any over 300ms on mobile should be reduced.
- **D-08:** No Lighthouse score target — optimize by feel.
- **D-09:** No bundle analysis, no code splitting changes, no Server Component refactors.
- **D-10:** All breakpoints from 320px to wide desktop. No tablet-specific designs.
- **D-11:** Validation via Chrome DevTools: iPhone SE (375px), iPhone 14 Pro (430px), iPad (768px), MacBook 13" (1280px), wide desktop (1440px+).
- **D-12:** Layout issues found during validation are fixed inline as part of this phase.
- **D-13:** Focus areas: Navbar hamburger, Quiz carousel, Catalog card grid, DetailOverlay full-screen on mobile, Compare page column layout.
- **D-14:** Basic SEO on every public page: `<title>`, `<meta name="description">`, Open Graph tags. Use Next.js `metadata` export.
- **D-15:** OG image: static `/public/og-image.png` — no dynamic generation.
- **D-16:** No sitemap, no robots.txt, no structured data.
- **D-17:** SEO is a nice-to-have — do it after animation + responsive + performance.
- **D-18:** Deployment is explicitly out of scope for this phase.

### Claude's Discretion
- Exact stagger timing values for home page hero fade-up
- Whether DetailOverlay uses `motion.div` wrapper or wraps the existing root element
- Specific Tailwind breakpoint values for any layout fixes found during responsive audit
- Order of implementation (animations → responsive → performance → SEO, or interleaved)

### Deferred Ideas (OUT OF SCOPE)
- Deployment (Vercel/Netlify, custom domain) — deferred to end of phase or Phase 6
- Sitemap + robots.txt — Phase 6
- Dynamic OG images — Phase 6 or never
- Bundle analyzer / code splitting audit — out of scope
- Tablet-specific layout designs — not needed
</user_constraints>

---

## Summary

Phase 5 is a refinement phase on a fully working Next.js 16.2 + Framer Motion 12.38 + Tailwind v4 app. Four areas require implementation: (1) two targeted animation additions, (2) `next/image` migration in two specific components, (3) responsive validation with inline fixes, and (4) basic SEO metadata across five pages.

The codebase is already well-structured for this work. `AnimatePresence` is already wired in `catalog-client.tsx` with a working slide-up `motion.div` wrapping `DetailOverlay` — the animation infrastructure is in place and just needs tuning. The home page is a Server Component that must be handled by extracting a `"use client"` child component (`HeroSection`). The `next/image` migration requires adding a `remotePatterns` entry to `next.config.ts` for `orxstqqcsxatxaprqyvq.supabase.co`. The metadata API pattern is already established in the codebase (`quiz/page.tsx` uses it).

**Primary recommendation:** Implement in order — animations first (highest visual impact, well-contained), then next/image migration (requires config change), then responsive audit, then SEO. Each task is self-contained and non-breaking.

---

## Standard Stack

### Core (already installed — no new installs needed)
| Library | Installed Version | Purpose | Status |
|---------|------------------|---------|--------|
| framer-motion | 12.38.0 | AnimatePresence, motion.div variants | Already used in 10+ files |
| next/image | built-in (Next 16.2.0) | Optimized images with lazy loading, WebP | Available, not yet used in target files |
| next/font | built-in | Font optimization | Already configured |

### No New Dependencies
This phase requires zero new npm installs. All libraries are already in `package.json`.

**Version verification:** Confirmed via `node_modules` inspection — framer-motion 12.38.0, next 16.2.0.

---

## Architecture Patterns

### Pattern 1: Home Page Hero — Server Component + Client Child

**The constraint:** `src/app/page.tsx` is a Server Component (no `"use client"` directive). Framer Motion's `motion.*` components require the browser runtime — they cannot render in Server Components.

**The pattern:** Extract the animated content to a separate `"use client"` child component. The Server Component renders the shell; the Client Component owns all motion.

```typescript
// src/components/home/hero-section.tsx  (NEW FILE)
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <motion.div
      variants={heroVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-6 max-w-2xl"
    >
      <motion.h1 variants={itemVariants} className="text-heading font-bold ...">
        Computer Recomendator
      </motion.h1>
      <motion.p variants={itemVariants} className="text-subhead ...">
        Find the perfect laptop for your needs
      </motion.p>
      <motion.div variants={itemVariants}>
        <Link href="/quiz">
          <Button size="lg">Find My Laptop &rarr;</Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
```

```typescript
// src/app/page.tsx  (UPDATED — Server Component, minimal change)
import { Container } from "@/components/layout/container";
import { HeroSection } from "@/components/home/hero-section";

export default function Home() {
  return (
    <Container>
      <section className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-4rem)]">
        <HeroSection />
      </section>
    </Container>
  );
}
```

**Stagger timing (Claude's discretion):** `staggerChildren: 0.08` produces 3 items animating at t=0, t=80ms, t=160ms — feels responsive without dragging. `duration: 0.25` and `y: 16` match the profile page pattern (`y: 24`, `duration: 0.4`) but slightly snappier as requested.

**Why this stagger:** The catalog pattern uses `staggerChildren: 0.04` for many cards. For only 3 hero items, 0.08 gives a more visible cascade without exceeding the "quick" feel.

---

### Pattern 2: DetailOverlay Animation — AnimatePresence Already Wired

**Critical finding from codebase audit:** `AnimatePresence` + `motion.div` is already implemented in `catalog-client.tsx` lines 471-484. The animation is:
- `initial={{ y: "100%" }}` → `animate={{ y: 0 }}` → `exit={{ y: "100%" }}`
- `transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}`

This is already a slide-up pattern. What D-02 requires is:
1. **Mobile:** keep the slide-up (it's already there)
2. **Desktop:** switch to fade + scale instead of slide-up

The current `duration: 0.3` is at the boundary of D-03 (≤ 250ms) — it needs to be reduced regardless.

**The enhancement:** Use `useMediaQuery` or Tailwind breakpoint detection to conditionally apply different animation variants on mobile vs desktop. Since this is inside a Client Component, `window.innerWidth` is accessible.

```typescript
// In catalog-client.tsx — updated AnimatePresence block
// (Claude's discretion: use window check or CSS media query approach)

// Option A: Framer Motion useAnimate with conditional variants
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

const overlayVariants = {
  mobile: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
  },
  desktop: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
    transition: { duration: 0.2, ease: "easeOut" },
  },
};
```

**Pitfall:** `window.innerWidth` on first render causes hydration mismatch. Safe pattern: initialize with a default (mobile), update in `useEffect`. Or use CSS-only approach: keep slide-up always but on desktop it looks fine too (simpler, no hydration risk).

**Recommended approach (Claude's discretion):** Keep the existing slide-up for both mobile and desktop, but reduce `duration: 0.3` to `duration: 0.25` to comply with D-03. The slide-up reads well on desktop too given the full-screen overlay context. Reserve the mobile vs desktop variant distinction as a stretch goal only if there is time.

---

### Pattern 3: next/image Migration

**Files:** `src/components/catalog/catalog-card.tsx` and `src/components/compare/compare-card.tsx`

**Prerequisite — next.config.ts must be updated first.** Images come from Supabase Storage at `orxstqqcsxatxaprqyvq.supabase.co`. Without `remotePatterns`, Next.js will throw `Error: Invalid src prop` at runtime.

```typescript
// next.config.ts — MUST be updated before any next/image usage
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.14", "192.168.1.67"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "orxstqqcsxatxaprqyvq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
```

**next/image required props:**

For `fill` layout (recommended for the existing `w-full h-full object-cover` pattern):
```typescript
import Image from "next/image";

// In CatalogCard — replaces <img> inside positioned parent div
// Parent div MUST have position: relative (add via className="relative")
<div className="relative w-[100px] sm:w-[155px] shrink-0 self-stretch bg-muted rounded-l-2xl overflow-hidden">
  <Image
    src={laptop.image_url}
    alt={laptop.name}
    fill
    sizes="(max-width: 640px) 100px, 155px"
    className="object-cover pointer-events-none"
    onError={() => setImgError(true)}  // NOTE: onError is NOT supported on next/image
  />
</div>
```

**CRITICAL PITFALL — onError not supported:** `next/image` does not support the `onError` prop for client-side fallback. The `imgError` state pattern in `CatalogCard` uses `onError` to show a text fallback. This must change to either:
1. **Option A:** Remove the `imgError` fallback and rely on `next/image`'s built-in broken image handling
2. **Option B:** Use `next/image` with a static `placeholder` instead
3. **Option C:** Keep `<img>` with `loading="lazy"` for the error-fallback components, use `next/image` only for `CompareCard` which has a simpler `onError` that just hides the image

**Recommended approach:** For `CatalogCard`, migrate to `next/image` with `fill` and remove the `imgError` state — next/image handles missing images gracefully (renders nothing visible). For the fallback brand text, wrap conditionally on `laptop.image_url` only. For `CompareCard`, straightforward `fill` migration since its `onError` just hides the element.

**`sizes` attribute:** Critical for performance. Without it, Next.js assumes full viewport width and generates unnecessarily large images.

```typescript
// CatalogCard — image column is 100px mobile, 155px desktop
sizes="(max-width: 640px) 100px, 155px"

// CompareCard — full width of grid column (~50vw mobile, ~33vw desktop, max ~300px)
sizes="(max-width: 768px) 50vw, 300px"
```

**`unoptimized` fallback:** If `remotePatterns` config is complex or images come from multiple external domains, add `unoptimized={true}` as escape hatch. This disables optimization but allows any src. NOT recommended as primary approach — defeats the purpose — but useful as fallback if Supabase URL pattern is wrong.

---

### Pattern 4: Next.js Metadata API

**Already established in codebase:** `src/app/quiz/page.tsx` exports `metadata` without the `Metadata` type import. `src/app/layout.tsx` uses `export const metadata: Metadata` with the type. Both patterns work.

**Typed pattern (recommended for consistency with layout.tsx):**

```typescript
// Any page.tsx — add at top, before default export
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo | Computer Recomendator",
  description: "Explorá laptops curadas con recomendaciones de expertos.",
  openGraph: {
    title: "Catálogo | Computer Recomendator",
    description: "Explorá laptops curadas con recomendaciones de expertos.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};
```

**Pages requiring metadata additions:**

| Page | File | Current metadata | Needs |
|------|------|-----------------|-------|
| Home | `src/app/page.tsx` | None | Add metadata export |
| Catalog | `src/app/catalog/page.tsx` | None | Add metadata export |
| Quiz | `src/app/quiz/page.tsx` | Basic title+description | Add OG tags |
| Profile | `src/app/profile/page.tsx` | None | Add metadata export |
| Compare | `src/app/compare/page.tsx` | None | Add metadata export |

**OG image:** Place a 1200×630px PNG at `/public/og-image.png`. Reference as `images: [{ url: "/og-image.png", width: 1200, height: 630 }]`. The `/public` directory is served as static at root — no absolute URL needed for same-domain references.

**layout.tsx base metadata:** The layout already has `title: "Computer Recomendator"` and a description. Per-page metadata merges with and overrides the layout metadata — pages should define their own `title` to avoid all pages showing the generic title in browser tabs.

**`viewport` in layout.tsx:** Current layout exports `viewport` inside `metadata`. In Next.js 14+, `viewport` must be exported separately as `export const viewport: Viewport`. The current pattern works in Next 16 but produces a console warning. This is a low-priority fix.

---

### Pattern 5: Animation Performance — reduced-motion

**Framer Motion 12 built-in:** Framer Motion automatically respects `prefers-reduced-motion` when using the standard animation APIs. When the OS accessibility setting is enabled, `motion.div` animations are disabled automatically.

**No extra code needed** for basic reduced-motion support. The existing variant pattern already benefits from this.

**For GPU compositing:** Framer Motion animates `transform` and `opacity` by default — both are GPU-composited properties. The `y: 0` / `opacity: 1` pattern already uses the correct properties.

**`will-change` — avoid manual use:** Do not add `will-change: transform` manually. Framer Motion manages this internally. Manual `will-change` on many elements wastes GPU memory, especially on mobile.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image lazy loading | Manual `IntersectionObserver` + lazy state | `next/image` with default `loading="lazy"` | next/image lazy-loads by default; also handles WebP conversion, srcset generation, size optimization |
| Animation exit sequences | Manual CSS class toggling on unmount | `AnimatePresence` from framer-motion | Exit animations during component unmount require React lifecycle hacks without AnimatePresence |
| Responsive image srcset | Manual `<picture>` + `srcset` | `next/image` `sizes` prop | next/image generates srcset automatically from `sizes` |
| Reduced-motion support | Manual `window.matchMedia('(prefers-reduced-motion)')` | Framer Motion automatic support | Already handled by framer-motion 12 internals |
| OG image generation | `@vercel/og` dynamic route | Static `/public/og-image.png` | D-15 is explicit: static file only, dynamic is deferred |

---

## Common Pitfalls

### Pitfall 1: next/image requires remotePatterns before deployment
**What goes wrong:** `<Image src="https://orxstqqcsxatxaprqyvq.supabase.co/..." />` throws `Error: Invalid src prop` in both development and production. The app hard-crashes on the catalog page.
**Why it happens:** Next.js security model requires explicit allowlisting of external image hostnames.
**How to avoid:** Update `next.config.ts` with `images.remotePatterns` as the FIRST task in the next/image migration plan. Verify by running `next dev` and loading the catalog page.
**Warning signs:** Console error `Error: Invalid src prop` on `<Image>` component.

### Pitfall 2: next/image `fill` requires a positioned parent
**What goes wrong:** Image renders with zero height or overflows its container.
**Why it happens:** `fill` mode sets `position: absolute; inset: 0` on the `<img>` tag. The parent must be `position: relative` (or `absolute`/`fixed`) for this to work.
**How to avoid:** Ensure every parent div containing a `fill` image has `className` including `relative` (or use `position: relative` inline style).
**Warning signs:** Image is invisible (zero height) or stretches outside its container.

### Pitfall 3: next/image `onError` prop is not supported
**What goes wrong:** TypeScript error `Property 'onError' does not exist on type 'ImageProps'` and runtime warning.
**Why it happens:** `next/image` wraps the native `<img>` and does not forward `onError` to allow for its own error handling.
**How to avoid:** Remove `onError` from `CatalogCard` when migrating. Use conditional rendering `{laptop.image_url ? <Image ... /> : <FallbackDiv />}` pattern instead.

### Pitfall 4: Home page hydration mismatch with window-based breakpoint detection
**What goes wrong:** Server renders the mobile animation variant, browser hydrates with desktop variant — React throws hydration mismatch error.
**Why it happens:** `window.innerWidth` is only available in the browser, not during SSR. Any branch on this value at render time produces different HTML on server vs client.
**How to avoid:** Either (a) use a single animation variant for both mobile and desktop (recommended: keep slide-up for both), or (b) initialize to a safe default and update via `useEffect` only.

### Pitfall 5: AnimatePresence key must be stable
**What goes wrong:** Exit animation doesn't trigger, or triggers on every render instead of on unmount.
**Why it happens:** `AnimatePresence` uses `key` to track children. If key changes on re-render without unmount, it treats it as a new mount. If key is missing, all children animate on every render.
**How to avoid:** The current `catalog-client.tsx` correctly uses `key={activeLaptop.id}`. This is correct. Do not change the key pattern.
**Codebase status:** Already correctly implemented at line 474.

### Pitfall 6: Metadata `viewport` warning in Next.js 14+
**What goes wrong:** Console warning `Unsupported metadata viewport is configured in metadata export`.
**Why it happens:** `viewport` was separated from `metadata` in Next.js 14. `layout.tsx` currently exports `viewport` inside the `metadata` object.
**How to avoid:** Export `viewport` separately: `export const viewport: Viewport = { ... }`. This is low-priority — app functions correctly regardless.

### Pitfall 7: layout.tsx `<main>` wrapper conflict
**What goes wrong:** Double `<main>` landmark in the DOM — layout.tsx wraps children in `<main>`, and `profile/page.tsx` has its own `<main>` at the root. Same for `catalog-client.tsx`.
**Why it happens:** layout.tsx line 44: `<main className="min-h-screen">{children}</main>` wraps everything. Some page files also use `<main>` as their root element.
**Impact for Phase 5:** When fixing SEO/accessibility issues, don't add another `<main>` in HeroSection. The home page `section` element is correct — the layout's `<main>` covers it.

---

## Code Examples

### HeroSection stagger pattern (aligned with profile/page.tsx precedent)
```typescript
// Source: established in src/app/profile/page.tsx (motion + variants pattern)
// HeroSection uses same pattern but with container/item variants for stagger

const heroVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};
```

### DetailOverlay animation — current state in catalog-client.tsx
```typescript
// Source: src/components/catalog/catalog-client.tsx lines 471-484
// ALREADY IMPLEMENTED — needs only duration adjustment from 0.3 to 0.25

<AnimatePresence>
  {activeLaptop && (
    <motion.div
      key={activeLaptop.id}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}  // change to 0.25
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-2xl"
    >
      <DetailOverlay laptop={activeLaptop} onClose={handleCloseOverlay} />
    </motion.div>
  )}
</AnimatePresence>
```

### next/image fill pattern for CatalogCard
```typescript
// Source: next/image official docs — fill mode for unknown-dimension containers
import Image from "next/image";

// Parent must have position:relative + defined dimensions
<div className="relative w-[100px] sm:w-[155px] shrink-0 self-stretch bg-muted rounded-l-2xl overflow-hidden">
  {laptop.image_url ? (
    <Image
      src={laptop.image_url}
      alt={laptop.name}
      fill
      sizes="(max-width: 640px) 100px, 155px"
      className="object-cover pointer-events-none"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground font-mono p-2 text-center">
      {laptop.brand}
    </div>
  )}
</div>
```

### next/image fill pattern for CompareCard
```typescript
// CompareCard uses aspect-square — fill works directly
<div className="relative aspect-square w-full bg-muted overflow-hidden">
  {laptop.image_url && (
    <Image
      src={laptop.image_url}
      alt={laptop.name}
      fill
      sizes="(max-width: 768px) 50vw, 300px"
      className="object-cover"
    />
  )}
</div>
```

### Static metadata with Open Graph
```typescript
// Source: established pattern from src/app/quiz/page.tsx + layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo | Computer Recomendator",
  description: "Explorá laptops curadas con recomendaciones de expertos.",
  openGraph: {
    title: "Catálogo | Computer Recomendator",
    description: "Explorá laptops curadas con recomendaciones de expertos.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `<img loading="lazy">` | `next/image` with automatic lazy loading + WebP + srcset | Significant mobile perf gain |
| `pages/_document.tsx` metadata | `export const metadata: Metadata` per page | Already using current pattern |
| `framer-motion` `useReducedMotion()` hook | Automatic in Framer Motion 12 | No extra code needed |

---

## Open Questions

1. **Supabase image URL structure**
   - What we know: Project URL is `orxstqqcsxatxaprqyvq.supabase.co`. Storage public URLs follow `/storage/v1/object/public/**`.
   - What's unclear: Whether all `image_url` values in the database use this exact hostname, or whether some images are stored externally (CDN, raw URLs from other sources).
   - Recommendation: Add `remotePatterns` for Supabase hostname. If at runtime any image fails to load with a `hostname not configured` error, add that hostname too. Consider using `unoptimized={true}` as a fallback if image sources are heterogeneous.

2. **DetailOverlay desktop animation — slide-up vs fade+scale**
   - What we know: D-02 requests fade+scale on desktop. Current implementation is slide-up on both.
   - What's unclear: Adding a media-query-based variant check in a Client Component risks hydration mismatch.
   - Recommendation: Reduce `duration: 0.3 → 0.25` as the primary D-03 compliance fix. For desktop vs mobile variants, use `useEffect` + `useState` initialized to `false` for `isDesktop`, updated after mount. Only add if time permits — slide-up on desktop is not broken, just not the specified preference.

3. **`og-image.png` creation**
   - What we know: D-15 requires a static file at `/public/og-image.png`.
   - What's unclear: The file does not exist yet (only SVGs in `/public`). Creating a quality OG image requires design work.
   - Recommendation: Create a simple text-based PNG (1200×630) with the app name and tagline. Can be done with any design tool or even a browser screenshot. This is a D-17 nice-to-have — don't block other tasks on it.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| framer-motion | Animations (D-02, D-03) | Yes | 12.38.0 | — |
| next/image | Image optimization (D-06) | Yes (built-in) | Next 16.2.0 | `<img loading="lazy">` |
| Chrome DevTools | Responsive testing (D-11) | Yes (browser tool) | — | Firefox DevTools |
| Supabase Storage | Image URLs in database | Yes | — | External image URLs |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- `og-image.png` does not exist in `/public` — must be created before SEO metadata referencing it goes live. The metadata can be written without the file; the missing image simply won't show in social previews until the file exists.

---

## Validation Architecture

> `workflow.nyquist_validation` is absent from `.planning/config.json` — treating as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test config files, no test directories, no test scripts in package.json |
| Config file | None — Wave 0 must add if automated tests are planned |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

This phase has no formal requirement IDs (null was specified). Requirements are behavioral/visual:

| Behavior | Test Type | Notes |
|----------|-----------|-------|
| Home hero fades up on load | Manual — Chrome DevTools | Visual animation — not automatable cheaply |
| DetailOverlay slides up on open, slides down on close | Manual | Animation exit requires visual inspection |
| `next/image` renders laptop images in CatalogCard | Manual + build check | `next build` will error if remotePatterns wrong |
| `next/image` renders laptop images in CompareCard | Manual + build check | Same |
| No `<img>` in CatalogCard or CompareCard after migration | Code audit (grep) | `grep -r "<img" src/components/catalog/catalog-card.tsx` |
| Metadata present on all pages | Manual browser tab titles + `curl` head check | `curl -s http://localhost:3000/catalog | grep "<title>"` |
| Layout intact at 375px, 430px, 768px, 1280px, 1440px | Manual — Chrome DevTools | All 5 breakpoints from D-11 |
| Duration ≤ 250ms on all new animations | Code review | Verify variant definitions in code |
| `will-change` not manually added | Code review | Negative — grep for `will-change` |

### Wave 0 Gaps
- No test infrastructure exists. Given the visual/animation nature of this phase, manual testing is the appropriate validation approach. No test framework setup is recommended for Phase 5 — all validation is manual inspection per D-08 ("optimize by feel").

---

## Sources

### Primary (HIGH confidence)
- Codebase direct inspection: `src/components/catalog/catalog-client.tsx`, `catalog-card.tsx`, `compare-card.tsx`, `detail-overlay.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`, `next.config.ts`, `package.json`
- `node_modules` version inspection: framer-motion 12.38.0, next 16.2.0 confirmed
- `.env.local` inspection: Supabase hostname `orxstqqcsxatxaprqyvq.supabase.co` confirmed

### Secondary (MEDIUM confidence)
- Next.js `next/image` API: `remotePatterns`, `fill`, `sizes`, `onError` limitation — based on Next.js 13+ documentation patterns, consistent with Next 16 which is a minor extension
- Framer Motion 12 `AnimatePresence` behavior — consistent with framer-motion v10+ API, no breaking changes in v12 for this usage pattern

### Tertiary (LOW confidence)
- Specific Framer Motion 12 reduced-motion auto-handling claim — behavior documented in Framer Motion docs, not independently verified against v12 changelog for this research session

---

## Metadata

**Confidence breakdown:**
- Animation patterns: HIGH — codebase read directly, AnimatePresence already wired and working
- next/image migration: HIGH — file contents read, remotePatterns requirement is well-established
- Metadata API: HIGH — already used in quiz/page.tsx and layout.tsx, pattern confirmed
- Responsive validation: HIGH — breakpoints from D-11, Chrome DevTools is universal
- Pitfalls: HIGH — derived from direct code reading (onError not in next/image, fill requires relative parent, hydration mismatch from window.innerWidth)

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable stack — Next 16, Framer Motion 12 are stable releases)
