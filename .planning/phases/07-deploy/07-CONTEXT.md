# Phase 7: Deploy - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning
**Source:** Codebase analysis (discussion skipped — requirements are clear)

<domain>
## Phase Boundary

Deploy the app to a public Vercel production URL with Supabase env vars configured in the Vercel dashboard, and clean up the dev-only `allowedDevOrigins` config from `next.config.ts`. No new features.

</domain>

<decisions>
## Implementation Decisions

### allowedDevOrigins cleanup
- **D-01:** Wrap `allowedDevOrigins` in a `NODE_ENV === 'development'` conditional in `next.config.ts` so local-network phone testing still works during dev, but the array never appears in the production build. This satisfies DEP-03 while preserving the dev workflow (`next dev --hostname 0.0.0.0`).

### Supabase environment
- **D-02:** Claude's discretion — use same Supabase project for production (simpler, no data migration). The env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be added to Vercel's Environment Variables dashboard (Production scope).

### Vercel deployment
- **D-03:** Claude's discretion — new Vercel project connected to the GitHub repo, deployed from the `main` branch. Use the default `.vercel.app` URL (no custom domain in this phase).

### Claude's Discretion
- Exact Vercel CLI vs. dashboard import choice
- Whether to run a local production build (`npm run build`) to verify no errors before deploying

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Config files to modify
- `next.config.ts` — Contains the `allowedDevOrigins` array that must be made dev-only (DEP-03)
- `.env.example` — Documents the two required env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Supabase client
- `src/lib/supabase.ts` — Reads `process.env.NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — these must exist in Vercel's production env vars

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `next.config.ts` — Already has correct `images.remotePatterns` for Supabase storage; only `allowedDevOrigins` needs fixing

### Established Patterns
- `next dev --hostname 0.0.0.0` in package.json scripts — user tests on local network, so `allowedDevOrigins` must stay for dev

### Integration Points
- Supabase client is a singleton at `src/lib/supabase.ts` — no changes needed once env vars are set in Vercel

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard Vercel + Next.js deployment flow.

</specifics>

<deferred>
## Deferred Ideas

- Custom domain — not in scope for Phase 7
- Separate production Supabase instance — not needed at current scale

</deferred>

---

*Phase: 07-deploy*
*Context gathered: 2026-04-18*
