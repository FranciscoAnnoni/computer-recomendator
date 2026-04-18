# Roadmap: Computer Recomendator

## Milestone v1.0 (Phases 1–6) — Complete

## Phase 1: Foundation & Project Setup
- [x] Initialize Next.js project with Tailwind CSS.
- [x] Set up design tokens (colors, typography for Apple-style aesthetic).
- [x] Configure basic layout components (Navbar, Footer, Container).
- [x] Define the data structure for laptops (JSON or initial DB schema).

**Requirements:** [RNF1.1, RNF1.2, RNF3.1, RF2.2, RNF2.1]
**Plans:** 3/3 plans complete

## Phase 2: Core Discovery Quiz

**Goal:** Working 3-step carousel quiz at /quiz that maps user answers to one of 27 Supabase profiles, displays 5 recommended laptops, and persists the quiz profile in the Navbar.

**Requirements:** [RF1.1, RF1.2, RF1.3, RNF1.1, RNF1.2, RNF1.3, RNF2.2, RNF3.1]
**Plans:** 5/5 plans complete

## Phase 3: Product Catalog & Detail View

**Goal:** Full /catalog page with search, filters, single-column card list, full-screen detail overlay with specs and influencer notes, quiz profile integration, and "Comprar Ahora" affiliate links.

**Requirements:** [RF2.1, RF2.2, RF2.3, RF4.1, RF4.2, RNF1.1, RNF1.2, RNF1.3, RNF2.1, RNF2.2]
**Plans:** 3/3 plans complete

## Phase 4: Comparison Tool

**Goal:** Self-contained /compare page with slot-based laptop selection (2 on mobile, up to 3 on desktop), picker Sheet with search, bracket-style spec rows, and framer-motion transitions.

**Requirements:** [RF3.1, RF3.2]
**Plans:** 2/2 plans complete

## Phase 5: Polish & Deployment

**Goal:** Polish the existing app with targeted animations, next/image migration for mobile performance, SEO metadata on all pages, and responsive validation across breakpoints.

**Requirements:** [D-01 through D-17]
**Plans:** 3/4 plans executed

## Phase 6: Iterative Improvements

**Goal:** Populate the database with real Argentine market laptop data, assign 5 laptops to each of the 81 quiz profiles, and create an affiliate program guide.

**Plans:** 3/3 plans complete

---

## Milestone v1.1 — Launch-Ready Polish

### Phases

- [ ] **Phase 7: Deploy** — Ship the app to a public Vercel production URL with production Supabase credentials
- [x] **Phase 8: SEO** — Full Spanish SEO coverage across all pages with OG image, sitemap, and robots.txt (completed 2026-04-18)
- [ ] **Phase 9: Feedback Modal** — Users can submit feedback directly from the Navbar
- [ ] **Phase 10: Profile Avatars** — Each of the 81 quiz profiles displays a unique pixel-art avatar
- [ ] **Phase 11: Mobile UX** — All pages are fully usable on a 375px mobile viewport

---

## Phase Details

### Phase 7: Deploy
**Goal:** The app is publicly accessible at a production Vercel URL with full Supabase connectivity and a clean production config.
**Requirements:** DEP-01, DEP-02, DEP-03
**UI hint:** no
**Dependencies:** none

**Success Criteria:**
1. Any user can visit the public URL and see the fully functional app without any authentication or local setup.
2. Quiz results load real data from the Supabase production database (not a local or preview environment).
3. The production build contains no `allowedDevOrigins` or other dev-only config that could expose security warnings.

**Plans:** 1 plan
- [ ] 07-01-PLAN.md — Refactor next.config.ts to phase function, deploy to Vercel with Supabase env vars, smoke-test production

---

### Phase 8: SEO
**Goal:** All pages are discoverable by Spanish-language search engines with correct metadata, Open Graph tags, a sitemap, and a robots.txt.
**Requirements:** SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07
**UI hint:** no
**Dependencies:** Phase 7

**Success Criteria:**
1. Pasting any page URL into a social platform (Twitter, WhatsApp) renders a Spanish title, description, and OG preview image.
2. Visiting `/sitemap.xml` returns a valid XML sitemap listing all public routes.
3. A browser language inspection of any page shows `<html lang="es">`.
4. Visiting `/robots.txt` returns a valid file that allows crawling of all public pages.

**Plans:** 2/2 plans complete
- [x] 08-01-PLAN.md — Root layout lang="es", metadataBase, viewport export, and twitter cards on all 5 pages
- [x] 08-02-PLAN.md — Sitemap, robots.txt, and public/og-image.png asset

---

### Phase 9: Feedback Modal
**Goal:** Users can submit text feedback (with optional star rating) from any page via a Navbar button, and submissions are persisted in Supabase with basic bot protection.
**Requirements:** FEED-01, FEED-02, FEED-03, FEED-04
**UI hint:** yes
**Dependencies:** Phase 7

**Success Criteria:**
1. A feedback button is visible in the Navbar on every page, next to the theme toggle.
2. Clicking the button opens a modal where the user can type feedback and optionally select a star rating, then submit.
3. After submission, the feedback entry appears in the Supabase `feedback` table with the submitted text and rating.
4. Automated bot form submissions are silently rejected without storing data.

**Plans:** 2 plans
- [ ] 09-01-PLAN.md — FeedbackDialog component with form, honeypot, localStorage limit, Supabase insert, success/error states
- [ ] 09-02-PLAN.md — Wire FeedbackButton into Navbar desktop and mobile sections

---

### Phase 10: Profile Avatars
**Goal:** Each of the 81 quiz profiles has a unique pixel-art avatar that replaces the initials placeholder everywhere a profile is displayed.
**Requirements:** AVA-01, AVA-02, AVA-03, AVA-04
**UI hint:** yes
**Dependencies:** none

**Success Criteria:**
1. Running the build script produces 81 distinct SVG files under `public/avatars/`, each visually different from the others.
2. After completing the quiz, the profile result shows a pixel-art avatar instead of initials.
3. Opening the profile sheet from the Navbar displays the pixel-art avatar for the active profile.
4. Visiting a profile page shows the pixel-art avatar in the profile header.
**Plans:** TBD

---

### Phase 11: Mobile UX
**Goal:** Every page of the app is comfortable to use on a 375px mobile viewport, with no overflow, appropriately sized touch targets, and readable typography.
**Requirements:** MOB-01, MOB-02, MOB-03, MOB-04
**UI hint:** yes
**Dependencies:** Phase 9, Phase 10

**Success Criteria:**
1. On a 375px viewport, no page requires horizontal scrolling and no content is clipped off-screen.
2. All buttons, cards, and navigation items can be tapped accurately with a thumb (minimum 44px touch target).
3. The hero section headline on mobile reads at a comfortable size without overflowing its container.
4. The catalog search input and filter controls are easy to operate one-handed on a phone.
**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. Deploy | 0/1 | Planned | - |
| 8. SEO | 2/2 | Complete   | 2026-04-18 |
| 9. Feedback Modal | 0/2 | Planned | - |
| 10. Profile Avatars | 0/? | Not started | - |
| 11. Mobile UX | 0/? | Not started | - |
