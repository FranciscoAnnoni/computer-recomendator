# Phase 6: Iterative Improvements - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning
**Source:** Direct discussion with user

<domain>
## Phase Boundary

Three concrete improvements to the live product:

1. **Affiliate program setup** — Step-by-step guide + implementation for MercadoLibre and Amazon affiliate links (generate the actual links, integrate them where the "Comprar Ahora" CTA currently exists).
2. **Database population** — Populate the Supabase `laptops` table with real laptop/computer data from Amazon and MercadoLibre listings (scraping strategy or manual import plan).
3. **Profile-to-laptop assignment** — Ensure each usage profile (from the quiz) has exactly 5 recommended laptops assigned.

The UI and core logic are already working. These three items are the remaining gaps before the product is fully functional.

</domain>

<decisions>
## Implementation Decisions

### 1. Affiliate Program (MercadoLibre + Amazon)
- Create step-by-step documentation for registering in both affiliate programs
- Integrate affiliate link generation: each laptop's "Comprar Ahora" button must use affiliate-tagged URLs
- MercadoLibre affiliate program: mercadolibre.com.ar partner program
- Amazon affiliate program: Amazon Associates (programa de afiliados)
- Links must be stored in the database (e.g., `affiliate_url_ml` and `affiliate_url_amazon` columns) OR generated dynamically from base product URLs + affiliate tag parameters

### 2. Database Population
- Populate the `laptops` table in Supabase with real products from Amazon and MercadoLibre
- Each laptop must have all required fields: name, brand, price, specs (RAM, storage, processor, GPU), usage_profiles, image_url, etc.
- Data sourced from Amazon.com.ar / MercadoLibre Argentina listings
- Minimum viable: enough laptops to cover all usage profiles with at least 5 each
- Format: SQL INSERT statements or JSON seed file for reproducibility

### 3. Profile-to-Laptop Assignment
- Each usage profile (defined in the quiz: gaming, trabajo/work, estudiante, etc.) must have exactly 5 laptops assigned
- Assignment stored via `usage_profiles TEXT[]` column (already exists in the laptops table with GIN index)
- Verify current coverage: check which profiles have < 5 laptops assigned
- Add/update laptop records to ensure all profiles are covered

### Claude's Discretion
- Exact affiliate tag parameter names and URL format (will vary by platform)
- Whether to add new columns to the laptops table for affiliate URLs or derive them dynamically
- Order/priority of which laptops to source first

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database Schema
- `.planning/STATE.md` — Decisions about laptops table structure (usage_profiles TEXT[] with GIN index, single table with two display layers)

### Application Code
- `src/` — Existing Next.js app structure
- Look for: `affiliate_url`, `buy_url`, or similar fields in the codebase to understand current "Comprar Ahora" implementation

</canonical_refs>

<specifics>
## Specific Ideas

- "Comprar Ahora" buttons already exist in the product detail view (Phase 03-03 decision: buttonVariants CVA on anchor tag)
- Usage profiles already defined: gaming, trabajo (work), estudiante (student), and others from quiz
- Supabase is the database — direct SQL or Supabase dashboard import
- Target market: Argentina (MercadoLibre.com.ar, Amazon.com.ar)

</specifics>

<deferred>
## Deferred Ideas

- Automated scraping / price sync (real-time pricing updates)
- UI redesign or new pages (UI is considered done)

</deferred>

---

*Phase: 06-iterative-improvements*
*Context gathered: 2026-04-05 via user discussion*
