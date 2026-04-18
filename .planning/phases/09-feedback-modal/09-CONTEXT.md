# Phase 9: Feedback Modal - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a feedback button to the Navbar (next to ThemeToggle on both desktop and mobile) that opens a centered modal where users can submit a text comment. Submissions are stored in a Supabase `feedback` table. A honeypot field guards against bots. A localStorage counter (max 2 per device) prevents spam from real users. No admin dashboard — the owner reads feedback directly from Supabase. No star rating in this phase.

</domain>

<decisions>
## Implementation Decisions

### Trigger Button
- **D-01:** Icon-only button matching ThemeToggle style (`w-9 h-9 rounded-lg`, `text-muted-foreground hover:text-foreground hover:bg-muted`). Use `MessageSquare` icon from lucide-react.
- **D-02:** Button appears in both the desktop right section AND the mobile right section of the Navbar (same as ThemeToggle placement).

### Modal Dialog
- **D-03:** Centered dialog (not a side Sheet). Build a `FeedbackDialog` component using the same `@base-ui/react/dialog` primitive that `Sheet` uses, but styled as a centered modal overlay.
- **D-04:** Modal contains: title ("Deja tu comentario"), textarea for text feedback, submit button, close/cancel button.

### Form Fields
- **D-05:** Text feedback only — no star rating (FEED-02's optional rating is skipped for simplicity). Textarea is required.
- **D-06:** Hidden honeypot field (visually hidden via CSS, not `display:none`) to catch automated bots. If the field has a value on submit, silently discard without error message.

### Post-Submit UX
- **D-07:** After successful submit: show an in-modal success message ("¡Gracias por tu comentario! ❤️"), then auto-close the modal after 1.5s. No external toast system needed.
- **D-08:** On Supabase error: show inline error message inside the modal ("Algo salió mal, intenta de nuevo"). Do not close.

### Spam Protection
- **D-09:** localStorage key `feedback_count` tracks how many times this device has submitted. Max = 2. After 2 submissions, the feedback button is disabled (or shows a tooltip "Ya enviaste tu feedback"). Count persists indefinitely (no expiry).
- **D-10:** Honeypot check is client-side only — if the hidden field has any value, skip the Supabase insert silently.

### Supabase Schema
- **D-11:** Table `feedback` with columns: `id` (uuid, primary key, default gen_random_uuid()), `message` (text, not null), `created_at` (timestamptz, default now()). No rating column, no page_url column.
- **D-12:** Use the existing `supabase` singleton from `src/lib/supabase.ts` for the insert.

### Claude's Discretion
- Exact Tailwind classes for the centered dialog overlay and panel
- Animation style for modal open/close (fade, scale, etc.)
- Exact placeholder text for the textarea
- Whether to use a separate `src/components/layout/FeedbackButton.tsx` or inline into Navbar

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing components to modify/reference
- `src/components/layout/Navbar.tsx` — ThemeToggle placement pattern; feedback button slots next to ThemeToggle in both desktop and mobile sections
- `src/components/ui/sheet.tsx` — Shows how to wrap `@base-ui/react/dialog` primitives; use same pattern for the centered FeedbackDialog
- `src/components/ui/theme-toggle.tsx` — Exact button style to match (w-9 h-9 rounded-lg pattern)

### Supabase
- `src/lib/supabase.ts` — Singleton client; use for the feedback table insert
- `.env.example` — Supabase env vars already configured

### Requirements
- `.planning/REQUIREMENTS.md` §Feedback — FEED-01 through FEED-04 are the acceptance criteria for this phase

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@base-ui/react/dialog` — Already a dependency (Sheet uses it). Use `Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`, `Dialog.Close` for the centered modal.
- `MessageSquare` from `lucide-react` — already a project dependency, matches the icon set in use.
- `supabase` singleton — `import { supabase } from "@/lib/supabase"` ready to use.

### Established Patterns
- All interactive icon buttons use `w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors` (see ThemeToggle).
- `"use client"` at the top of components that use hooks or browser APIs.
- localStorage is accessed inside `useEffect` to avoid SSR errors (pattern established in Navbar, ThemeToggle).
- Navbar is already a Client Component — adding the FeedbackButton state here is safe.

### Integration Points
- Navbar right sections (desktop: `hidden md:flex items-center gap-4`, mobile: `md:hidden flex items-center gap-4`) — feedback button slots between ThemeToggle and the hamburger/CTA.
- `supabase.from("feedback").insert({ message })` — the table must be created in Supabase before execution.

</code_context>

<specifics>
## Specific Ideas

- User phrasing: "un boton en la parte superior del navbar que permite al usuario dar feedback, cuando lo toca tiene un modal, que puede cerrar o escribir su comentario, y enviarlo"
- Spam concern: "por usuario se puede enviar solo 1 o 2, porque sino me podrian espamear" — localStorage cap of 2 per device
- Owner reads feedback directly from Supabase (no admin view in this phase)

</specifics>

<deferred>
## Deferred Ideas

- Admin dashboard to read/moderate feedback — already in v2 as FEED-ADV-02
- Upstash rate limiting — already in v2 as FEED-ADV-01
- Star rating — skipped for simplicity; could be added later as a column upgrade

None of these were new suggestions — all pre-scoped in REQUIREMENTS.md v2 section.

</deferred>

---

*Phase: 09-feedback-modal*
*Context gathered: 2026-04-18*
