# Stack Research: v1.1 Features

**Project:** Computer Recomendator
**Researched:** 2026-04-17
**Existing stack:** Next.js 16.2, React 19, Tailwind v4, Supabase, shadcn/ui (base-ui), Framer Motion 12, TypeScript, Vercel

---

## SEO

### Recommendation: Built-in `next/metadata` + inline JSON-LD script + `schema-dts` types

**Why not `next-seo`:** The app already uses the Next.js `Metadata` API in `layout.tsx` (confirmed by reading the file). `next-seo` is designed for the Pages Router; its maintainer has acknowledged it's superseded by Next.js's native metadata API for App Router projects. Adding it now would be a step backward and would create two competing metadata systems.

**Meta tags / OG tags — `next/metadata` (already installed, zero new deps)**

The `generateMetadata` function and the `metadata` export are App Router-native, type-safe, and handle deduplication automatically. Extend the existing `metadata` object in `layout.tsx` to add:

```ts
export const metadata: Metadata = {
  title: { default: "Computer Recomendator", template: "%s | Computer Recomendator" },
  description: "...",
  openGraph: { title: "...", description: "...", images: ["/og.png"] },
  twitter: { card: "summary_large_image" },
};
```

Confidence: HIGH — confirmed in official Next.js docs and observed in the codebase.

**OG image generation — `next/og` (built into Next.js, zero new deps)**

`ImageResponse` from `next/og` renders JSX to a PNG using Satori and runs on Vercel's Edge Runtime. Create `app/opengraph-image.tsx` (static) or `app/opengraph-image.tsx` route handlers (dynamic). No additional package install needed — it ships with Next.js 16.

Constraints to know:
- 500 KB bundle limit per route (include only what you use)
- Only a subset of CSS/flexbox supported — no grid, no backdrop-filter
- One font per OG image keeps size small

Confidence: HIGH — official Next.js docs, confirmed working in 16.x.

**JSON-LD structured data — `schema-dts@2.0.0` (new dep, types only)**

```bash
npm install schema-dts
```

`schema-dts` is a Google-maintained package that provides TypeScript types for every Schema.org entity. It has zero runtime cost (types are erased at compile time). Use it in a Server Component with a plain `<script>` tag:

```tsx
import type { WithContext, WebSite } from "schema-dts";

const jsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Computer Recomendator",
  url: "https://your-domain.com",
};

export default function Layout() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ... */}
    </>
  );
}
```

The `<` character in JSON can be escaped to `\u003c` to defend against XSS if the data ever includes untrusted strings — not strictly necessary for static site content.

Relevant types for this project: `WebSite` (root), `ItemList` + `Product` (catalog page), `FAQPage` (quiz).

Confidence: HIGH — 100k+ weekly downloads, Google-authored, version 2.0.0 confirmed on npm.

**New packages from this section:**
```bash
npm install schema-dts
```

---

## Feedback System

### Recommendation: Supabase table (zero new infrastructure, data ownership)

**Why not Typeform:** Adds an external dependency, data lives outside your control, requires an account and embedding. Overkill for a simple text box modal.

**Why not Canny:** Designed for product roadmap voting/tracking at SaaS scale. Heavy embed, cookie-heavy, not appropriate for a student portfolio app.

**Why not Sentry Feedback widget:** Sentry is for error tracking. Its feedback widget is tightly coupled to error reports. Would require adding Sentry's entire SDK just for a comment box.

**Implementation: Supabase `feedback` table**

The app already has `@supabase/supabase-js@^2.99.2`. Add one table, one Server Action, and a client-side modal component. Nothing new to install.

Table schema:
```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  page text,                -- optional: which page the user was on
  created_at timestamptz default now()
);
-- RLS: allow anonymous inserts only
alter table feedback enable row level security;
create policy "anon insert" on feedback for insert to anon with check (true);
```

Server Action (Next.js 16 App Router):
```ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function submitFeedback(message: string, page?: string) {
  const supabase = await createClient();
  await supabase.from("feedback").insert({ message, page });
}
```

The modal itself uses shadcn/ui `Dialog` (already available via `@base-ui/react`). The trigger button lives in the Navbar next to the theme toggle.

No rate limiting is needed at v1.1 — add later if spam becomes an issue (Supabase's built-in RLS is sufficient for now).

Confidence: HIGH — uses only existing dependencies.

**New packages from this section:** None.

---

## Avatar Generation

### Recommendation: DiceBear `@dicebear/core@9.4.2` + `@dicebear/pixel-art@9.4.2` — pre-generate SVGs at build time

**Why not AI image APIs (Replicate, Together.ai, Stability AI):**
- Costs money per request
- Adds latency per avatar
- Output is non-deterministic — same profile can produce different images on different runs
- Requires storing generated images externally (S3, CDN)
- Massive overkill for pixel art

**Why not sprite sheets / static manual art:**
- 81 unique images would need manual design work or a graphic designer
- Maintenance burden if profiles change

**Why DiceBear pixel-art:**
- Deterministic: same seed string always produces the same SVG — use the profile slug or ID as seed
- MIT code + CC0 design license — no attribution required, no legal issues
- v9.x is actively maintained (last publish 2 months ago as of research date)
- Outputs SVG — scales perfectly on any device, tiny file size
- No server needed — runs entirely in Node.js at build time or in the browser

**Approach: pre-generate at build time, store as static SVG files**

Generate all 81 avatars once in a build script and commit the SVGs to `public/avatars/`. This avoids any runtime cost and works offline.

```bash
npm install @dicebear/core @dicebear/pixel-art
```

Build script (`scripts/generate-avatars.ts`):
```ts
import { createAvatar } from "@dicebear/core";
import { pixelArt } from "@dicebear/pixel-art";
import fs from "fs";
import path from "path";

const profiles = [ /* array of profile slugs/IDs */ ];

for (const profileId of profiles) {
  const avatar = createAvatar(pixelArt, {
    seed: profileId,
    size: 128,
  });
  const svg = avatar.toString();
  fs.writeFileSync(
    path.join("public/avatars", `${profileId}.svg`),
    svg
  );
}
```

Run once: `npx tsx scripts/generate-avatars.ts`

In the UI, reference as `<img src={`/avatars/${profile.id}.svg`} alt={profile.name} />` — or use Next.js `<Image>` with `unoptimized` for SVG.

**Alternative considered: `@dicebear/pixel-art-neutral`** — gender-neutral variant, same API. Can be used instead if the character aesthetic matters.

Confidence: HIGH — version confirmed on npm, API verified via DiceBear docs.

**New packages from this section:**
```bash
npm install @dicebear/core @dicebear/pixel-art
```

---

## Mobile UX

### Recommendation: Pure Tailwind v4 — zero new packages

Tailwind v4's responsive utilities (`sm:`, `md:`, `lg:`) with a mobile-first authoring approach are sufficient for a UX/UI redesign. The app already has Framer Motion for animations — no new animation library needed.

Specific patterns to apply:
- Use `sm:` prefix sparingly — write base styles for mobile, override for desktop
- Replace any `flex` rows that break on small screens with `flex-col sm:flex-row`
- Add `touch-manipulation` to interactive elements to remove the 300ms tap delay on iOS
- Use `safe-area-inset-*` via CSS `env()` for iPhone notch/home bar padding (set in globals.css, not a Tailwind class)
- Prefer `min-h-dvh` over `min-h-screen` for mobile browsers where the viewport height shifts with the address bar

No new packages: shadcn/ui components are already responsive-capable. Framer Motion already handles the card-flip quiz animations.

If a bottom navigation bar is added for mobile (not in scope), `vaul` (drawer component) would be the right choice — but this is not needed for v1.1.

Confidence: HIGH — Tailwind v4 responsive system is well-documented and requires no additions.

**New packages from this section:** None.

---

## Deploy

### Recommendation: Standard Vercel Git integration, no special config needed

The app is already on Vercel's stack (Next.js + Supabase pattern is first-class on Vercel). Steps:

1. **Environment variables** — Add to Vercel dashboard under Settings → Environment Variables for Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any server-side Supabase service role key (without `NEXT_PUBLIC_` prefix)

2. **`next.config.ts` — image domains** — Confirm any external image hostnames (MercadoLibre CDN, Amazon) are in `images.remotePatterns`. Already done per project state, but verify before build.

3. **OG image edge runtime** — If using `ImageResponse` from `next/og`, the route handler must be on Edge Runtime (Vercel handles this automatically with the `export const runtime = "edge"` export). The Hobby plan supports Edge Functions.

4. **Vercel Hobby plan limits relevant to this app:**
   - 100 GB bandwidth / month — fine for a portfolio app
   - Serverless function execution: 10s timeout (sufficient; Server Actions complete in < 1s)
   - No cron jobs needed at v1.1

5. **No `vercel.json` needed** — Default framework detection for Next.js is correct. Only add `vercel.json` if you need custom rewrites or headers (not required here).

Confidence: HIGH — standard Vercel + Next.js deployment, no novel configurations.

**New packages from this section:** None.

---

## What NOT to Add

| Library | Reason to Avoid |
|---------|----------------|
| `next-seo` | Pages Router library; superseded by native `next/metadata` in App Router. App already uses `Metadata` API. Adding it creates two competing systems. |
| `@vercel/og` | This is now bundled inside `next/og` — installing it separately is redundant and can cause version conflicts. |
| `react-helmet` / `react-helmet-async` | Pages Router / CRA era solution. Not compatible with App Router Server Components and streaming. |
| `Typeform` / `Canny` / `Sentry Feedback` | External services that add cost, data ownership issues, or heavy SDK weight for what is a simple text submission form. |
| `Replicate` / `Together.ai` / `Stability AI` SDKs | AI image generation is non-deterministic, paid, and adds runtime latency. DiceBear at build time is simpler and free. |
| `react-query` / `@tanstack/query` | Not needed — Supabase calls are either Server Actions or direct client calls. Adding a full data-fetching layer is premature for v1.1. |
| Any CSS-in-JS library (`styled-components`, `emotion`) | Incompatible with Tailwind v4's approach and adds bundle weight. The project is already Tailwind-only. |

---

## Summary: New npm Installs for v1.1

```bash
# Types only — zero runtime cost
npm install schema-dts

# Avatar generation (run once at build time via script)
npm install @dicebear/core @dicebear/pixel-art
```

Total new runtime dependencies: **0** (schema-dts is types-only, DiceBear runs in a build script)
Total new devDependencies needed: `@dicebear/core`, `@dicebear/pixel-art`, `schema-dts`

All other v1.1 features use the existing stack with no additions.

---

## Sources

- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js JSON-LD guide: https://nextjs.org/docs/app/guides/json-ld
- Next.js ImageResponse / next/og: https://nextjs.org/docs/app/api-reference/functions/image-response
- DiceBear pixel-art npm: https://www.npmjs.com/package/@dicebear/pixel-art
- DiceBear core npm: https://www.npmjs.com/package/@dicebear/core
- schema-dts npm: https://www.npmjs.com/package/schema-dts
- Vercel environment variables: https://vercel.com/docs/environment-variables
- next-seo vs metadata discussion: https://github.com/vercel/next.js/discussions/51392
