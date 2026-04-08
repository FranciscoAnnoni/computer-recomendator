# Phase 6: Iterative Improvements - Research

**Researched:** 2026-04-05
**Domain:** Affiliate link integration, Supabase data seeding, profile-to-laptop mapping
**Confidence:** MEDIUM (affiliate URL format unverifiable without account; laptop data from verified search sources; schema from codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Affiliate program setup: step-by-step guide + implementation for MercadoLibre and Amazon affiliate links
- Each laptop's "Comprar Ahora" button must use affiliate-tagged URLs
- Affiliate links stored in the database (schema decision below) OR generated dynamically
- Populate `laptops` table with real products from Amazon and MercadoLibre Argentina
- Each laptop must have all required fields: name, brand, price, specs (RAM, storage, processor, GPU), usage_profiles, image_url, etc.
- Minimum viable: enough laptops so every usage profile has at least 5 each
- Format: SQL INSERT statements or JSON seed file for reproducibility
- Each usage profile from the quiz must have exactly 5 laptops assigned via `usage_profiles TEXT[]` column
- Assignment stored via existing `usage_profiles TEXT[]` column (GIN index already in place)

### Claude's Discretion
- Exact affiliate tag parameter names and URL format (will vary by platform)
- Whether to add new columns to the laptops table for affiliate URLs or derive them dynamically
- Order/priority of which laptops to source first

### Deferred Ideas (OUT OF SCOPE)
- Automated scraping / price sync (real-time pricing updates)
- UI redesign or new pages (UI is considered done)
</user_constraints>

---

## Summary

This phase has three independently executable tracks. The affiliate work requires the user to manually register on both platforms before any code can be written — it has a human gate. The database seeding track is fully doable with code: write SQL INSERTs with real Argentine market laptop data. The profile assignment track also requires no external dependencies — it's a SQL UPDATE of `laptop_ids uuid[]` on the `profiles` table once the laptops are inserted.

**Critical architectural finding:** The quiz flow uses `profiles.laptop_ids uuid[]` (not `laptops.usage_profiles TEXT[]`) to resolve which laptops a user sees after the quiz. The `usage_profiles TEXT[]` column on `laptops` is used by the catalog page for filter/display grouping, not by the quiz recommendation engine. Both columns need to be populated correctly. Five laptops per profile means 5 IDs in `profiles.laptop_ids`.

**Primary recommendation:** Execute tracks in order — (1) insert laptops with full specs and `usage_profiles`, (2) update `profiles.laptop_ids` to reference those laptops, (3) wire affiliate links once the user has registered.

---

## Codebase State (verified from src/)

### affiliate_link field

The `Laptop` TypeScript interface (src/types/laptop.ts) has a single `affiliate_link: string` field. The `detail-overlay.tsx` renders it directly:

```tsx
// src/components/catalog/detail-overlay.tsx line 184
href={laptop.affiliate_link}
// renders as: <a href={laptop.affiliate_link} target="_blank" rel="noopener noreferrer">Comprar Ahora</a>
```

The database `schema.sql` has `affiliate_link TEXT DEFAULT ''`. There are no `affiliate_url_ml` / `affiliate_url_amazon` columns yet.

**Decision for planner:** Whether to keep one `affiliate_link` field (pointing to whichever platform the laptop is from) or add two columns (`affiliate_url_ml`, `affiliate_url_amazon`) is Claude's discretion. One field is simpler and sufficient for MVP — most laptops will be primarily on one platform.

### profiles.laptop_ids (quiz engine)

The `profiles` table has `laptop_ids uuid[]`. After the quiz, `fetchProfile()` returns the profile, then `fetchLaptopsByIds(profileResult.laptop_ids)` fetches those specific laptops. This is the direct path from quiz result to recommended laptops — it bypasses `laptops.usage_profiles`. Currently all 81 profiles have `laptop_ids = '{}'` (empty, from seed-profiles-81.sql).

### laptops.usage_profiles (catalog filter)

Used in `CatalogClient` to filter and display the "Recomendadas para vos" section when a user has a quiz profile. Also drives brand/OS/storage filter chips. Must be populated so the catalog shows relevant laptops when filtered.

### Profiles in the system

Quiz step 0 maps to `workload`: `productividad_estudio | creacion_desarrollo | gaming_rendimiento`
Quiz step 1 maps to `lifestyle`: `maxima_portabilidad | movil_flexible | escritorio_fijo`
Quiz step 2 maps to `budget`: `esencial | equilibrado | premium`
Quiz step 3 maps to `os_preference`: `windows | macos | abierto`

81 total profiles. The `UsageProfile` union in `laptop.ts` includes legacy values plus the three workload values. For catalog filtering, the workload values are most meaningful.

---

## Track 1: Affiliate Program Setup

### MercadoLibre Argentina Affiliate Program

**Registration (confidence: MEDIUM — verified from official program page and multiple sources):**

1. Go to `https://www.mercadolibre.com.ar/l/afiliados`
2. Must have an active MercadoLibre account + Mercado Pago account
3. Must be 18+
4. Fill out registration form including social media/content channel info
5. Receive confirmation email and activate account

**Link generation mechanism (confidence: LOW — no public technical docs found):**

MercadoLibre generates affiliate links through their in-platform dashboard or mobile app. A "blue bar" appears when browsing products as an affiliate, similar to Amazon's SiteStripe. The link directs to the product page. The affiliate receives 2-4% commission on computers/electronics category.

Key point: the exact URL parameter format is not publicly documented. The planner must treat this as a manual step — the user navigates to each product, generates the link from the dashboard, copies the URL. There is no public API for programmatic link generation documented in any accessible source.

**Commission rates (confidence: MEDIUM — from multiple sources):**
- Computers, electronics: 2–4%
- Payment credited to Mercado Pago 60 days after delivery

**What the developer must do:**
- After user registers, they manually generate an affiliate link for each product listing used in the app
- Store the generated URL in `laptops.affiliate_link`
- No code changes needed to the frontend — the field already renders as the CTA link

### Amazon Associates (for Argentina)

**Key finding (confidence: HIGH — official Amazon Associates page verified):**

Amazon does not operate `amazon.com.ar` as a local marketplace. Argentine users purchase from `amazon.com` (US) with international shipping. There is no Amazon Argentina-specific affiliate program.

Argentinians can register for Amazon Associates via `affiliate-program.amazon.com` (US program) or `afiliados.amazon.es` (Spain program). Both work; the US program covers the widest product range.

**Affiliate link format (confidence: HIGH — official docs verified):**
```
https://www.amazon.com/dp/{ASIN}/?tag={associate-id}
```
Example: `https://www.amazon.com/dp/B0BN9L5FKK/?tag=mysite-20`

SiteStripe is a browser toolbar that appears on Amazon product pages once registered. It generates the tagged URL automatically. The `tag=` parameter (your Associate Store ID + `-20` suffix) is the tracking token.

**Commission for electronics/laptops:** ~4–5% (MEDIUM confidence — from search results, not verified against current official rate card)

**Registration process:**
1. Go to `https://affiliate-program.amazon.com/`
2. Sign in or create Amazon account
3. Complete Associate profile (website URL, content type, expected traffic)
4. Begin generating links via SiteStripe immediately (full approval comes after first 3 qualifying sales within 180 days)

**What the developer must do:**
- After user registers and gets Associate tag, browse each laptop on amazon.com
- Use SiteStripe to generate the tagged link: `https://www.amazon.com/dp/{ASIN}/?tag={your-tag}`
- Store in `laptops.affiliate_link`

### Affiliate Implementation in Code

**No frontend changes required.** `detail-overlay.tsx` already renders:
```tsx
<a href={laptop.affiliate_link} target="_blank" rel="noopener noreferrer">
  Comprar Ahora
</a>
```

The only code work is populating `affiliate_link` in the database with the registered affiliate URLs. If two-platform support is desired (ML + Amazon), add a migration to add `affiliate_url_amazon TEXT` and update the `Laptop` type — but this is Claude's discretion.

---

## Track 2: Database Population

### Current State

The `laptops` table exists with full schema. Current row count: unknown (likely 0 or a small test set — no seed.sql exists in `supabase/`). The Supabase seeding convention (from official docs) is `supabase/seed.sql`.

### Complete Schema (all columns to populate)

From `schema.sql` + migrations 03 and 04:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| name | TEXT | YES | Full product name |
| brand | TEXT | YES | e.g., "Lenovo", "Asus" |
| price | NUMERIC(10,2) | YES | In ARS (Argentine pesos) |
| cpu | TEXT | YES | e.g., "AMD Ryzen 5 7520U" |
| ram | TEXT | YES | e.g., "16GB DDR5" |
| gpu | TEXT | YES | e.g., "AMD Radeon 610M" or "NVIDIA RTX 4060" |
| storage | TEXT | YES | e.g., "512GB SSD NVMe" |
| simplified_tags | TEXT[] | YES | 3-5 Spanish tags: "Muy Rápida", "Liviana", etc. |
| usage_profiles | TEXT[] | YES | Array of workload values |
| influencer_note | TEXT | NO (nullable) | Recommendation note in Spanish |
| recommendation_score | INTEGER | NO (nullable) | 1-10 |
| affiliate_link | TEXT | YES (DEFAULT '') | Set after affiliate registration |
| image_url | TEXT | YES | Product image URL from ML or Amazon listing |
| gallery_images | TEXT[] | NO | Up to 4 extra images |
| description | TEXT | NO | Product description paragraph in Spanish |
| os | TEXT | NO | "Windows 11", "macOS Sequoia" |
| screen_size | TEXT | NO | e.g., '15.6"' |
| weight | TEXT | NO | e.g., "1.8 kg" |
| battery | TEXT | NO | e.g., "Up to 8h" |

### Target Laptop Count

To cover all profiles: the quiz has 3 workloads × 3 lifestyles × 3 budgets × 3 OS = 81 profiles. However, profiles are not served by `usage_profiles` on laptops — they use `laptop_ids uuid[]`. For the catalog filter, `usage_profiles` needs the 3 workload values.

Minimum viable: 15–25 laptops covering all 3 workload segments, across 3 budget tiers, across Windows/macOS, so any profile can find 5 assigned laptops.

### Argentine Market Laptop Reference Data

Source: Web search results from MercadoLibre Argentina listings and review sites (MEDIUM confidence — prices approximate as of early 2026, ARS fluctuates).

**Segment: productividad_estudio (work/study)**

| Model | CPU | RAM | Storage | GPU | Screen | Weight | Approx ARS |
|-------|-----|-----|---------|-----|--------|--------|------------|
| Lenovo IdeaPad 1 15IGL7 | Intel Celeron N4500 | 8GB | 256GB eMMC | Intel UHD | 15.6" | 1.7kg | ~180,000 |
| Lenovo IdeaPad 15AMN8 | AMD Ryzen 5 7520U | 16GB DDR5 | 512GB SSD | AMD Radeon 610M | 15.6" FHD | 1.6kg | ~280,000 |
| Acer Aspire A315-42 | AMD Ryzen 7 7730U | 16GB | 512GB SSD | AMD Radeon | 15.6" FHD | 1.9kg | ~350,000 |
| HP Pavilion 15 | Intel Core i5-1235U | 8GB | 512GB SSD | Intel Iris Xe | 15.6" FHD | 1.75kg | ~320,000 |
| MacBook Air M2 (13") | Apple M2 | 8GB Unified | 256GB SSD | 8-core GPU | 13.6" | 1.24kg | ~850,000 |
| MacBook Air M3 (15") | Apple M3 | 8GB Unified | 256GB SSD | 10-core GPU | 15.3" | 1.51kg | ~1,100,000 |

**Segment: creacion_desarrollo (design/dev/video)**

| Model | CPU | RAM | Storage | GPU | Screen | Weight | Approx ARS |
|-------|-----|-----|---------|-----|--------|--------|------------|
| MacBook Pro M3 (14") | Apple M3 Pro | 18GB Unified | 512GB SSD | 18-core GPU | 14.2" | 1.61kg | ~1,900,000 |
| Asus VivoBook Pro 16 OLED | AMD Ryzen 9 7945HX | 16GB | 512GB SSD | NVIDIA RTX 4060 | 16" OLED | 1.9kg | ~950,000 |
| Lenovo Yoga Pro 7i | Intel Core Ultra 5 | 16GB LPDDR5 | 512GB SSD | Intel Arc | 14" | 1.4kg | ~680,000 |
| HP Envy x360 15 | AMD Ryzen 7 8840U | 16GB | 512GB SSD | AMD Radeon 780M | 15.6" OLED | 1.9kg | ~760,000 |
| Dell XPS 15 (9530) | Intel Core i7-13700H | 16GB | 512GB SSD | NVIDIA RTX 4060 | 15.6" OLED | 1.86kg | ~1,400,000 |

**Segment: gaming_rendimiento (gaming)**

| Model | CPU | RAM | Storage | GPU | Screen | Weight | Approx ARS |
|-------|-----|-----|---------|-----|--------|--------|------------|
| Acer Nitro 5 AN515 | AMD Ryzen 5 7535HS | 16GB DDR5 | 512GB SSD | NVIDIA RTX 4050 | 15.6" FHD 144Hz | 2.5kg | ~650,000 |
| Lenovo IdeaPad Gaming 3 Gen 7 | AMD Ryzen 5 6600H | 16GB DDR5 | 512GB SSD | NVIDIA RTX 3050 | 15.6" FHD 120Hz | 2.2kg | ~500,000 |
| Asus TUF Gaming A15 (2024) | AMD Ryzen 7 7745HX | 16GB | 512GB SSD | NVIDIA RTX 4060 | 15.6" FHD 144Hz | 2.2kg | ~850,000 |
| HP Victus 16 | Intel Core i7-12650H | 16GB DDR4 | 512GB SSD | NVIDIA RTX 3050 Ti | 16.1" FHD 144Hz | 2.37kg | ~550,000 |
| Asus ROG Strix G15 | AMD Ryzen 9 6900HX | 32GB DDR5 | 1TB SSD | NVIDIA RTX 3070 Ti | 15.6" QHD 240Hz | 2.3kg | ~1,200,000 |
| Lenovo Legion 5 Pro | AMD Ryzen 7 7745HX | 16GB DDR5 | 512GB SSD | NVIDIA RTX 4070 | 16" WQXGA 165Hz | 2.49kg | ~1,450,000 |

**Note:** All ARS prices are approximate as of early 2026. Argentina's inflation means prices change frequently. The planner should note that actual prices must be taken from current listings at time of data entry.

### Seeding Approach

**Recommended: `supabase/seed.sql`**

Use `supabase/seed.sql` (Supabase convention). Run via Supabase CLI (`supabase db reset`) or paste into the Supabase SQL Editor.

Pattern:
```sql
-- supabase/seed.sql
-- Phase 6: Laptop catalog seed data
-- Source: MercadoLibre Argentina / Amazon.com listings, April 2026

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES
(
  'Lenovo IdeaPad 15AMN8',
  'Lenovo',
  280000,
  'AMD Ryzen 5 7520U',
  '16GB DDR5',
  'AMD Radeon 610M',
  '512GB SSD NVMe',
  'Windows 11',
  '15.6"',
  '1.6 kg',
  'Up to 8h',
  ARRAY['Rendimiento balanceado', 'Buena batería', 'Ideal para estudio'],
  ARRAY['productividad_estudio'],
  'La mejor opción relación calidad-precio para estudiantes universitarios.',
  8,
  '', -- populate after affiliate registration
  'https://...', -- ML or Amazon image URL
  'Notebook ideal para estudiantes que necesitan potencia sin gastar de más.'
),
-- ... more rows
;
```

Then update `profiles.laptop_ids` after laptops are inserted:
```sql
-- After INSERT, get IDs and update profiles
UPDATE profiles
SET laptop_ids = ARRAY(
  SELECT id FROM laptops
  WHERE 'productividad_estudio' = ANY(usage_profiles)
    AND price < 350000
  LIMIT 5
)
WHERE workload = 'productividad_estudio'
  AND budget = 'esencial';
```

---

## Track 3: Profile-to-Laptop Assignment

### Architecture Clarification

The quiz recommendation engine works via `profiles.laptop_ids uuid[]`, NOT via `laptops.usage_profiles`. When a user completes the quiz:

1. `fetchProfile(workload, lifestyle, budget, os_preference)` → returns a `ProfileResult` with `laptop_ids`
2. `fetchLaptopsByIds(profileResult.laptop_ids)` → fetches those exact laptops by ID

Therefore, to make the quiz show 5 recommended laptops per profile, you must:
1. Insert laptops into the `laptops` table
2. Update each profile row's `laptop_ids` array with exactly 5 laptop UUIDs

The `laptops.usage_profiles` column is separate — it drives the catalog page's "Recomendadas para vos" section and filter chips. Both must be populated.

### Profile Count vs Laptop Count

81 profiles exist. Laptops can be shared across profiles (same laptop, multiple profiles use it). With ~20–25 laptops, you can meaningfully cover all 81 profiles by selecting the most contextually appropriate 5 per profile based on:
- Budget tier (esencial → low price, premium → high price)
- OS preference (windows/macos/abierto)
- Workload (productividad_estudio / creacion_desarrollo / gaming_rendimiento)

The lifestyle dimension (portabilidad / movil_flexible / escritorio_fijo) is a secondary filter that can influence weight/battery choices but doesn't require entirely different laptops.

### Assignment SQL Pattern

```sql
-- Example: assign laptops to a specific profile after laptops are seeded
-- First get laptop IDs using a subquery, then update profiles

WITH laptop_selection AS (
  SELECT id FROM laptops
  WHERE 'gaming_rendimiento' = ANY(usage_profiles)
    AND os NOT ILIKE '%mac%'
    AND price < 700000
  ORDER BY recommendation_score DESC NULLS LAST
  LIMIT 5
)
UPDATE profiles
SET laptop_ids = ARRAY(SELECT id FROM laptop_selection)
WHERE workload = 'gaming_rendimiento'
  AND os_preference = 'windows'
  AND budget = 'esencial';
```

This pattern can be templated for all 81 profiles, grouped by the criteria that matter most (workload + budget + os_preference). Lifestyle affects which laptops are most appropriate but since the laptop set is small, the same laptops can serve multiple lifestyle variants.

### Verification Query

```sql
-- Verify all profiles have exactly 5 laptops assigned
SELECT
  workload, lifestyle, budget, os_preference,
  array_length(laptop_ids, 1) AS laptop_count,
  CASE WHEN array_length(laptop_ids, 1) = 5 THEN 'OK' ELSE 'NEEDS FIX' END AS status
FROM profiles
ORDER BY status DESC, workload, lifestyle, budget;
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Affiliate link generation | Custom URL builder | Use the MercadoLibre dashboard or Amazon SiteStripe toolbar — both have built-in link generators |
| Data import | Custom CSV parser | Supabase SQL Editor paste or `supabase/seed.sql` file |
| Image hosting | Upload to S3/CDN | Use direct URLs from MercadoLibre product listings (already used for current test data) |
| Profile-laptop mapping logic | App-layer matching algorithm | SQL UPDATE with subquery — keep assignment in the database |

---

## Common Pitfalls

### Pitfall 1: Confusing profiles.laptop_ids with laptops.usage_profiles
**What goes wrong:** Developer populates `laptops.usage_profiles` but leaves `profiles.laptop_ids` empty. Quiz shows celebration animation then navigates to `/profile` with zero laptops. No error thrown — `fetchLaptopsByIds([])` returns empty array.
**Why it happens:** The two systems serve different purposes and both need populating.
**How to avoid:** After seeding laptops, run the verification query to confirm `profiles.laptop_ids` has 5 IDs. Test by completing the quiz end-to-end.

### Pitfall 2: Image URLs from MercadoLibre expiring or requiring auth
**What goes wrong:** Product image URLs from ML listings may require session cookies or expire.
**Why it happens:** ML uses CDN URLs for product photos; some are public, some are session-dependent.
**How to avoid:** Test each `image_url` in a private/incognito browser tab before committing to the seed file. Prefer URLs from the listing's main product image (usually public CDN).

### Pitfall 3: affiliate_link left empty breaks the CTA button
**What goes wrong:** `<a href="">` renders an anchor that opens the same page or does nothing.
**How to avoid:** For laptops entered before affiliate registration is complete, use the plain product URL (without affiliate tag). Update `affiliate_link` after registration. Never leave it as empty string in production.

### Pitfall 4: Amazon.com.ar doesn't exist
**What goes wrong:** Developer looks for an Argentine Amazon storefront to link to.
**Why it happens:** Amazon has local sites for many countries but Argentina is not one. Argentine customers use amazon.com with international shipping.
**How to avoid:** Use amazon.com product URLs with your US Associate tag. These ship to Argentina.

### Pitfall 5: ARS prices go stale immediately
**What goes wrong:** Prices entered today will be wrong in weeks due to Argentine inflation.
**How to avoid:** The `price` field is informational, not transactional. Use current MercadoLibre prices at time of data entry. Document the date in a SQL comment.

### Pitfall 6: MercadoLibre affiliate program requires content creator approval
**What goes wrong:** Registration form asks for social media accounts and may have follower requirements for full access.
**How to avoid:** Confirm during registration whether the basic affiliate link generation (not the creator bonus program) is gated or open. The basic affiliate program (2–4% on electronics) appears to be open to anyone 18+; the influencer bonus tier requires 10k+ followers.

---

## Architecture Patterns

### Recommended File Structure for Seed Data

```
supabase/
├── schema.sql                  # Existing: laptops table definition
├── profiles-schema.sql         # Existing: profiles table + enums
├── seed-profiles-81.sql        # Existing: 81 profile rows (names, descriptions)
├── seed.sql                    # NEW: laptop data + profile laptop_ids updates
└── migrations/
    ├── 03_add_laptop_spec_columns.sql  # Existing
    ├── 04_add_gallery_and_description.sql  # Existing
    └── 05_add_affiliate_columns.sql   # NEW (optional): if splitting ML/Amazon URLs
```

### Optional Migration: Split Affiliate Columns

If the planner decides to support both MercadoLibre and Amazon links per laptop:

```sql
-- supabase/migrations/05_add_affiliate_columns.sql
ALTER TABLE laptops
  ADD COLUMN IF NOT EXISTS affiliate_url_ml TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS affiliate_url_amazon TEXT DEFAULT '';
```

Then update TypeScript type and `detail-overlay.tsx` to show both links or prefer one.

If keeping a single `affiliate_link` field (simpler, sufficient for MVP), no migration needed — just populate the existing field.

---

## Environment Availability

Step 2.6: No external dependencies beyond what's already in the project (Supabase, Next.js). Affiliate program registration requires a browser — no CLI tooling. Supabase SQL Editor is available via the Supabase dashboard.

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Supabase dashboard access | Seed data insertion | Assumed (project is live) | SQL Editor for running INSERT statements |
| MercadoLibre account | Affiliate registration | Requires user action | Manual step, human gate |
| Amazon account | Affiliate registration | Requires user action | Manual step, human gate |

**Human gate identified:** Both affiliate registrations require the product owner (user) to complete manually. The developer can write the seed SQL and placeholder affiliate links, but actual affiliate-tagged URLs cannot be generated until registration is complete.

---

## Open Questions

1. **MercadoLibre affiliate link format**
   - What we know: Links are generated in-platform via app/dashboard; format not publicly documented
   - What's unclear: Whether the URL uses a query param (e.g., `?ref=`) or is an opaque redirect URL
   - Recommendation: Register first, generate one test link, inspect the URL, then document the format before seeding

2. **Single vs dual affiliate_link columns**
   - What we know: Current schema has one `affiliate_link TEXT` field; CONTEXT.md mentions both `affiliate_url_ml` and `affiliate_url_amazon` as a possibility
   - What's unclear: Whether the same laptop will ever have both (many laptops are only on ML, MacBooks may only be on Amazon)
   - Recommendation: Keep single `affiliate_link` for MVP; most laptops are only on one platform. Add second column only if a specific laptop needs dual CTA buttons.

3. **MacBook pricing and affiliate**
   - What we know: Apple products are sold on MercadoLibre Argentina; Amazon US ships MacBooks to Argentina
   - What's unclear: Whether ML affiliate commission applies to official Apple Store listings on ML vs third-party sellers
   - Recommendation: Use MercadoLibre links for MacBooks sold through the platform; note that Apple products may have lower ML commission rates

4. **Current laptop count in Supabase**
   - What we know: Seed file does not exist; test data may or may not be present from earlier development
   - Recommendation: Run `SELECT count(*) FROM laptops;` first; if test data exists, decide whether to truncate or supplement

---

## Sources

### Primary (HIGH confidence)
- Codebase (`src/types/laptop.ts`, `src/components/catalog/detail-overlay.tsx`, `supabase/schema.sql`, `supabase/profiles-schema.sql`, `supabase/seed-profiles-81.sql`) — verified directly
- Supabase official docs (`supabase.com/docs/guides/local-development/seeding-your-database`) — seeding conventions
- Amazon Associates official (`affiliate-program.amazon.com`) — link format, SiteStripe, tag= parameter

### Secondary (MEDIUM confidence)
- MercadoLibre official program page (`mercadolibre.com.ar/l/afiliados`) — program existence, commission rates
- mobiletime.la expansion article (2026-03) — ML Argentina commission structure
- Web search results for Argentine laptop market — model names, approximate prices

### Tertiary (LOW confidence — flag for validation)
- ARS price estimates from search snippets — highly volatile, must be verified at insertion time
- MercadoLibre affiliate link URL format — not publicly documented; must verify after registration

---

## Metadata

**Confidence breakdown:**
- Codebase state (schema, affiliate_link field, profile mechanism): HIGH — read directly from source
- MercadoLibre affiliate program existence + registration: MEDIUM — official page confirmed, details from secondary sources
- Amazon Associates format: HIGH — official docs confirmed
- Amazon.com.ar non-existence: HIGH — confirmed from multiple sources
- Argentine laptop models and specs: MEDIUM — from review sites and ML search results
- ARS prices: LOW — volatile, approximate

**Research date:** 2026-04-05
**Valid until:** Prices section invalid immediately (ARS inflation); affiliate program details valid ~30 days; schema facts valid until next migration
