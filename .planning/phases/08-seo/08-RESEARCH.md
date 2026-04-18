# Phase 8: SEO - Research

**Researched:** 2026-04-18
**Domain:** Next.js 16.2 App Router metadata API (lang, metadataBase, OG, Twitter Card, sitemap, robots)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | All pages render with `lang="es"` (currently hardcoded `"en"`) | Change `lang="en"` to `lang="es"` in `src/app/layout.tsx` root `<html>` element — one-line fix |
| SEO-02 | `metadataBase` is configured in root layout with production URL | Add `metadataBase: new URL('https://computer-recomendator.vercel.app')` to root `layout.tsx` metadata export |
| SEO-03 | Each page has unique Spanish title and description | 4 pages already have Spanish OG metadata; root layout `metadata` uses English — update root layout + verify per-page titles |
| SEO-04 | OG image file exists at `public/og-image.png` and is correctly referenced | `public/og-image.png` does NOT exist — must create. All 5 page files already reference `/og-image.png` in openGraph.images |
| SEO-05 | `twitter:card` metadata is present on all pages | Add `twitter` field to each page's metadata export using `card: 'summary_large_image'` pattern |
| SEO-06 | `robots.txt` exists and is correctly configured | Create `src/app/robots.ts` using `MetadataRoute.Robots` — no file exists yet |
| SEO-07 | Sitemap is generated and accessible at `/sitemap.xml` | Create `src/app/sitemap.ts` using `MetadataRoute.Sitemap` — no file exists yet |
</phase_requirements>

---

## Summary

Phase 8 is a pure metadata and static-file phase — no new components, no data fetching, no new dependencies. The Next.js 16.2 App Router provides native TypeScript APIs for every requirement: `MetadataRoute.Sitemap` for the sitemap, `MetadataRoute.Robots` for robots.txt, the `metadata` object for OG and Twitter tags, and the `lang` attribute on the root `<html>` element for SEO-01.

Significant groundwork was already done in Phase 5. Four of the five pages (`/`, `/quiz`, `/catalog`, `/compare`) already export `metadata` objects with Spanish descriptions and `openGraph.images` referencing `/og-image.png`. The `/profile` route uses a `layout.tsx` workaround (because `page.tsx` is a Client Component) that also already exports Spanish metadata. What is missing: `lang="es"` on the root html element, `metadataBase` in root layout, `twitter` fields on all pages, the actual `public/og-image.png` file, `src/app/robots.ts`, and `src/app/sitemap.ts`.

The OG image (`public/og-image.png`) is the only asset that requires creation from scratch. All other work is pure TypeScript file additions or one-line edits to existing files.

**Primary recommendation:** One plan is sufficient. All 7 SEO requirements are file-level changes that can be executed atomically: (1) fix `lang` + add `metadataBase` in root layout, (2) add `twitter` metadata to all 5 pages, (3) create `public/og-image.png`, (4) create `src/app/sitemap.ts`, (5) create `src/app/robots.ts`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Metadata API | 16.2.0 (already installed) | `metadata` object, `MetadataRoute.Sitemap`, `MetadataRoute.Robots` | Built-in, zero extra dependencies, generates correct `<head>` tags automatically |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | — | — | No additional libraries needed for this phase |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `app/sitemap.ts` | Static `app/sitemap.xml` | Static XML works but can't use TypeScript types or the `new Date()` for `lastModified` — use `.ts` |
| `app/robots.ts` | Static `app/robots.txt` | Static text works too for simple cases — either is fine; `.ts` is consistent with sitemap approach |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/app/
├── layout.tsx          # EDIT: lang="es", metadataBase, update root metadata to Spanish
├── sitemap.ts          # NEW: MetadataRoute.Sitemap export
├── robots.ts           # NEW: MetadataRoute.Robots export
├── page.tsx            # EDIT: add twitter field to existing metadata
├── quiz/page.tsx       # EDIT: add twitter field to existing metadata
├── catalog/page.tsx    # EDIT: add twitter field to existing metadata
├── compare/page.tsx    # EDIT: add twitter field to existing metadata
└── profile/layout.tsx  # EDIT: add twitter field to existing metadata
public/
└── og-image.png        # NEW: 1200×630 static image (create manually or generate)
```

### Pattern 1: Root Layout — lang + metadataBase

**What:** Set `lang="es"` on the `<html>` element and export `metadataBase` from the root layout so all child pages can use relative `/og-image.png` paths without build errors.

**When to use:** Once, in `src/app/layout.tsx`.

```typescript
// src/app/layout.tsx — Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://computer-recomendator.vercel.app'),
  title: {
    default: 'Computer Recomendator',
    template: '%s | Computer Recomendator',
  },
  description: 'Encuentra la laptop perfecta para tus necesidades con recomendaciones de expertos.',
};

// In the returned JSX:
// <html lang="es" ...>
```

### Pattern 2: Per-Page Twitter Card Metadata

**What:** Add a `twitter` field to each page's existing `metadata` export. All pages need `card: 'summary_large_image'` to generate a rich preview on Twitter/X and WhatsApp.

**When to use:** In all 5 page files (or profile/layout.tsx for the profile route).

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#twitter
export const metadata: Metadata = {
  title: "Quiz - Computer Recomendator",
  description: "Descubre tu laptop ideal en 3 pasos",
  openGraph: {
    title: "Quiz - Computer Recomendator",
    description: "Descubre tu laptop ideal en 3 pasos",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz - Computer Recomendator',
    description: 'Descubre tu laptop ideal en 3 pasos',
    images: ['/og-image.png'],
  },
};
```

### Pattern 3: Sitemap

**What:** `src/app/sitemap.ts` exporting a `MetadataRoute.Sitemap` default function. Hardcode the 5 static routes — no dynamic generation needed.

```typescript
// src/app/sitemap.ts — Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://computer-recomendator.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE_URL}/quiz`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/catalog`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/compare`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/profile`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];
}
```

### Pattern 4: Robots

**What:** `src/app/robots.ts` exporting a `MetadataRoute.Robots` default function. Allow all public pages; reference the sitemap URL.

```typescript
// src/app/robots.ts — Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://computer-recomendator.vercel.app/sitemap.xml',
  };
}
```

### Anti-Patterns to Avoid

- **Placing `metadataBase` in individual pages:** It only needs to be in the root layout; child pages inherit it.
- **Exporting `metadata` from a Client Component page:** Next.js ignores metadata exports from `'use client'` components. The `/profile` page is already handled correctly via `profile/layout.tsx` — do not add metadata to `profile/page.tsx`.
- **Absolute URLs in page-level OG images when `metadataBase` is set:** Use relative `/og-image.png`; the base URL is already provided by `metadataBase`. Mixing absolute and relative is fine but redundant.
- **Duplicating `twitter.images` as absolute when `metadataBase` covers it:** Twitter images also benefit from `metadataBase`, so `/og-image.png` works.
- **Using deprecated `viewport` inside `metadata`:** The current root `layout.tsx` already has `viewport` inside the `metadata` export — this has been deprecated since Next.js 14. It should be moved to a `generateViewport` export to eliminate the deprecation warning, but this is a minor cleanup, not a blocker.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| sitemap.xml generation | Manual XML string construction | `MetadataRoute.Sitemap` in `app/sitemap.ts` | Type-safe, automatic Content-Type header, cached by default |
| robots.txt generation | Static public/robots.txt file | `MetadataRoute.Robots` in `app/robots.ts` | Consistent with sitemap approach; programmatic means BASE_URL lives in one place |
| OG image generation | `@vercel/og` / `ImageResponse` | Static `public/og-image.png` | No dynamic OG needed; requirements explicitly say static image is sufficient |

**Key insight:** Every requirement in this phase has a built-in Next.js primitive. Zero npm installs required.

---

## Common Pitfalls

### Pitfall 1: Missing `metadataBase` causes build error with relative OG image URLs

**What goes wrong:** `next build` throws `Error: metadata.openGraph.images[0].url is not a valid URL` when pages use relative paths like `/og-image.png` and no `metadataBase` is set.

**Why it happens:** Next.js cannot generate the absolute URL for OG meta tags without a base. In development, it uses `localhost` as fallback; in production builds it errors.

**How to avoid:** Add `metadataBase: new URL('https://computer-recomendator.vercel.app')` to the root layout metadata export before running `next build`.

**Warning signs:** Build output containing "relative URL" errors, or OG image previews pointing to localhost in production.

### Pitfall 2: `metadata` export in a Client Component is silently ignored

**What goes wrong:** The SEO tags never appear in the page's `<head>`, and social previews show blank/fallback content.

**Why it happens:** Next.js's metadata system only processes exports from Server Components. Client Components (`'use client'`) cannot export `metadata`.

**How to avoid:** The `/profile` page is already solved: `src/app/profile/layout.tsx` is a Server Component that exports metadata, wrapping the client `page.tsx`. Do not add a `metadata` export to `profile/page.tsx`.

**Warning signs:** Running `curl -s https://[url] | grep og:title` returns no OG tags for a page.

### Pitfall 3: `og:image` missing `alt` text

**What goes wrong:** Some social platforms (LinkedIn) and accessibility validators flag missing `alt` on OG images.

**Why it happens:** The existing page metadata uses `images: [{ url: "/og-image.png", width: 1200, height: 630 }]` without an `alt` field.

**How to avoid:** Add `alt: 'Computer Recomendator — encuentra tu laptop ideal'` to every `openGraph.images` entry.

**Warning signs:** LinkedIn post preview shows image but with warning; accessibility audit tools flag missing OG alt.

### Pitfall 4: `public/og-image.png` does not exist

**What goes wrong:** Social previews show a broken image icon; `/og-image.png` returns 404.

**Why it happens:** Phase 5 planned the image but it was never created. The file is absent from `public/`.

**How to avoid:** The plan must include creating `public/og-image.png` at 1200×630 pixels. A simple branded placeholder (even a solid-color PNG with text) is sufficient. This is the only non-code asset needed.

**Warning signs:** `curl -I https://computer-recomendator.vercel.app/og-image.png` returns 404.

### Pitfall 5: Deprecated `viewport` inside `metadata` object

**What goes wrong:** Next.js emits a deprecation warning during `next build` because `viewport` is defined inside the `metadata` export in `src/app/layout.tsx`.

**Why it happens:** Since Next.js 14, `viewport` must be exported separately via `generateViewport` or a `viewport` named export.

**How to avoid:** During the root layout edit, move viewport config out of `metadata` and into a separate `export const viewport` export.

**Warning signs:** Build output: `"viewport" is not a valid metadata field. Use generateViewport instead.`

---

## Code Examples

### Complete root layout metadata (after fix)

```typescript
// src/app/layout.tsx — verified against Next.js 16.2 docs
import type { Metadata } from "next";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://computer-recomendator.vercel.app'),
  title: {
    default: 'Computer Recomendator',
    template: '%s | Computer Recomendator',
  },
  description: 'Encuentra la laptop perfecta para tus necesidades con recomendaciones de expertos.',
  openGraph: {
    siteName: 'Computer Recomendator',
    locale: 'es_AR',
    type: 'website',
  },
};
// <html lang="es" ...>
```

### Twitter card addition (per page)

```typescript
// Add to any page's existing metadata export
twitter: {
  card: 'summary_large_image',
  title: '<page title here>',
  description: '<page description here>',
  images: [{ url: '/og-image.png', alt: 'Computer Recomendator — encuentra tu laptop ideal' }],
},
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `<meta>` tags in `_document.tsx` | `metadata` export in App Router layouts/pages | Next.js 13.2 | No JSX needed for metadata; type-safe |
| `viewport` inside `metadata` object | `export const viewport: Viewport` separate export | Next.js 14 | Current layout.tsx has deprecated pattern — must fix |
| Static `public/sitemap.xml` | `app/sitemap.ts` with `MetadataRoute.Sitemap` | Next.js 13.3 | Programmatic, type-safe, auto-cached |

**Deprecated/outdated:**

- `viewport` inside `metadata`: deprecated since Next.js 14 — use `export const viewport` instead. Current `layout.tsx` uses the deprecated form.

---

## Open Questions

1. **OG image content/design**
   - What we know: File must be `public/og-image.png`, 1200×630px
   - What's unclear: Does the user want a branded design, or is a simple placeholder acceptable?
   - Recommendation: Create a minimal PNG (e.g., white background, app name in Spanish, laptop icon) as placeholder. The plan should note this is a manually created asset.

2. **`metadataBase` URL before Phase 7 deploy completes**
   - What we know: Placeholder URL `https://computer-recomendator.vercel.app` is confirmed acceptable per phase context
   - What's unclear: The actual Vercel URL is not yet confirmed (Phase 7 not done)
   - Recommendation: Use the placeholder. The URL is a single constant in `metadataBase` (root layout) and `sitemap.ts` / `robots.ts` — easy to update in one pass after Phase 7 confirms the URL.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code and static asset changes. No external tools, services, CLIs, databases, or runtimes are required beyond what is already in the project.

---

## Validation Architecture

### Test Framework

No test framework is configured in this project (no Jest, Vitest, or Playwright). `package.json` scripts: `dev`, `build`, `start`, `lint`. There are no `test/` or `__tests__/` directories.

| Property | Value |
|----------|-------|
| Framework | None configured |
| Config file | None |
| Quick run command | `npm run build` (build-time validation) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | `<html lang="es">` present in page source | manual | `curl -s http://localhost:3000 \| grep 'lang="es"'` | ❌ Wave 0 |
| SEO-02 | `metadataBase` resolves OG image to absolute URL | build | `npm run build` (errors if relative URL unresolved) | ❌ Wave 0 |
| SEO-03 | Each page has unique Spanish title/description in `<head>` | manual | `curl -s http://localhost:3000/[page] \| grep og:title` | ❌ Wave 0 |
| SEO-04 | `/og-image.png` returns 200 | manual | `curl -I http://localhost:3000/og-image.png` | ❌ Wave 0 |
| SEO-05 | `twitter:card` meta tag present on all pages | manual | `curl -s http://localhost:3000/[page] \| grep twitter:card` | ❌ Wave 0 |
| SEO-06 | `/robots.txt` returns valid content | manual | `curl -s http://localhost:3000/robots.txt` | ❌ Wave 0 |
| SEO-07 | `/sitemap.xml` returns valid XML with all 5 routes | manual | `curl -s http://localhost:3000/sitemap.xml` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run build` — confirms no TypeScript/metadata errors
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** All `curl` smoke tests pass against `http://localhost:3000` before `/gsd:verify-work`

### Wave 0 Gaps

All validation for this phase is manual `curl` inspection — no unit test files to create. The only automated gate is `npm run build`.

- [ ] Create `public/og-image.png` — required before build will succeed cleanly
- No test framework install needed — build + curl is sufficient for this phase

---

## Sources

### Primary (HIGH confidence)

- `https://nextjs.org/docs/app/api-reference/functions/generate-metadata` — metadataBase, openGraph, twitter, metadata merging behavior, viewport deprecation — fetched 2026-04-18, docs version 16.2.4
- `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap` — `MetadataRoute.Sitemap` type, sitemap.ts format — fetched 2026-04-18, docs version 16.2.4
- `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots` — `MetadataRoute.Robots` type, robots.ts format — fetched 2026-04-18, docs version 16.2.4
- Direct file inspection of `src/app/layout.tsx`, all 5 page files, `public/` directory — confirmed current state 2026-04-18

### Secondary (MEDIUM confidence)

- None required — official docs fully covered all requirements

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — Next.js 16.2 built-in APIs, confirmed via official docs fetched same day
- Architecture: HIGH — existing file structure inspected directly; patterns verified against official docs
- Pitfalls: HIGH — viewport deprecation and metadataBase behavior confirmed in official docs; og-image absence confirmed by direct `ls public/`

**Research date:** 2026-04-18
**Valid until:** 2026-07-18 (stable API, 90-day estimate)
