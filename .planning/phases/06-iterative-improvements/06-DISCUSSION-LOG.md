# Phase 6: Iterative Improvements - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion history.

**Date:** 2026-04-05
**Phase:** 06-iterative-improvements
**Mode:** discuss
**Areas discussed:** Laptop selection, Amazon approach, Affiliate link placeholders

## Gray Areas Presented

| Area | Options offered |
|------|----------------|
| Laptop selection | Mix all brands / Windows-focused / MercadoLibre catalog-driven |
| Amazon approach | MercadoLibre only / Amazon.com US / Both platforms |
| Affiliate placeholders | ML search URL / Exact product page URL / null |

## Decisions Made

### Laptop Selection
- **Chosen:** Mix of all brands, but ONLY products available on MercadoLibre Argentina
- **User note:** "al inicio prioricemos solo las computadoras que estan en mercado libre, porque son las que nos interesa, osea principalmente vamos a atacar al mercado de argentina. y luego en algun futuro el de amazon y luego el global"
- **Decision captured:** D-06 through D-10 in CONTEXT.md

### Amazon Approach
- **Chosen:** MercadoLibre only (Recommended)
- **Reason:** Argentina-first strategy. Amazon global expansion is future roadmap.
- **Decision captured:** D-01, D-04 in CONTEXT.md

### Affiliate Link Placeholders
- **Chosen:** null / empty string
- **Reason:** User prefers blank over a search URL; will populate real links after affiliate registration.
- **Decision captured:** D-03 in CONTEXT.md

## Corrections Applied to CONTEXT.md

These decisions update the initial context (which was written before full discussion):

1. **Amazon removed from scope** — initial context mentioned Amazon Associates; now MercadoLibre only
2. **Affiliate placeholders set to null** — initial plan used search URLs as placeholders; corrected to null
3. **MercadoLibre Argentina confirmed as the only source** for both laptop data and affiliate links

## No Deferred Ideas (within scope)

Future Amazon and global expansion are noted in `<deferred>` section.
