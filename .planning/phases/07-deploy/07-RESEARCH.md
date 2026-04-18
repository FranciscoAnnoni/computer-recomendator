# Phase 7: Deploy - Research

**Researched:** 2026-04-18
**Domain:** Vercel deployment, Next.js production config, Supabase environment variables
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Wrap `allowedDevOrigins` in a `NODE_ENV === 'development'` conditional (or PHASE_DEVELOPMENT_SERVER) in `next.config.ts` so local-network phone testing still works during dev, but the array never appears in the production build. Satisfies DEP-03.
- **D-02:** Use same Supabase project for production (simpler, no data migration). Env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be added to Vercel's Environment Variables dashboard (Production scope).
- **D-03:** New Vercel project connected to the GitHub repo, deployed from `main` branch. Use default `.vercel.app` URL — no custom domain in this phase.

### Claude's Discretion
- Exact Vercel CLI vs. dashboard import choice
- Whether to run a local production build (`npm run build`) to verify no errors before deploying

### Deferred Ideas (OUT OF SCOPE)
- Custom domain
- Separate production Supabase instance
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEP-01 | User can access the app at a public Vercel production URL | Vercel GitHub import flow creates this automatically after env vars are set |
| DEP-02 | App connects to Supabase in production (env vars set in Vercel dashboard) | `NEXT_PUBLIC_` vars in Vercel dashboard Production scope — available at build time and runtime |
| DEP-03 | No local dev config (`allowedDevOrigins`) leaks into production build | Use PHASE_DEVELOPMENT_SERVER or NODE_ENV guard in next.config.ts |
</phase_requirements>

---

## Summary

This phase has three concrete tasks: (1) fix `next.config.ts` to guard `allowedDevOrigins` with a dev-phase check, (2) add the two Supabase env vars to Vercel's dashboard under Production scope, and (3) connect the GitHub repo to Vercel and trigger the first production deployment.

The technical surface is small. `next.config.ts` currently exports a static object — it must be refactored to export a function that receives the build `phase`, allowing `allowedDevOrigins` to be injected only when `phase === PHASE_DEVELOPMENT_SERVER`. This is the canonical Next.js pattern, verified in official docs. No other code changes are needed: `src/lib/supabase.ts` reads `NEXT_PUBLIC_` vars at runtime and will work automatically once Vercel has them.

Vercel detects Next.js automatically on import. No `vercel.json` is required for a standard deployment. The recommended approach (no CLI needed) is the Vercel dashboard GitHub import, which is simpler and produces the same result.

**Primary recommendation:** Export a phase-function from `next.config.ts`, set env vars in Vercel dashboard (Production scope), then import the GitHub repo through Vercel dashboard. Run `npm run build` locally first to confirm no build errors before deploying.

---

## Standard Stack

### Core
| Library/Tool | Version | Purpose | Why Standard |
|---|---|---|---|
| Next.js | 16.2.0 (already installed) | Framework | Project stack |
| @supabase/supabase-js | ^2.99.2 (already installed) | DB client | Project stack |
| Vercel | Platform | Hosting | Official Next.js host, zero-config for Next.js |

### Supporting
| Tool | Purpose | When to Use |
|---|---|---|
| Vercel Dashboard (GitHub import) | Create project, set env vars, trigger deploy | Preferred over CLI for first-time setup — no install required |
| Vercel CLI (`vercel`) | Alternative deploy trigger | Useful for CI or re-deploys from terminal; NOT installed locally |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|---|---|---|
| Vercel dashboard import | Vercel CLI (`vercel deploy`) | CLI requires `npm i -g vercel` and login; dashboard is simpler for one-time setup |
| PHASE_DEVELOPMENT_SERVER guard | `process.env.NODE_ENV === 'development'` | Both work; phase function is the canonical Next.js pattern per official docs |

**No installation required** — all dependencies already in `package.json`. Vercel account setup is manual (dashboard action, not code).

---

## Architecture Patterns

### Pattern 1: next.config.ts Phase Function (DEP-03)

**What:** Refactor `next.config.ts` from a static object export to a function export that receives the build `phase`. Include `allowedDevOrigins` only when `phase === PHASE_DEVELOPMENT_SERVER`.

**When to use:** Any time a config option must be dev-only. This is the official Next.js pattern.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    ...(isDev && {
      allowedDevOrigins: ["192.168.100.14", "192.168.1.67", "192.168.1.74"],
    }),
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "orxstqqcsxatxaprqyvq.supabase.co",
          pathname: "/storage/v1/object/public/**",
        },
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "http2.mlstatic.com" },
        { protocol: "https", hostname: "m.media-amazon.com" },
      ],
    },
  };
}
```

> Note: `PHASE_DEVELOPMENT_SERVER` is the string `"phase-development-server"` — it matches only `next dev`, not `next build` or `next start`. This guarantees the array is absent from production builds.

### Pattern 2: Vercel Environment Variables (DEP-02)

**What:** `NEXT_PUBLIC_` prefixed variables set in Vercel dashboard under Production scope are injected at build time (inlined into client bundle) and available server-side at runtime.

**Steps:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_SUPABASE_URL` — scope: Production (and Preview if desired)
3. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` — scope: Production (and Preview if desired)
4. Redeploy after adding (first deploy can set them before triggering initial build)

**Critical:** After adding env vars, a new deployment must be triggered. The first deploy after import will pick them up if they are added before clicking "Deploy".

### Pattern 3: Vercel GitHub Import (DEP-01)

**What:** Connect GitHub repo to Vercel to create a production project with auto-deploy on push to `main`.

**Steps:**
1. vercel.com → Add New Project → Import Git Repository
2. Select `computer-recomendator` repo
3. Framework Preset: Next.js (auto-detected)
4. Add environment variables on the import screen (before first build)
5. Click Deploy

**No `vercel.json` required** for this standard setup.

### Anti-Patterns to Avoid
- **Setting env vars after first deploy without redeploying:** The build bakes `NEXT_PUBLIC_` vars — the app will show undefined until redeployed.
- **Leaving `allowedDevOrigins` as a top-level static property:** Even if Next.js ignores the field at runtime in production, the DEP-03 requirement is that it not appear in the production config object. The phase function removes it cleanly.
- **Using `process.env.NODE_ENV` check in the config object body:** Works, but the phase function is the canonical pattern and does not depend on the environment variable being set correctly externally.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Hosting | Self-host on VPS | Vercel | Zero-config Next.js support, automatic SSL, global CDN |
| Env var injection | Custom build scripts | Vercel dashboard env vars | Vercel handles build-time injection of NEXT_PUBLIC_ vars automatically |
| Dev/prod config split | Custom config merge utility | Next.js `phase` function | Built into Next.js, no extra code needed |

---

## Common Pitfalls

### Pitfall 1: NEXT_PUBLIC_ vars missing at build time
**What goes wrong:** App builds successfully but Supabase client throws at runtime — `supabaseUrl` and `supabaseAnonKey` are undefined strings, causing 400/401 errors on all data fetches.
**Why it happens:** `NEXT_PUBLIC_` vars are inlined at `next build` time. If the vars aren't in Vercel when the build runs, they bake in as `undefined`.
**How to avoid:** Add env vars on the Vercel import screen before clicking Deploy, or add them in Settings and then trigger a Redeploy.
**Warning signs:** App renders but quiz results, catalog, and profile pages show empty/error states.

### Pitfall 2: allowedDevOrigins TypeScript type error
**What goes wrong:** After converting to a phase function, TypeScript may complain about the spread of a conditional object into `NextConfig`.
**Why it happens:** `NextConfig` is a strict interface; spreading a partial conditional object needs a cast.
**How to avoid:** Use `as NextConfig` on the return or use `Partial<NextConfig>` for the dev overrides object, then merge. The spread pattern `...(isDev && { ... })` is idiomatic TypeScript and Next.js accepts it — verify the build passes with `npm run build`.

### Pitfall 3: Preview deployments connecting to production Supabase
**What goes wrong:** PR preview deployments on Vercel also use the production Supabase project because the vars are set for Preview scope too.
**Why it happens:** DEP-02 says to set vars for Production scope. If Preview scope is also checked, previews also use production data.
**How to avoid:** Per CONTEXT.md D-02 decision (same Supabase project for all), this is acceptable at current scale. Just be aware that preview deploys do real reads from the production DB.

### Pitfall 4: Build fails locally but not caught before deploy
**What goes wrong:** First Vercel deploy fails due to TypeScript error or missing import — wastes a deployment cycle.
**Why it happens:** The local `next dev` server is more permissive than `next build`.
**How to avoid:** Run `npm run build` locally before deploying to Vercel. This is listed as a Claude's Discretion item in CONTEXT.md — it should be a task in the plan.

---

## Code Examples

### Verified: next.config.ts with phase function
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js (PHASE_DEVELOPMENT_SERVER pattern)
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  return {
    ...(phase === PHASE_DEVELOPMENT_SERVER && {
      allowedDevOrigins: ["192.168.100.14", "192.168.1.67", "192.168.1.74"],
    }),
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "orxstqqcsxatxaprqyvq.supabase.co",
          pathname: "/storage/v1/object/public/**",
        },
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "http2.mlstatic.com" },
        { protocol: "https", hostname: "m.media-amazon.com" },
      ],
    },
  };
}
```

### Verified: Supabase client (no changes needed)
```typescript
// src/lib/supabase.ts — unchanged; works once Vercel has the env vars
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | `npm run build` verification | Yes | v22.17.0 | — |
| npm | Package management | Yes | 11.8.0 | — |
| Vercel CLI | Optional deploy trigger | No | — | Use Vercel dashboard (preferred) |
| Vercel account | Hosting (DEP-01) | Unknown — requires human | — | No fallback; manual step |
| Supabase project | DB (DEP-02) | Exists (already used in dev) | — | — |

**Missing dependencies with no fallback:**
- Vercel account setup and GitHub connection — this is a manual human action, not automatable by code tasks. The plan must include a manual step for the user to complete the Vercel dashboard import.

**Missing dependencies with fallback:**
- Vercel CLI — not installed, but the dashboard import is the preferred approach and covers the same need.

---

## Validation Architecture

> `workflow.nyquist_validation` key absent from config.json — treated as enabled.

### Test Framework
| Property | Value |
|---|---|
| Framework | None detected — no jest.config, vitest.config, or test directories found |
| Config file | None |
| Quick run command | `npm run build` (build verification is the proxy for a test) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| DEP-01 | Public URL accessible | manual smoke | Visit production URL after deploy | N/A — post-deploy human check |
| DEP-02 | Supabase data loads in production | manual smoke | Open quiz, complete it, verify recommendations appear | N/A — post-deploy human check |
| DEP-03 | No allowedDevOrigins in production config | build verification | `npm run build` — config function evaluated; check no TS error | ✅ via npm run build |

### Sampling Rate
- **Per task commit:** `npm run build` (confirms next.config.ts change doesn't break build)
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Successful Vercel production deployment + manual smoke test of quiz result before `/gsd:verify-work`

### Wave 0 Gaps
None — no new test files needed. Build verification (`npm run build`) is sufficient for the single code change. The two remaining requirements (DEP-01, DEP-02) are verified by manual smoke testing after deployment.

---

## Open Questions

1. **Vercel account ownership**
   - What we know: No `.vercel/` directory exists in the repo — no prior Vercel project linked.
   - What's unclear: Whether the user has an existing Vercel account or needs to create one.
   - Recommendation: Plan should include a manual step: "Create Vercel account at vercel.com if needed, then import GitHub repo."

2. **Supabase production URL and anon key values**
   - What we know: `.env.example` documents the var names; actual values are in user's local `.env.local` (not in git).
   - What's unclear: The plan cannot automate this — the user must copy these values from their local `.env.local` or from the Supabase dashboard into Vercel.
   - Recommendation: Plan task should instruct user to copy from local `.env.local` or Supabase Dashboard → Project Settings → API.

---

## Sources

### Primary (HIGH confidence)
- [Next.js allowedDevOrigins docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins) — confirmed dev-only purpose, no built-in production guard
- [Next.js next.config.js reference](https://nextjs.org/docs/app/api-reference/config/next-config-js) — PHASE_DEVELOPMENT_SERVER pattern verified, TypeScript function export confirmed
- [Vercel environment variables docs](https://vercel.com/docs/environment-variables) — Production scope behavior, NEXT_PUBLIC_ build-time injection, redeploy requirement confirmed
- [Vercel Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) — zero-config deployment confirmed

### Secondary (MEDIUM confidence)
- [Vercel knowledge base: adding env vars](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables) — dashboard step-by-step confirmed via web search

---

## Metadata

**Confidence breakdown:**
- next.config.ts pattern: HIGH — verified against Next.js 16.2.4 official docs
- Vercel env vars: HIGH — verified against official Vercel docs
- Vercel import flow: HIGH — standard, well-documented, unchanged for years
- TypeScript spread edge case: MEDIUM — known pattern, `npm run build` will confirm

**Research date:** 2026-04-18
**Valid until:** 2026-10-18 (stable APIs — Next.js config and Vercel platform change infrequently)
