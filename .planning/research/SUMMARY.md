# Research Summary: v1.1 Launch-Ready Polish

**Synthesized:** 2026-04-17
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Stack Additions

Only 3 new packages needed for all 5 v1.1 features. Everything else uses the existing stack.

```bash
# Types only — zero runtime cost, erased at compile time
npm install schema-dts

# Avatar generation — runs once via build script, not in production bundle
npm install @dicebear/core @dicebear/pixel-art
```

| Package | Version | Purpose | Runtime cost |
|---------|---------|---------|-------------|
| `schema-dts` | 2.0.0 | TypeScript types for Schema.org JSON-LD (`WebSite`, `Product`, `ItemList`) | Zero (types only) |
| `@dicebear/core` | 9.4.2 | Avatar generation engine | Build script only |
| `@dicebear/pixel-art` | 9.4.2 | Pixel art style for DiceBear | Build script only |

Run avatar generation once: `npx tsx scripts/generate-avatars.ts` — outputs 81 SVGs to `public/avatars/`.

Do NOT install: `next-seo` (Pages Router), `@vercel/og` (already inside `next/og`), `react-helmet`, any AI image API SDK, `react-query`, or any CSS-in-JS library.

---

## Feature Table Stakes

Minimum viable implementation for each feature.

### 1. Mobile UX

| Requirement | Implementation |
|-------------|---------------|
| 44px minimum touch targets on all buttons, filter chips, and card CTAs | Add `min-h-[44px] min-w-[44px]` to Navbar buttons, quiz cards, and catalog filter chips |
| Fix `lang="en"` to `lang="es"` on root `<html>` | One-line change in `src/app/layout.tsx` |
| No horizontal scroll at any viewport ≥ 375px | Audit Compare page (side-by-side tables are the most likely culprit) |
| Safe-area insets for iPhone notch/home indicator | Add `env(safe-area-inset-*)` to fixed elements via `globals.css` |
| Font size ≥ 16px on all inputs | Prevents iOS Safari auto-zoom on the feedback modal textarea |
| Active/tap states on interactive cards | `active:scale-95` or `active:opacity-70` on CatalogCard and quiz option cards |

Bottom nav is a differentiator, not table stakes. The hamburger Sheet already functions.

### 2. SEO

| Requirement | Implementation |
|-------------|---------------|
| `/og-image.png` exists at 1200×630 | Create and commit to `public/og-image.png` before any deploy — referenced by all 4 pages but currently missing |
| Fix `lang="es"` on root `<html>` | `src/app/layout.tsx` (overlaps with Mobile UX task) |
| `twitter: { card: "summary_large_image" }` in root metadata | Add to `metadata` in `layout.tsx` |
| `metadataBase` set to `NEXT_PUBLIC_SITE_URL` | Required for all absolute OG image URLs to work |
| `openGraph` and `twitter` sub-objects populated explicitly | Top-level `title`/`description` do NOT propagate to sub-objects automatically |
| `public/robots.txt` or `app/robots.ts` | Create before first deploy |
| `app/sitemap.ts` returning all 4 routes | Mark `/quiz` as `noindex` |
| Consistent Spanish metadata across all pages and root layout | Root layout description is currently in English |

JSON-LD structured data is a differentiator. Product JSON-LD on laptops requires a routing decision (overlay vs `/catalog/[slug]`) that is out of scope for v1.1 minimum.

### 3. Feedback Modal

| Requirement | Implementation |
|-------------|---------------|
| `FeedbackButton` icon in Navbar next to `ThemeToggle` | New `src/components/feedback/feedback-button.tsx`; uses `MessageSquare` from lucide-react |
| Modal with optional free-text textarea (max 300 chars) + submit + close | New `src/components/feedback/feedback-modal.tsx` using existing Base UI Dialog |
| Page context captured automatically | `window.location.pathname` captured on submit, not shown to user |
| Toast confirmation on successful submit | Prevents repeat submissions |
| Supabase `feedback` table with RLS | `id`, `message`, `page`, `created_at`; anon insert policy, no anon select |
| Server-enforced `maxLength` on message | Validate 300 char limit in Server Action before DB insert |
| Honeypot hidden field | `<input name="_gotcha" tabIndex={-1} aria-hidden className="hidden" />` — reject if non-empty |

Star rating is desirable but not required for MVP.

### 4. Profile Avatars

| Requirement | Implementation |
|-------------|---------------|
| One unique image per profile (81 total), consistent pixel art style | Generate via `scripts/generate-avatars.ts` using DiceBear `pixelArt` with profile ID as seed |
| Store as static SVG in `public/avatars/[profile_id].svg` | Served from Vercel CDN, zero runtime cost, no Supabase Storage complexity |
| `ProfileAvatar` accepts `imageSrc?: string` prop | If provided, render `<Image>` from `next/image`; fall back to colored circle |
| Avatar shown in Navbar (32px), ProfileSheet (48px), Profile page hero (64–80px), quiz result (56px) | Update all 4 call sites |
| Descriptive `alt` text per avatar | `alt={profile.profile_name}` — not generic `alt="avatar"` |

Files must be under 10KB each (DiceBear SVG is typically 2–5KB). Do not store in Supabase Storage.

### 5. Deploy

| Requirement | Implementation |
|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel | Set scope to "All environments" — not Production only |
| `NEXT_PUBLIC_SITE_URL` set to production Vercel URL | Required for `metadataBase` and canonical URLs |
| `public/og-image.png` committed before push to main | Social scrapers cache 404s — must exist at first deploy |
| `next build` passes locally before push | Catches type errors and missing env vars |
| Env var values entered without surrounding quotes | Literal quotes cause silent Supabase auth failures |
| `allowedDevOrigins` local IPs removed from `next.config.ts` | Dev-only config |
| Wildcard `remotePatterns` for CDNs with dynamic subdomains | Use `"*.mlstatic.com"` instead of `"http2.mlstatic.com"` |

---

## Build Order

Dependencies drive this sequence. Each phase ships independently.

### Phase 1: Deploy — unblocks everything

Deploy the current app before writing any new code. Gives a real production URL (needed for `metadataBase`), confirms env vars, and enables real-device mobile testing.

1. Set all 3 env vars in Vercel (All environments scope)
2. Remove `allowedDevOrigins` local IPs from `next.config.ts`
3. Create placeholder `public/og-image.png` (1200×630, can be replaced later)
4. Push to main

Rationale: `metadataBase` requires a real URL. All SEO work is meaningless without it.

### Phase 2: SEO — quick wins, all config/file changes

1. `layout.tsx`: `lang="es"`, add `metadataBase`, add `twitter.card`, explicitly populate `openGraph` sub-object, export `viewport` as separate const
2. Add `metadata` to `/compare/page.tsx` (currently missing)
3. Create `app/sitemap.ts` (4 routes; `/quiz` with `noindex`)
4. Create `app/robots.ts`
5. Build `/api/og/route.tsx` with `ImageResponse` (Next.js built-in, no new dep)
6. Replace static `/og-image.png` references with `/api/og?title=...` pattern

### Phase 3: Feedback Modal — isolated feature, no cross-deps

1. Run Supabase migration: `feedback` table with anon insert RLS
2. `src/lib/feedback.ts` — insert function with 300 char server validation
3. `src/components/feedback/feedback-button.tsx`
4. `src/components/feedback/feedback-modal.tsx` — Dialog + textarea + honeypot + submit + toast
5. Add `FeedbackButton` to Navbar in both desktop and mobile branches

### Phase 4: Profile Avatars — design bottleneck, not engineering

1. Install `@dicebear/core @dicebear/pixel-art`
2. Write `scripts/generate-avatars.ts` using profile IDs as seeds
3. Run script — review all 81 SVGs side-by-side before committing
4. Extend `ProfileAvatar`: add `imageSrc?: string` prop
5. Update all 4 call sites
6. Derive image path at render time (`/avatars/${profile.id}.svg`) — do not store path in DB

### Phase 5: Mobile UX — polish pass, do last

Purely presentational. Do last so you polish the deployed, SEO'd, avatar-enabled app on real devices.

1. Audit all interactive elements at 375px for 44px touch target compliance
2. Add `active:scale-95` tap states to CatalogCard and quiz options
3. Add safe-area inset CSS to globals
4. Ensure inputs are ≥ 16px font size
5. Reduce `py-16` → `py-8 md:py-16` on profile page header
6. Audit Compare page for horizontal overflow
7. Final QA at 375px (iPhone SE) and 390px (iPhone 14)
8. Build bottom nav only if real-device testing shows hamburger friction

---

## Watch Out For

Top 5 most critical pitfalls:

1. **OG image missing at first deploy** — `public/og-image.png` is referenced by all 4 pages and does not exist. Social scrapers cache 404s on first crawl, which is hard to undo. Prevention: create the file in Phase 1 before any `git push` to main.

2. **OG/Twitter metadata does not inherit from top-level fields** — `title` and `description` at the root of `Metadata` do NOT populate `openGraph.title` or `twitter.title`. Prevention: always write `openGraph: { title: "...", description: "..." }` and `twitter: { title: "...", description: "..." }` explicitly — never assume inheritance.

3. **Env vars scoped to Production only** — Supabase's Vercel integration defaults to Production environment. Preview deploys fail silently. Prevention: after connecting integration, open each env var and switch scope to "All environments" before the first build.

4. **Feedback textarea with no server-side length limit** — A textarea with only client-side `maxLength` accepts megabyte payloads from bots hitting the Server Action directly. Prevention: enforce the 300 char limit inside `submitFeedback()` before the Supabase insert — one guard statement, must be present at creation.

5. **Tailwind `sm:` misread as mobile styles** — `sm:` applies at 640px and above. Mobile gets unprefixed utilities. Any "mobile" styles written with `sm:` are actually applying to desktop. Prevention: audit at 375px in DevTools before and after every change; write unprefixed for mobile, `md:` or `lg:` for larger screens.

---

## Open Questions

Unresolved decisions that affect implementation:

1. **Should `/catalog/[slug]` dynamic routes exist?** Laptop detail is currently a client-side overlay — Google cannot index individual laptops. JSON-LD Product schema with rich results requires static or SSR routes. Decision: accept partial crawler coverage at v1.1 or add dynamic routes in v1.2.

2. **Bottom navigation bar: build or defer?** The hamburger Sheet works. A bottom nav improves thumb-zone access for a 5-route app but adds conditional rendering complexity and must coexist with the Feedback button. Decision: test on real device after Phase 1 deploy; build in Phase 5 only if friction is observed.

3. **Avatar naming: profile UUID vs. integer `avatar_id`?** Deriving the path as `/avatars/${profile.id}.svg` requires SVG filenames to match Supabase row UUIDs. Alternative: add a stable `avatar_id` integer column (1–81) and name files `001.svg`–`081.svg`. Decision needed before Phase 4 script is written.

4. **Feedback rate limiting: add Upstash Redis now or defer?** PITFALLS.md recommends `@upstash/ratelimit` (3 submissions/IP/hour) from the start. For a low-traffic portfolio app at v1.1, honeypot + Supabase RLS may be sufficient. Decision: defer Upstash until spam is observed; add honeypot unconditionally.

5. **`NEXT_PUBLIC_SITE_URL`: use `.vercel.app` subdomain or wait for custom domain?** Setting it to a custom domain before that domain is configured on Vercel breaks canonical URL generation on first deploy. Use the auto-assigned Vercel URL for Phase 1 and update after custom domain is confirmed.
