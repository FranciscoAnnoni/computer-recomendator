# Phase 6: Iterative Improvements - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning
**Source:** User discussion (updated after plan creation)

<domain>
## Phase Boundary

Three concrete improvements to the live product:

1. **Affiliate program setup** — Step-by-step guide for MercadoLibre Argentina affiliate registration + integrate affiliate-tagged links into the "Comprar Ahora" CTA.
2. **Database population** — Populate the Supabase `laptops` table with real products available on MercadoLibre Argentina (not Amazon for now).
3. **Profile-to-laptop assignment** — Ensure each of the 81 quiz profiles has exactly 5 recommended laptops assigned.

The UI and core logic are already working. These three items are the remaining gaps before the product is fully functional.

</domain>

<decisions>
## Implementation Decisions

### Affiliate Program
- **D-01:** MercadoLibre Argentina ONLY for now. Amazon is out of scope for this phase.
- **D-02:** Create step-by-step guide for MercadoLibre affiliate registration (documentation file)
- **D-03:** Affiliate link placeholders are `null` / empty string — leave blank until the affiliate account is registered. The "Comprar Ahora" button will be non-functional until real links are populated. This is acceptable.
- **D-04:** Future expansion planned: Amazon US → global. Note this in the guide as next steps.
- **D-05:** `affiliate_link` column already exists in the `laptops` table — no schema migration needed.

### Laptop Selection
- **D-06:** Mix of all brands and segments (Lenovo, ASUS, HP, MSI for Windows; Apple MacBooks for macOS), but ONLY laptops actually available and purchasable on MercadoLibre Argentina.
- **D-07:** Priority market is Argentina (MercadoLibre.com.ar). Do not include products only available on amazon.com.
- **D-08:** Cover all budget segments: esencial (~$200k–$350k ARS), equilibrado (~$400k–$700k ARS), premium ($800k+ ARS)
- **D-09:** Cover all OS segments: Windows (majority), macOS (MacBook M-series available on MercadoLibre AR), "abierto" (best-value pick across OS)
- **D-10:** Target: ~22–25 laptop records covering all 81 profile combinations

### Profile-to-Laptop Assignment
- **D-11:** The mechanism is `profiles.laptop_ids uuid[]` (NOT just `laptops.usage_profiles`). Both must be populated.
- **D-12:** Every one of the 81 profiles (3 workloads × 3 lifestyles × 3 budgets × 3 OS) must have exactly 5 laptop UUIDs.
- **D-13:** `laptops.usage_profiles TEXT[]` is also populated — used by the catalog filter feature.

### Claude's Discretion
- Exact laptop model selection (which specific Lenovo/ASUS/HP models to use)
- Fallback logic when a profile combination has fewer than 5 exact matches (relax filters iteratively)
- Image URLs for laptop images (use existing CDN or MercadoLibre product images)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database Schema
- `.planning/STATE.md` — Decisions about laptops table structure (usage_profiles TEXT[] with GIN index, single table with two display layers, affiliate_link already exists)

### Application Code
- `src/types/laptop.ts` — Laptop TypeScript type, including `affiliate_link: string` field
- `src/components/catalog/detail-overlay.tsx` — Renders `laptop.affiliate_link` as the "Comprar Ahora" anchor (line ~184)
- `src/types/quiz.ts` — Quiz types: Workload, Lifestyle, Budget, OsPreference enums + QUIZ_STEPS array (source of truth for all valid profile dimension values)
- `src/lib/quiz-data.ts` — `fetchLaptopsByIds` — reads `profiles.laptop_ids` to resolve recommendations

</canonical_refs>

<specifics>
## Specific Ideas

- MercadoLibre Argentina is the ONLY affiliate platform for this phase
- Affiliate links are left null/empty until the product owner registers the affiliate account
- Products must be real, currently-for-sale items on MercadoLibre Argentina (not hypothetical)
- Quiz profiles: 3 × 3 × 3 × 3 = 81 combinations. All must be covered with 5 laptops each.
- Future roadmap: Amazon US affiliate → global expansion (note in guide, do NOT implement now)

</specifics>

<deferred>
## Deferred Ideas

- Amazon.com affiliate integration — future expansion after MercadoLibre is set up
- Global market expansion (products beyond Argentina)
- Automated scraping / price sync (real-time pricing updates)
- UI redesign or new pages (UI is considered done)

</deferred>

---

*Phase: 06-iterative-improvements*
*Context gathered: 2026-04-05, updated after discussion*
