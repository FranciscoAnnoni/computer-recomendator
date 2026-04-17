# Pitfalls Research: v1.1

**Project:** Computer Recomendator — Next.js 15 + Tailwind v4 + Supabase
**Researched:** 2026-04-17
**Scope:** Adding mobile UX, SEO, feedback modal, profile avatars, and Vercel deploy to an existing working app.

---

## Mobile UX

### Common Mistakes

**1. Treating `sm:` as "mobile styles"**
Tailwind is mobile-first. `sm:` applies at 640px and above — it is NOT for mobile. Unprefixed utilities are what mobile gets. A very common mistake when retrofitting responsiveness is wrapping "mobile" styles in `sm:` when they should be unprefixed, and "desktop" styles unprefixed when they should be in `md:` or `lg:`.

**2. Tailwind v4 desktop-first assumptions broken silently**
Tailwind v4 removed easy desktop-first support. If any existing component was written with a mental model of "default = desktop, `sm:` = narrow override", those breakpoints now behave opposite to intent. There is no config flag to restore v3's inversion. The fix is: replace `md:` overrides with `max-md:` where desktop-first logic was intended.

**3. SSR/CSR hydration mismatch from `useWindowSize` or similar**
If mobile and desktop render completely different component trees (not just different classes), detecting viewport via `window.innerWidth` on mount causes a hydration mismatch. The server renders the default, client re-renders the other, and React logs an error or shows a flash. Prevention: either use CSS-only responsive classes (no JS branching), or initialize state with a static default and only branch after first render.

**4. Missing viewport meta tag**
The existing `layout.tsx` already sets `viewport` in the `metadata` export, which is correct. However, in Next.js 15 the `viewport` key inside `Metadata` is deprecated — it should be exported as a separate `export const viewport: Viewport` object from `layout.tsx`. Leaving it inside `metadata` still works but triggers a build warning. If ignored, future Next.js versions may drop it silently.

**5. Fixed-width containers that break on small screens**
Existing desktop components often have `min-w-[Xpx]` or hardcoded pixel widths that overflow on 375px screens without triggering a horizontal scrollbar on the `body` due to `overflow-hidden` somewhere in the tree, making the overflow invisible but the layout broken.

**6. Touch targets too small**
Buttons and interactive elements that are fine on desktop (32px) are unreachable on mobile. WCAG minimum is 44x44px. Quiz card flip targets are a likely problem area in this project.

**7. Navbar mobile sheet state not reset on navigation**
The Navbar already uses a Sheet for mobile. If `mobileOpen` is not reset on route change, the drawer stays open when the user navigates. The `useEffect` listening to router events must close it.

### Prevention

- Audit every component with browser DevTools at 375px width before and after changes.
- Use unprefixed utilities for mobile-first defaults; add `md:` or `lg:` overrides for larger screens.
- Replace any `sm:` overrides that were meant as "desktop exceptions" with `max-sm:` or refactor to mobile-first order.
- Export `viewport` as a separate const, not inside `metadata`.
- Test touch targets with "Show touch targets" in Chrome DevTools accessibility panel.
- Close mobile Sheet on `pathname` change via `useEffect(() => { setMobileOpen(false) }, [pathname])`.

---

## SEO

### Common Mistakes

**1. `metadata.viewport` inside page files**
The `viewport` field on the `Metadata` type is deprecated in Next.js 15. It must live only in `layout.tsx` as `export const viewport: Viewport`. If page-level `metadata` exports include `viewport`, it is ignored silently on some versions and errors on others.

**2. `openGraph` and `twitter` do not inherit from top-level fields**
This is the most commonly reported gotcha. Setting `title` and `description` at the top level of the metadata object does NOT automatically populate `openGraph.title` or `twitter.title`. Each sub-object must be populated explicitly, or the social cards will be empty.

**3. Static OG image referenced before it exists**
The current `page.tsx` references `/og-image.png` which does not exist in `public/`. Vercel will serve a 404 for the OG image, and social scrapers cache that 404. The image must be created and committed before deploy, or use `opengraph-image.tsx` for server-generated images instead.

**4. Dynamic routes get no unique metadata**
`/catalog` and `/quiz` have no `generateMetadata` and no per-page `metadata` export. Every page shares the root layout's generic title. Google sees all pages as the same content topic.

**5. JSON-LD XSS vulnerability via `JSON.stringify`**
`JSON.stringify` does not escape `<` characters. If any data injected into a JSON-LD script tag comes from user input or external sources, it can be used for XSS. The fix is to replace `<` with `\u003c` before injecting, or use the `serialize-javascript` package.

**6. JSON-LD in `<Script>` causes hydration mismatch**
Using Next.js `<Script>` component for JSON-LD results in it being inserted after hydration, which defeats its SEO purpose. Use a native `<script type="application/ld+json">` tag inside a Server Component — this is what Next.js docs explicitly recommend.

**7. `canonical` URL not set, causing duplicate content**
If the app is accessible via both the Vercel `.vercel.app` subdomain and a custom domain (or `www` vs non-`www`), search engines see duplicate content. Every page must set `alternates.canonical` to the authoritative URL.

**8. Sitemap not generated, robots.txt not present**
Without `app/sitemap.ts` and `app/robots.ts`, Google has no structured signal about which routes to index. The quiz route (`/quiz`) should be `noindex` since it has no SEO value and no unique content.

### Prevention

- Export `viewport` as `export const viewport: Viewport` only in `app/layout.tsx`, nowhere else.
- Explicitly set `openGraph.title`, `openGraph.description`, `twitter.title`, `twitter.description` — do not rely on top-level inheritance.
- Create the `public/og-image.png` (1200x630px) before the first deploy, or replace the static reference with an `opengraph-image.tsx` Server Component.
- Add `generateMetadata` to `/catalog` and `/quiz` at minimum. `/quiz` should have `robots: { index: false }`.
- Use native `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />` inside a Server Component.
- Set `alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL + pathname }` in root layout or per page.
- Add `app/sitemap.ts` and `app/robots.ts` before deploy.

---

## Feedback Modal

### Common Mistakes (spam, storage, privacy)

**1. No rate limiting — open to spam flooding**
A feedback form with no server-side rate limiting on Vercel serverless functions will accept unlimited submissions. Bots discover forms within hours of a site going public. Without Redis-backed rate limiting, the Supabase `feedback` table fills with garbage and email notifications become noise.

**2. Storing raw IP addresses in Supabase — GDPR violation**
IP addresses are personal data under GDPR. Storing them without disclosure in a privacy policy is non-compliant. Rate limiting by IP is fine, but the IP should not be persisted in the database beyond the rate-limit window (seconds/minutes), not stored permanently in the feedback record.

**3. No honeypot field — trivial bots succeed**
Bots that auto-fill forms will bypass a modal with no honeypot. A hidden field (visually hidden via CSS, not `type="hidden"`) that is left empty by real users and filled by bots adds a free first layer of spam filtering without friction.

**4. Feedback stored but never triaged — database grows indefinitely**
Without a cap or archival strategy, a feedback table grows forever. For a small project with no admin UI, even 500 spam submissions make the table unusable for manual review. Design a `status` enum (`new`, `read`, `spam`) from the start.

**5. Modal opens on every visit — UX annoyance**
If the feedback button accidentally triggers on page load or if the modal has no `localStorage` "already seen" gate, it interrupts the main quiz flow. A feedback button should be opt-in only, never auto-shown.

**6. No character limit on feedback text**
A textarea with no `maxLength` can receive multi-megabyte payloads from bots. The server action or API route must enforce a character limit (e.g., 2000 chars) at the server level, not just the client.

**7. No user feedback after submission**
Submitting feedback with no success/error state shown — just a modal close — leaves users uncertain whether their message was received. This leads to repeat submissions.

### Prevention

- Use Upstash Redis + `@upstash/ratelimit` in the Server Action or Route Handler: 3 submissions per IP per hour is a reasonable default.
- Never persist IP addresses in the feedback table. Use them only in the rate-limit key in Redis (TTL-based, auto-expires).
- Add a honeypot field: `<input name="_gotcha" tabIndex={-1} aria-hidden="true" className="hidden" />`. Reject any submission where this field is non-empty.
- Add a `status` column to the feedback table: `text`, `email` (optional), `submitted_at`, `status` (default `new`).
- Enforce `maxLength={2000}` on the textarea and validate the same limit server-side before inserting to Supabase.
- Show a success state inside the modal after submission. Do not close immediately.
- The feedback button is a UI element near ThemeToggle — ensure it never auto-opens; it must be a deliberate click.

---

## Profile Avatars

### Common Mistakes

**1. Committing 81 large PNGs to the git repo**
AI-generated images without optimization can easily be 500KB–2MB each. 81 images at 1MB = 81MB added to the repo. This bloats `git clone` time, slows CI, and may hit Vercel's 100MB source size limit. Pixel art should be small by nature, but generators often output uncompressed PNGs at high resolution.

**2. Wrong file format — PNG when WebP/AVIF would be 10x smaller**
Pixel art at 64x64 or 128x128 is a few KB in optimized PNG. If generated at 512x512 or higher and stored as uncompressed PNG, file sizes balloon. WebP at the same dimensions is 80% smaller.

**3. Using `<img>` instead of `next/image` for avatars**
Raw `<img>` tags bypass Next.js image optimization. For 81 avatars rendered in a list or grid, this means no lazy loading and no format negotiation. Use `next/image` with explicit `width` and `height`.

**4. Storing avatars in Supabase Storage instead of `public/`**
For static, never-changing assets like profile avatars (one per profile, fixed set of 81), Supabase Storage adds unnecessary complexity: bucket permissions, CDN config, signed URL management. The `public/avatars/` folder is simpler, gets CDN headers automatically from Vercel's edge network, and requires zero database queries.

**5. Avatar URLs stored in the database that break after a rename**
If avatar filenames are stored as absolute URLs in the Supabase `profiles` table and the storage bucket or CDN domain changes, all 81 records need updating. Storing only the relative slug (e.g., `profile-slug`) and deriving the path at render time (`/avatars/${slug}.webp`) is resilient to infrastructure changes.

**6. No `alt` text or generic `alt="avatar"` for all 81**
Screen readers and SEO crawlers see 81 identical `alt="avatar"` attributes. Each avatar should have a descriptive alt: the profile name (e.g., `alt="Diseñador Gráfico"`).

**7. Generated avatars have inconsistent style across the set**
AI generators produce subtly inconsistent styles across a batch if prompts vary or if the model is non-deterministic. Running all 81 in a single batch with a fixed seed and consistent prompt template is critical. Reviewing all 81 side-by-side before commit catches this before it reaches production.

### Prevention

- Generate at 128x128 or 256x256. Convert to WebP (`cwebp -q 80 input.png -o output.webp` or use `sharp` in a one-time script).
- Run all 81 through `imagemin` or `sharp` before committing. Target under 10KB per avatar.
- Place files in `public/avatars/` with slug-based names matching the profile data.
- Store only the slug in the database, derive full path at render time.
- Use `next/image` with `width={64} height={64} alt={profile.profile_name}`.
- Review the full 81-image grid in a local test page before shipping.

---

## Deploy

### Common Mistakes (env vars, Supabase pooling, image domains)

**1. Environment variables missing or wrong scope on Vercel**
The Supabase Vercel integration sets env vars to "Production only" by default. If you run a preview deploy before configuring scopes, preview builds fail with `supabaseUrl is required`. After connecting Supabase, click the three-dot menu on each env var and select "All environments" (Production, Preview, Development).

**2. `NEXT_PUBLIC_SITE_URL` set to a custom domain before it is configured**
Setting `NEXT_PUBLIC_SITE_URL=https://myapp.com` before that domain is configured on Vercel causes the first deploy to fail OAuth redirects and canonical URL generation. Use the Vercel auto-assigned URL (`https://project-name.vercel.app`) for the first deploy, then update after adding the custom domain.

**3. Quotes around env var values**
Copying `.env.local` values with surrounding quotes (`SUPABASE_KEY="abc123"`) into Vercel's env var UI causes the quotes to be included in the value. The Supabase client receives `"abc123"` (with literal quotes) and fails silently or with opaque errors.

**4. `next/image` `remotePatterns` does not cover all production image hostnames**
The current `next.config.ts` covers `orxstqqcsxatxaprqyvq.supabase.co`, `images.unsplash.com`, `http2.mlstatic.com`, and `m.media-amazon.com`. If any laptop image in production comes from a different CDN subdomain (e.g., MercadoLibre changes its CDN), `next/image` returns a 400. The `hostname` pattern should use a wildcard for domains with dynamic subdomains: `hostname: "*.mlstatic.com"`.

**5. Supabase direct connection (port 5432) instead of pooler (port 6543)**
Vercel serverless functions spin up per request. Each invocation opens a new Postgres connection. Using the direct connection string exhausts Supabase's connection limit under any real traffic. The connection string in env vars must use the Supabase Supavisor pooler URL (port 6543), not the direct connection (port 5432). The Supabase dashboard shows both; the pooler URL ends in `.pooler.supabase.com`.

**6. Build fails because `NEXT_PUBLIC_*` vars are not present at build time**
`NEXT_PUBLIC_` variables are inlined at build time by the Next.js compiler. If they are missing from Vercel's env vars at the time the build runs, they are `undefined` in the bundle — not picked up from the runtime environment. The build must be re-triggered after all `NEXT_PUBLIC_` vars are set.

**7. Supabase redirect URLs not updated for production domain**
Supabase Auth blocks OAuth and magic link redirects to any URL not in the allowlist. After deploying to production, `https://project-name.vercel.app/**` and the custom domain must be added to Authentication > URL Configuration > Redirect URLs in the Supabase dashboard. Missing this causes silent auth failures only visible in production.

**8. No `robots.txt` and no sitemap served from production**
Without `app/robots.ts`, Vercel serves no `robots.txt`. Google's default is to index everything. If `/quiz` or `/compare` should be noindex, this must be explicit before Google first crawls the site (first indexation is hard to un-do quickly).

**9. Missing `og-image.png` referenced from `page.tsx`**
The current `page.tsx` has `images: [{ url: "/og-image.png" }]` in the OpenGraph metadata. This file does not exist in `public/`. Vercel will deploy successfully but social card scrapers will cache a 404 for the OG image. This needs to be created before the first production deploy.

### Prevention

- Set all env vars in Vercel before the first deploy trigger.
- Select "All environments" for each Supabase env var in the Vercel integration panel.
- Use the pooler connection string (port 6543) for `DATABASE_URL` if using direct Postgres queries, or confirm the Supabase JS client URL uses the pooler.
- Use wildcard hostnames in `remotePatterns` for CDNs with dynamic subdomains: `"*.mlstatic.com"`, `"*.supabase.co"`.
- Create `public/og-image.png` (1200x630px) before the first deploy.
- Add production domain to Supabase redirect URL allowlist immediately after first successful deploy.
- Add `app/robots.ts` and `app/sitemap.ts` before first deploy so Google's first crawl has correct signals.
- Never copy env var values with surrounding quotes.

---

## Phase Assignment

| Pitfall | Phase to Address |
|---------|-----------------|
| Tailwind v4 mobile-first breakpoint audit | Mobile UX phase |
| Viewport meta `Metadata` deprecation | SEO phase (while touching layout.tsx) |
| Missing `og-image.png` | SEO phase |
| OG/Twitter metadata not inheriting from top-level | SEO phase |
| JSON-LD XSS via JSON.stringify | SEO phase |
| Missing `robots.ts` and `sitemap.ts` | SEO phase |
| Feedback rate limiting (Upstash) | Feedback modal phase |
| Feedback honeypot field | Feedback modal phase |
| GDPR — no IP persistence | Feedback modal phase |
| Avatar format and size (WebP, under 10KB) | Avatars phase |
| Avatar storage in `public/` not Supabase | Avatars phase |
| Env vars scope and pooler connection string | Deploy phase |
| Supabase redirect URL allowlist | Deploy phase |
| remotePatterns wildcard hostnames | Deploy phase (verify current config) |
| SSR hydration mismatch from window size detection | Mobile UX phase |
