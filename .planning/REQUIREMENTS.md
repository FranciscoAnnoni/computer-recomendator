# Requirements: Computer Recomendator v1.1

**Defined:** 2026-04-17
**Core Value:** El recomendador de 81 perfiles que mapea usuarios reales a laptops concretas.

## v1.1 Requirements

### Deploy

- [ ] **DEP-01**: User can access the app at a public Vercel production URL
- [ ] **DEP-02**: App connects to Supabase in production (env vars set in Vercel dashboard)
- [ ] **DEP-03**: No local dev config (`allowedDevOrigins`) leaks into production build

### SEO

- [x] **SEO-01**: All pages render with `lang="es"` (currently hardcoded `"en"`)
- [x] **SEO-02**: `metadataBase` is configured in root layout with production URL
- [x] **SEO-03**: Each page (home, quiz, catalog, compare, profile) has unique Spanish title and description
- [x] **SEO-04**: OG image file exists at `public/og-image.png` and is correctly referenced
- [x] **SEO-05**: `twitter:card` metadata is present on all pages
- [x] **SEO-06**: `robots.txt` exists and is correctly configured
- [x] **SEO-07**: Sitemap is generated and accessible at `/sitemap.xml`

### Feedback

- [ ] **FEED-01**: User can open a feedback modal from a button in the Navbar (next to ThemeToggle)
- [ ] **FEED-02**: User can submit text feedback (and optional star rating) via the modal
- [ ] **FEED-03**: Submitted feedback is stored in a Supabase `feedback` table
- [ ] **FEED-04**: Feedback form includes a honeypot field to block automated bot submissions

### Avatares

- [ ] **AVA-01**: A build script generates 81 unique DiceBear pixel-art SVGs, one per profile, seeded by profile ID
- [ ] **AVA-02**: Generated SVGs are stored as static files at `public/avatars/`
- [ ] **AVA-03**: `ProfileAvatar` component displays the pixel-art avatar instead of the initials placeholder
- [ ] **AVA-04**: Avatars are visible in quiz results, profile sheet, and profile page

### Mobile UX

- [ ] **MOB-01**: All interactive elements (buttons, cards, nav items) have minimum 44px touch targets
- [ ] **MOB-02**: No horizontal overflow on any page at 375px viewport width
- [ ] **MOB-03**: Hero section typography scales correctly on mobile (no oversized text)
- [ ] **MOB-04**: Catalog filter and search controls are thumb-friendly on mobile

## v2 Requirements (deferred)

### SEO avanzado
- **SEO-ADV-01**: Individual laptop routes `/catalog/[slug]` for Google indexing per product
- **SEO-ADV-02**: JSON-LD structured data for laptop product pages

### Feedback avanzado
- **FEED-ADV-01**: Rate limiting (Upstash) for feedback submissions
- **FEED-ADV-02**: Admin view to read and moderate submitted feedback

### Mobile
- **MOB-ADV-01**: Bottom navigation bar for mobile

## Out of Scope

| Feature | Reason |
|---------|--------|
| /catalog/[slug] routes | Significant catalog architecture change — deferred to v1.2 |
| Upstash rate limiting | Adds external service dependency — honeypot sufficient for v1.1 traffic |
| Admin feedback dashboard | No admin user system exists — out of scope |
| Real-time notifications | No realtime requirements in v1.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEP-01 | Phase 7 | Pending |
| DEP-02 | Phase 7 | Pending |
| DEP-03 | Phase 7 | Pending |
| SEO-01 | Phase 8 | Complete |
| SEO-02 | Phase 8 | Complete |
| SEO-03 | Phase 8 | Complete |
| SEO-04 | Phase 8 | Complete |
| SEO-05 | Phase 8 | Complete |
| SEO-06 | Phase 8 | Complete |
| SEO-07 | Phase 8 | Complete |
| FEED-01 | Phase 9 | Pending |
| FEED-02 | Phase 9 | Pending |
| FEED-03 | Phase 9 | Pending |
| FEED-04 | Phase 9 | Pending |
| AVA-01 | Phase 10 | Pending |
| AVA-02 | Phase 10 | Pending |
| AVA-03 | Phase 10 | Pending |
| AVA-04 | Phase 10 | Pending |
| MOB-01 | Phase 11 | Pending |
| MOB-02 | Phase 11 | Pending |
| MOB-03 | Phase 11 | Pending |
| MOB-04 | Phase 11 | Pending |

**Coverage:**
- v1.1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-17 — initial definition*
