# Features Research: v1.1

**Domain:** Mobile-first quiz + laptop catalog for Argentine university students
**Researched:** 2026-04-17
**Stack context:** Next.js 16 (App Router), Tailwind v4, Framer Motion 12, Supabase, next-themes, shadcn/ui components

---

## Mobile UX

### Context from codebase

- Carousel (`option-carousel.tsx`) already has Framer Motion `drag="x"` + `onDragEnd` swipe — swipe is NOT missing.
- Navbar uses a Sheet (slide-in) for mobile menu. No bottom nav exists.
- Catalog cards are `flex-row` with 100px image on mobile, `onClick` whole card for detail overlay.
- No explicit minimum touch target enforcement exists (no `min-h-[44px]` or `min-w-[44px]` patterns found).
- Profile page uses `AnimatePresence` + Framer Motion but no swipe between laptop recommendations.
- `lang="en"` on the root html element — app is in Spanish, this should be `lang="es"`.

### Table Stakes

These are expected by mobile users and their absence causes drop-off:

| Feature | Why Expected | Notes |
|---------|--------------|-------|
| 44px minimum touch targets on all interactive elements | WCAG 2.5.5 / Apple HIG — finger accuracy | Check navbar buttons, filter chips, catalog card CTA |
| Safe-area insets (`pb-safe`, `env(safe-area-inset-*)`) | iPhone notch/home-indicator overlaps fixed elements | Navbar already has `viewportFit: cover` in metadata; CSS must follow |
| No horizontal scroll at any viewport width | Overflow causes jarring scroll on mobile | Audit compare page (side-by-side tables often break) |
| Tap feedback (active states) | Users expect visual confirmation of tap | Tailwind `active:scale-95` or `active:opacity-70` on cards |
| Font size ≥ 16px on inputs | iOS Safari auto-zooms inputs < 16px — breaks layout | Any filter inputs or feedback modal form fields |

### Differentiators

| Feature | Value | Notes |
|---------|-------|-------|
| Bottom navigation bar (mobile only) | Thumb-zone access to Quiz / Catalog / Compare / Profile — critical for one-handed use | Replace hamburger menu on mobile; keep existing Sheet on desktop |
| Swipe between recommended laptops on Profile page | Matches mental model of swiping through options; Framer Motion drag already available as pattern | Profile page shows 5 laptops per profile — horizontal swipe between them |
| Pull-to-refresh on catalog | Native mobile feel | Low priority given Supabase fetch on mount already |

### Complexity: Medium

Bottom nav requires conditional rendering (mobile vs desktop), active route detection, and coordinating with existing Sheet-based mobile menu. Touch target audit is Low complexity. Swipe on Profile is Low — Framer Motion pattern already exists in codebase.

### Dependencies

- Existing Navbar (Sheet component) must be kept for desktop; bottom nav is additive mobile-only layer.
- Profile page laptop cards need refactor to support horizontal swipe container.

---

## SEO

### Context from codebase

- All 4 routes have per-page `export const metadata` with `title`, `description`, `openGraph.images` pointing to `/og-image.png`.
- `/og-image.png` does NOT exist in `public/` — every OG image reference is currently broken.
- Root layout `metadata` has English description; pages have Spanish descriptions — inconsistent.
- `lang="en"` on `<html>` — should be `"es"` for an Argentine-Spanish app.
- No `robots`, `canonical`, `sitemap.xml`, `twitter:card`, or JSON-LD structured data anywhere.
- No `favicon.ico` beyond the default Next.js one; no `apple-touch-icon`.
- Catalog detail is an overlay, not a route — individual laptop pages do not exist and cannot be indexed by crawlers.
- No `next-sitemap` or `sitemap.ts` route.

### Table Stakes

| Feature | Why Required | Implementation |
|---------|--------------|----------------|
| `/og-image.png` (1200×630) created and committed | Every page references it; broken means no OG previews on WhatsApp/Instagram stories/Twitter — primary sharing channels for students | Static PNG in `public/`, or `opengraph-image.tsx` in App Router |
| Fix `lang="es"` on root `<html>` | Affects Google language detection and accessibility tools | One-line change in `layout.tsx` |
| `twitter:card` meta tag | WhatsApp renders OG tags; Twitter/X uses twitter:card — same image, different tag | Add to root metadata: `twitter: { card: "summary_large_image" }` |
| `robots` meta / `robots.txt` | Without explicit rules, crawlers use defaults; explicit allows aggressive indexing | `public/robots.txt`: `User-agent: * / Allow: /` + sitemap link |
| `sitemap.xml` (static) | Helps Google discover all 4 routes | Next.js App Router `app/sitemap.ts` — returns 4 static routes |
| Consistent Spanish metadata across all pages + root layout | Language/content mismatch confuses crawlers | Root layout description should be Spanish |

### Differentiators

| Feature | Value | Notes |
|---------|-------|-------|
| JSON-LD `Product` schema on laptop detail overlay | Google can show rich results (price, availability) for laptop searches — high intent queries | Complex: overlay is client-rendered; requires either converting detail to a route (`/catalog/[slug]`) or injecting JSON-LD dynamically when overlay opens. Overlay approach works but only helps if Googlebot can execute JS. Route approach is safer. |
| `opengraph-image.tsx` (dynamic OG image per page) | Personalized previews when sharing quiz result or specific page | Next.js App Router supports this natively; medium complexity |
| `canonical` tags | Prevents duplicate content if query params are added to catalog filters | `alternates: { canonical: "https://domain.com/catalog" }` in metadata |

### Complexity: Low–Medium

Static SEO fixes (OG image, lang, robots, sitemap, twitter:card) are all Low complexity — config/file changes. JSON-LD for laptops is Medium-High: requires either new dynamic routes or accepting that crawler coverage of laptop data is partial.

### Dependencies

- OG image must exist before any other SEO work is meaningful (it's referenced by all pages already).
- If JSON-LD on products is desired, a routing decision is needed: keep overlay-only or add `/catalog/[slug]` routes. This is a **scope decision**, not just an implementation detail.

---

## Feedback Modal

### Context from codebase

- No feedback modal or button exists anywhere in the codebase yet.
- `ThemeToggle` component exists in `src/components/ui/theme-toggle.tsx` — the button should sit adjacent to it in Navbar per PROJECT.md.
- No backend endpoint for feedback — Supabase is available; a `feedback` table is the natural destination.
- The app has no user accounts — all feedback is anonymous.

### Table Stakes

The minimum viable feedback form that yields actionable data:

| Element | Rationale |
|---------|-----------|
| Star rating (1–5) or thumbs up/down | Single-click signal; measures overall satisfaction; easy to analyze in aggregate |
| Optional free-text comment (textarea, max 300 chars) | Captures what rating alone cannot; "optional" preserves completion rate |
| Page context captured automatically | Know whether feedback came from Quiz, Catalog, or Profile — without asking the user |
| Submit + close button | Clear affordance |
| Toast confirmation on submit | User needs to know it worked |

What NOT to include in MVP:
- Email field — students won't provide it; adds friction
- Category selector ("Bug / Feature / Other") — adds friction; free text covers this
- Screenshot attachment — engineering overhead far exceeds value at this stage

### Recommended Fields

```
Table: feedback
  id          uuid (default gen_random_uuid())
  rating      smallint (1–5, nullable — user may skip)
  comment     text (nullable, max 300 chars)
  page        text (e.g., "quiz", "catalog", "profile", "home")
  profile_id  text (nullable — from localStorage if available)
  created_at  timestamptz (default now())
  user_agent  text (nullable — helps identify mobile vs desktop)
```

### When to Trigger

- **Manual only (MVP):** Button in Navbar next to ThemeToggle — always available, never intrusive.
- **Defer:** Time-delayed trigger (e.g., after quiz completion) — adds complexity and can feel spammy. Do in v1.2 if engagement data justifies it.

### Display Button Location

Navbar, right side, between existing nav links and ThemeToggle. Use a `MessageSquare` or `Star` icon from lucide-react (already a dependency). Keep same visual weight as ThemeToggle.

### Differentiators

| Feature | Value | Notes |
|---------|-------|-------|
| Auto-trigger after quiz completion (one-time) | Captures satisfaction at peak engagement moment | Use localStorage flag `feedback_shown` to show once; complexity Low |
| NPS score (0–10) instead of star rating | More granular loyalty signal; maps to Promoter/Passive/Detractor | Overkill for 81-profile app at MVP stage |

### Complexity: Low

Modal UI (shadcn Dialog or Base UI Dialog — already in stack), one Supabase insert, one localStorage read for page context. No auth required. Estimated: 1 component + 1 DB migration.

### Dependencies

- Supabase `feedback` table (migration needed).
- Navbar layout — button placement must not break existing mobile layout, especially if bottom nav is added simultaneously.

---

## Profile Avatars

### Context from codebase

- `ProfileAvatar` component (`src/components/quiz/profile-avatar.tsx`) currently renders a colored circle with letter "P" — no image, no pixel art.
- The component accepts `color` (from `getProfileColor`) and `profileName` as props.
- Avatar is displayed in: Navbar (post-quiz, 32×32px circle), ProfileSheet (slide-in panel), and presumably the Profile page.
- 81 profiles exist in Supabase with `profile_image_url` column — currently `null` for all.
- Illustrations already exist in `public/illustrations/` as PNG files for quiz options (abierto, apple, crear, etc.) — these are ~category icons, not profile avatars.

### Table Stakes

| Requirement | Rationale |
|-------------|-----------|
| One unique image per profile (81 total) | Core feature requirement — "P in a circle" is a placeholder |
| Consistent art style across all 81 | Visual coherence — mixing styles breaks trust in the brand |
| Transparent PNG or WebP with transparent background | Must work on both light and dark themes without a white square border |
| Minimum 64×64px source; displayed at 32×32px in navbar | 2× for retina; larger for profile page hero |
| Stored in Supabase storage or `public/` and referenced via `profile_image_url` | Schema already has the column |

### Style Recommendations

**Pixel art is the right choice for this project** — it is:
- Fast to generate consistently at scale (AI tools like Stable Diffusion pixel art LoRA, or Aseprite + templates)
- Instantly recognizable as a distinct style, not "failed realism"
- Low file size at small display sizes
- Easy to maintain visual consistency (same palette, same grid size)

**Specific rules for consistency across 81 avatars:**

| Rule | Value |
|------|-------|
| Canvas size | 32×32 px (native pixel art size; scale up for display with `image-rendering: pixelated`) |
| Color palette | Limited to 16–24 colors maximum, shared across all avatars |
| Character framing | Bust/head shot, centered, same proportions |
| Background | Transparent |
| Export format | PNG (lossless; pixel art + WebP compression introduces artifacts) |
| Naming convention | `avatar-[profile-slug].png` (e.g., `avatar-programador-gamer.png`) |
| Theme awareness | Single image works on dark + light if background is transparent; avoid colors that disappear on white or black backgrounds |

**Profile categories to cover (sample mapping):**
- Academic: diseño, programación, medicina, derecho, arquitectura, comunicación, etc.
- Lifestyle: nómade, gamer, creativo, minimalista, premium
- Budget: esencial, equilibrado, sin-limite
Each avatar should visually reference the profile's essence (a design student with tablet, a gamer with headset, etc.)

### Display Locations

| Location | Size | Component |
|----------|------|-----------|
| Navbar (post-quiz) | 32×32px circle | `ProfileAvatar` — already exists, needs `<Image>` swap |
| ProfileSheet (slide-in) | 48×48px | `ProfileSheet` component |
| Profile page hero | 64–80px | Profile page, above profile name |
| Quiz result celebration screen | 56×56px | `quiz-celebration.tsx` |

### Complexity: Medium–High

81 unique images is the constraint. Implementation of the component swap (replacing letter "P" with `<next/image>`) is Low complexity. Asset creation is the bottleneck — this is a design/generation task, not an engineering task. Plan should treat asset creation as a separate work item from component wiring.

**Recommended approach:** Generate in batches of 10–15 using a pixel art AI tool or Aseprite template, review for palette consistency, then upload to Supabase Storage and run a bulk `UPDATE profiles SET profile_image_url = ...`.

### Dependencies

- Supabase `profiles.profile_image_url` column already exists.
- `ProfileAvatar` component needs to accept an `imageUrl` prop and render `<Image>` from `next/image` (domain already configured for Supabase CDN in `next.config.ts`).
- All 81 `profile_image_url` values in DB need to be populated before the component swap is visually complete.

---

## Deploy

### Context from codebase

- `package.json` has `"start": "next start"` — standard Vercel-compatible.
- `next.config.ts` has `allowedDevOrigins` — these are local network IPs and should not affect production but are irrelevant/harmless on Vercel.
- No `.env.example` found; Supabase keys are presumably in `.env.local`.
- No `NEXT_PUBLIC_SITE_URL` or production URL configured — needed for OG image absolute URLs.
- No `/og-image.png` — deploy will succeed but OG previews will be broken.

### Table Stakes

| Task | Why Required | Notes |
|------|--------------|-------|
| Supabase env vars set in Vercel dashboard | App won't connect to DB without them | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` minimum |
| `NEXT_PUBLIC_SITE_URL` set to production domain | Required for OG image absolute URLs in metadata and any canonical tag generation | Without this, OG `images` array URLs are relative — invalid per OG spec |
| `/og-image.png` exists in `public/` before deploy | Referenced in all 4 pages; broken on deploy if missing | Create/commit before first deploy |
| Verify `next build` passes locally before push | Catches type errors and missing env vars at build time | Run `npm run build` with production-like env |
| Vercel project connected to GitHub repo main branch | Auto-deploy on push | Standard Vercel setup |

### What is NOT needed for MVP deploy

- Custom domain (Vercel `.vercel.app` subdomain is fine for v1.1)
- Edge functions / ISR (current pages are static or client-rendered)
- CDN config (Vercel handles this)
- Database migrations (Supabase schema is already deployed)

### Complexity: Low

Vercel deploy for a Next.js App Router app with Supabase is standard. Total effort: set env vars, push to main. The only blockers are the missing OG image and ensuring env vars are documented so they can be set correctly.

### Dependencies

- OG image must be created before deploy for non-broken social previews.
- `.env.example` or internal documentation of required env vars should exist to avoid forgetting keys.
- All 81 avatar images in Supabase Storage (if avatars are done before deploy).

---

## Cross-Feature Dependencies Summary

```
OG image creation
  → SEO (all pages reference it)
  → Deploy (broken previews without it)

Bottom nav (Mobile UX)
  → Feedback modal button placement (must coexist in Navbar or move to bottom nav)

Profile avatars (asset creation)
  → Component wiring in ProfileAvatar
  → Supabase bulk UPDATE for profile_image_url

Supabase feedback table (migration)
  → Feedback modal (can't submit without table)
```

## Feature Complexity Summary

| Feature | Complexity | Primary Bottleneck |
|---------|------------|-------------------|
| Mobile UX — touch targets + safe area | Low | CSS audit across components |
| Mobile UX — bottom nav | Medium | Conditional rendering, route detection, Navbar coordination |
| Mobile UX — profile swipe | Low | Framer Motion pattern already in codebase |
| SEO — static fixes (OG image, lang, robots, sitemap) | Low | File creation + config |
| SEO — JSON-LD for laptops | Medium-High | Routing decision required first |
| Feedback modal | Low | UI + 1 Supabase table |
| Profile avatars — component wiring | Low | Image component swap |
| Profile avatars — asset creation (81 images) | High (design) | Volume of unique assets |
| Deploy | Low | Env vars + OG image |
