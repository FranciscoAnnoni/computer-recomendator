# Architecture Research: v1.1

**Project:** Computer Recomendator
**Researched:** 2026-04-17
**Scope:** Integration architecture for five v1.1 features into existing Next.js 15 App Router app

---

## Integration Map

The existing app has a clear layered structure. Every feature slots into one or more layers:

```
┌─────────────────────────────────────────────────────────────┐
│  src/app/         — pages, metadata exports, layouts        │
│    layout.tsx     — ThemeProvider wraps everything          │
│    page.tsx       — / (home, has metadata)                  │
│    quiz/page.tsx  — /quiz (has metadata)                    │
│    catalog/page.tsx — /catalog (has metadata)               │
│    profile/page.tsx — /profile ("use client", localStorage) │
│    compare/page.tsx — /compare                              │
├─────────────────────────────────────────────────────────────┤
│  src/components/                                            │
│    layout/navbar.tsx    — sticky nav, profile avatar hook   │
│    layout/footer.tsx    — minimal, no state                 │
│    quiz/profile-avatar.tsx  — colored circle, no img yet    │
│    quiz/profile-sheet.tsx   — left-side Sheet in Navbar     │
│    quiz/quiz-result.tsx     — writes localStorage           │
│    catalog/catalog-client.tsx — big client component        │
│    catalog/catalog-card.tsx  — article element              │
│    ui/theme-toggle.tsx      — next to hamburger on mobile   │
├─────────────────────────────────────────────────────────────┤
│  src/lib/          — Supabase fetchers, profile-color       │
│  src/types/        — laptop.ts, quiz.ts                     │
├─────────────────────────────────────────────────────────────┤
│  Supabase          — laptops, profiles, profile_laptop_assignments │
│  next.config.ts    — image remote patterns (supabase.co etc)│
└─────────────────────────────────────────────────────────────┘
```

Feature touch-points at a glance:

| Feature | Touches app/ | Touches components/ | Touches lib/ | Touches Supabase | New infra |
|---------|-------------|---------------------|--------------|-----------------|-----------|
| Mobile UX | profile/page.tsx | navbar, catalog-card, catalog-client, hero-section | - | - | - |
| SEO | layout.tsx, all page.tsx | - | - | - | /api/og route |
| Feedback modal | - (no new page) | navbar.tsx | - | new table | optional: third-party |
| Profile avatars | - | profile-avatar.tsx, profile/page.tsx, profile-sheet.tsx | - | Supabase Storage OR public/ | next.config.ts |
| Deploy | - | - | supabase.ts | connection pooling | Vercel env vars |

---

## Mobile UX

### Current state
The app already has mobile breakpoints (sm: prefix throughout). The Navbar has a hamburger Sheet on mobile. CatalogCard has responsive sizing. The profile/page.tsx avatar circle is 24x24 (w-24 h-24) but centered in a full-page layout — fine on mobile.

Main pain points to address:
- `/profile/page.tsx`: The profile header uses `max-w-2xl mx-auto px-4 py-16` — `py-16` is 64px top padding, can feel generous on short phone screens
- `catalog-client.tsx`: The filter button row (`flex justify-end`) and the search+filter interaction are not obvious on small screens; a sticky bottom action bar (search + filter button) would be more thumb-friendly
- `hero-section.tsx`: Text sizes use CSS variables (`text-heading`, `text-subhead`) — need to verify these scale down correctly; no `sm:`/`md:` breakpoint overrides visible
- Navbar on mobile: ThemeToggle + hamburger in top-right is fine, but there is no persistent bottom navigation — this is a valid UX improvement for a 5-route app

### Modified components

| Component | What changes |
|-----------|-------------|
| `src/components/layout/navbar.tsx` | Add FeedbackButton next to ThemeToggle (see Feedback section). No structural change needed for mobile nav itself — hamburger Sheet already works. |
| `src/components/home/hero-section.tsx` | Verify/tune `text-heading` CSS variable has a sensible mobile size; add `px-4` guard if needed. |
| `src/app/profile/page.tsx` | Reduce `py-16` to `py-8 md:py-16`, tighten avatar size on small screens (`w-16 h-16 md:w-24 md:h-24`). |
| `src/components/catalog/catalog-client.tsx` | Consider pinning search + filter button to bottom on mobile using a `fixed bottom-0` bar, or at minimum ensure the search bar is always visible above the fold. |
| `src/components/catalog/catalog-card.tsx` | Already responsive; minimal changes needed. |

### New components

| Component | Purpose |
|-----------|---------|
| `src/components/layout/bottom-nav.tsx` (optional) | Persistent bottom navigation for mobile (/, /quiz, /catalog, /compare). Insert into `layout.tsx` below `<main>`, visible only on `md:hidden`. This is the one structural new component for mobile UX. |

Bottom nav is optional — the hamburger Sheet works. Build it only if UX testing shows friction. If built, it takes `md:hidden` and renders below `<main>` inside `ThemeProvider` in `layout.tsx`.

### Data flow changes

None. Mobile UX is purely presentational. No new fetches, no new Supabase queries.

---

## SEO

### Current state

Three pages already export `metadata` with `openGraph` blocks: `/`, `/quiz`, `/catalog`. The root `layout.tsx` exports a base `metadata` object with `title` and `description` only.

Missing:
- `/compare/page.tsx` — no metadata export (need to check, likely missing)
- `/profile/page.tsx` — `"use client"` page, cannot export `metadata` (Next.js constraint)
- Root `layout.tsx` — no `metadataBase`, no `openGraph.type`, no `twitter` card, no `canonical`, no structured data (JSON-LD)
- No dynamic OG images via `next/og` (`ImageResponse`) — all pages currently point to a static `/og-image.png`
- `lang="en"` in `layout.tsx` but content is Spanish — should be `lang="es"`

### Modified files

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)`, add `twitter.card: "summary_large_image"`, change `lang="en"` to `lang="es"`, add shared `openGraph` base fields |
| `src/app/compare/page.tsx` | Add `export const metadata: Metadata = { ... }` (currently missing or minimal) |
| `src/app/profile/layout.tsx` | Profile page is `"use client"` — add a `layout.tsx` in `src/app/profile/` that exports `metadata` for the profile route group. (Check if it exists — `src/app/profile/layout.tsx` exists per file tree; read it if needed.) |

Note: `src/app/profile/page.tsx` is `"use client"` which prevents `metadata` export on that file. The existing `src/app/profile/layout.tsx` is the correct place for static profile metadata.

### New files

| File | Purpose |
|------|---------|
| `src/app/api/og/route.tsx` | Dynamic OG image generator using `@vercel/og` (ImageResponse). Accept `?title=` and `?description=` query params. Returns 1200x630 image. Used by page metadata `openGraph.images` as a URL template. |
| `public/og-image.png` | Static fallback OG image (may already exist — referenced in existing metadata but not confirmed in public/). Ensure it exists at 1200x630. |

### Data flow

OG route is a Next.js Route Handler (`app/api/og/route.tsx`). It runs at request time on Vercel Edge, reads query params, renders an `ImageResponse`. Pages pass the URL as:
```
openGraph: { images: [{ url: `/api/og?title=...`, width: 1200, height: 630 }] }
```

No Supabase reads in the OG route — keep it fast. Static text only.

`NEXT_PUBLIC_SITE_URL` env var is required for `metadataBase`. Add to Vercel env vars and `.env.example`.

---

## Feedback Modal

### New component(s)

| Component | Location | Purpose |
|-----------|----------|---------|
| `FeedbackButton` | `src/components/feedback/feedback-button.tsx` | Icon button that opens the modal. Rendered in Navbar. |
| `FeedbackModal` | `src/components/feedback/feedback-modal.tsx` | Modal with textarea + submit. Uses the existing `Sheet` or a custom `<dialog>`. Recommend reusing `Sheet` since it's already imported in the app. |

### Integration point in Navbar

Navbar's right side on desktop:
```
[nav links] [Find My Laptop btn] [FeedbackButton] [ThemeToggle]
```

Navbar's right side on mobile:
```
[FeedbackButton] [ThemeToggle] [hamburger]
```

This slots `FeedbackButton` between the existing CTA/links and `ThemeToggle` in both layouts. The Navbar already conditionally renders `ThemeToggle` in two places (desktop `hidden md:flex` and mobile `md:hidden`). Add `FeedbackButton` alongside `ThemeToggle` in both branches.

### Data storage

**Recommended: Supabase table** (keeps data in your own infra, no third-party).

New table: `feedback`

```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  page text,           -- window.location.pathname at time of submit
  profile_name text,   -- from localStorage if available (optional)
  created_at timestamptz default now()
);

-- Row-level security: allow anonymous inserts, no selects for anon role
alter table feedback enable row level security;
create policy "anon insert" on feedback for insert to anon with check (true);
```

Submit flow: `FeedbackModal` calls a thin `src/lib/feedback.ts` function that calls `supabase.from('feedback').insert(...)`. No auth required. Rate limiting is not needed at v1.1 scale.

**Alternative: Tally.so or Typeform embed** — zero backend work, but loses data ownership and adds a third-party iframe. Skip for v1.1.

### No new API route needed

The Supabase anon key is already exposed client-side (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). The `feedback-modal.tsx` can call Supabase directly from the browser using the existing client from `src/lib/supabase.ts`.

---

## Profile Avatars

### Current state

`ProfileAvatar` (`src/components/quiz/profile-avatar.tsx`) renders a colored circle with a hardcoded "P" initial. There is no image. The `profile_image_url` field exists on the profile object (typed in `Navbar`'s state as `profile_image_url: string | null`) and is fetched from Supabase profiles table, but it is currently unused in `ProfileAvatar`.

Profile page (`src/app/profile/page.tsx`) also renders a hardcoded colored circle with "P" at `w-24 h-24`.

The Supabase project already has a Storage bucket configured (`orxstqqcsxatxaprqyvq.supabase.co` is in `next.config.ts` `remotePatterns`).

### Storage location

**Recommended: `public/avatars/` directory in the repo** (not Supabase Storage).

Rationale: 81 static pixel-art images, one per profile, never change at runtime. Storing them in `public/avatars/` means:
- Zero Supabase Storage reads, no signed URL management
- Images are bundled with the deploy, served from Vercel CDN at no extra cost
- `next/image` can optimize them directly with `src="/avatars/[slug].png"` using a local path (no `remotePatterns` entry needed)
- No upload script needed — commit images once, done

Naming convention: `public/avatars/[profile_slug].png` where `profile_slug` is a URL-safe version of `profile_name` (or a numeric ID matching the profile row). The profiles table likely has a stable slug or ID — use `profile_id` (the Supabase row ID) to avoid slug collision.

Alternative was Supabase Storage — rejected because it adds CDN latency and complicates next.config.ts. Supabase Storage is already configured for laptop images, but avatar images are static and repo-safe.

### Modified components

| Component | Change |
|-----------|--------|
| `src/components/quiz/profile-avatar.tsx` | Accept optional `imageSrc?: string` prop. If `imageSrc` provided, render `<Image>` (next/image) instead of the colored circle. Colored circle is the fallback. |
| `src/app/profile/page.tsx` | Replace the hardcoded `<div>P</div>` with `<ProfileAvatar>` component (unify the avatar rendering). Pass `imageSrc` from profile data. The `ProfileAvatar` is already used in Navbar — reuse it here. |
| `src/components/quiz/profile-sheet.tsx` | Add avatar image at the top of the sheet alongside `profileName`. Currently shows only text header. |
| `src/lib/quiz-data.ts` | `fetchProfile()` returns profile data including `profile_image_url`. Verify this field is selected in the query. If not, add it. The URL would be `/avatars/[id].png` — either hardcode the path construction in the component or store the path in the DB. |

### New components

None. `ProfileAvatar` is extended in place.

### Data flow

Profile image path options:
1. **Derive from profile ID in component** — `<ProfileAvatar imageSrc={/avatars/${profile.id}.png} />`. Simple, no DB change, requires filenames to match profile IDs.
2. **Store path in DB** — `profile_image_url = '/avatars/slug.png'` in the `profiles` table. More flexible, requires a migration + data seed.

Recommendation: option 1 (derive in component). 81 files with names matching UUIDs or sequential IDs. If profile IDs are UUIDs, numeric slug is cleaner — add a stable integer `avatar_id` column (1–81) to profiles table and name files `001.png` through `081.png`. This is a one-time migration.

---

## Deploy

### Required env vars

| Var | Where | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env (all envs) | Already in `.env.example`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env (all envs) | Already in `.env.example`. |
| `NEXT_PUBLIC_SITE_URL` | Vercel env | New for v1.1 SEO. Set to `https://yourdomain.com`. Used in `metadataBase`. |

No server-side Supabase service role key needed — all queries use the anon key from the browser or Next.js server components with the public key. If a server-only Supabase client is added later (e.g., for OG route), add `SUPABASE_SERVICE_ROLE_KEY` as a non-public var.

### Vercel config

| Item | Action |
|------|--------|
| Framework preset | Next.js (auto-detected) |
| Build command | `next build` (default) |
| Output directory | `.next` (default) |
| Node version | 20.x (matches LTS, compatible with Next.js 15) |
| `allowedDevOrigins` in `next.config.ts` | Remove local IPs before deploy — they are dev-only and harmless but noisy |
| Supabase connection pooling | Not needed for v1.1. The app uses the Supabase JS client (REST/PostgREST), not a direct Postgres connection. No pgbouncer/supavisor config required. Connection pooling is only relevant when using Drizzle/Prisma with a raw Postgres connection string. |
| Image optimization | Vercel handles `next/image` optimization automatically. The existing `remotePatterns` in `next.config.ts` already covers Supabase Storage CDN. No changes needed for avatars in `public/`. |
| OG route edge runtime | If `src/app/api/og/route.tsx` uses `@vercel/og`, add `export const runtime = 'edge'` to the route file for faster cold starts. |

No `vercel.json` file needed — all config lives in `next.config.ts` and Vercel dashboard.

---

## Suggested Build Order

Dependencies drive this order. Each phase produces usable, shippable output.

### Phase 1: Deploy foundation (unblocks everything else)

Deploy the current app to Vercel first. This:
- Confirms env vars work in production
- Gives a real URL for `metadataBase` in SEO
- Lets you test mobile UX on real devices immediately

Actions:
1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` in Vercel
2. Remove `allowedDevOrigins` local IPs from `next.config.ts`
3. Push to main, let Vercel build

### Phase 2: SEO (depends on deploy URL)

`metadataBase` requires the production URL. Do this after Phase 1.

1. Update `layout.tsx`: add `metadataBase`, `twitter.card`, change `lang` to `es`
2. Add `metadata` to any missing page files (check `/compare`)
3. Use `src/app/profile/layout.tsx` for profile route metadata
4. Build `src/app/api/og/route.tsx` with `ImageResponse`
5. Update all `openGraph.images` to use `/api/og?title=...`

### Phase 3: Profile avatars (self-contained, no external dependencies)

This is isolated — it only touches `ProfileAvatar`, `profile/page.tsx`, `profile-sheet.tsx`, and optionally the DB.

1. Decide naming convention (UUID match vs. numeric `avatar_id`)
2. If adding `avatar_id` column: write migration, seed 1–81, run against Supabase
3. Create `public/avatars/` directory, add 81 pixel-art PNG files
4. Extend `ProfileAvatar` to accept `imageSrc` prop
5. Update `profile/page.tsx` and `profile-sheet.tsx` to pass `imageSrc`
6. Verify `next/image` renders correctly for local paths (no `remotePatterns` change needed)

### Phase 4: Feedback modal (depends on Supabase access, independent of SEO/avatars)

1. Create `feedback` table in Supabase with RLS policy (SQL migration)
2. Build `src/components/feedback/feedback-button.tsx` and `feedback-modal.tsx`
3. Add `src/lib/feedback.ts` with the insert function
4. Integrate `FeedbackButton` into `Navbar` in both desktop and mobile branches
5. Test anon insert from browser with the anon key

### Phase 5: Mobile UX (polish pass, do last)

Mobile UX changes are purely visual and can be incremental. Do this last so you are polishing the final deployed, SEO'd, avatar-enabled, feedback-ready app.

1. Tune `py-16` → `py-8 md:py-16` in `profile/page.tsx`
2. Verify `text-heading`/`text-subhead` CSS variable values at mobile sizes in `globals.css`
3. Evaluate catalog search/filter bar on real devices; decide if sticky bottom bar is worth building
4. If bottom nav is built, add `BottomNav` to `layout.tsx` below `<main>` with `md:hidden`
5. Final QA pass on all routes at 390px (iPhone 14) and 375px (SE)

---

## Key Decisions Recorded

| Decision | Rationale |
|----------|-----------|
| Avatars in `public/avatars/` not Supabase Storage | Static assets, no runtime uploads, served from Vercel CDN, simpler `next/image` integration |
| Feedback to Supabase table | Data ownership, already-configured client, no third-party dependency |
| FeedbackButton in Navbar (not floating button) | Consistent with existing Navbar pattern (ThemeToggle already lives there); floating buttons conflict with DetailOverlay z-index |
| OG images via `/api/og` route handler | Dynamic titles without managing 5 static OG images; Vercel Edge runs it fast |
| Deploy before SEO | `metadataBase` needs production URL; also unblocks real-device mobile testing |
| No pgbouncer/connection pooling | App uses PostgREST (Supabase JS), not raw Postgres — no pooling config needed |
