# Phase 9: Feedback Modal - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 09-feedback-modal
**Areas discussed:** Trigger button style, Post-submit UX, Rating interaction, Contextual metadata, Spam guard

---

## Trigger Button Style

| Option | Description | Selected |
|--------|-------------|----------|
| Icon only, same as ThemeToggle | MessageSquare icon, w-9 h-9 rounded-lg | ✓ |
| Icon + short label | 'Feedback' text next to icon | |

**User's choice:** Icon only  
**Notes:** Consistent with existing ThemeToggle style, no layout impact on mobile.

---

## Post-Submit UX

| Option | Description | Selected |
|--------|-------------|----------|
| In-modal success message, auto-close | Shows success for 1.5s then closes | ✓ |
| Instant close + toast | Closes modal + toast notification | |

**User's choice:** In-modal success message, then auto-close  
**Notes:** No toast system needed — simpler.

---

## Rating Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| 1-5 stars, click same star to clear | Standard star rating, clearable | |
| Skip rating, text-only | No rating UI, just textarea | ✓ |
| Thumbs up / thumbs down | Binary sentiment | |

**User's choice:** Skip rating — text-only form  
**Notes:** FEED-02's "optional star rating" is satisfied by omitting it entirely (optional = skip is valid).

---

## Contextual Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Current page URL | window.location.pathname stored in DB | |
| Timestamp only | Just created_at, no extra context | ✓ |
| User locale | navigator.language | |

**User's choice:** Timestamp only  
**Notes:** Minimal schema — id + message + created_at.

---

## Spam Guard

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage limit: 2 per device | Button disabled after 2 submissions | ✓ |
| Honeypot only (FEED-04) | Bot protection only, no human cap | |

**User's choice:** localStorage cap of 2 per device  
**Notes:** User explicitly concerned about spam — "por usuario se puede enviar solo 1 o 2, porque sino me podrian espamear". No auth system exists so localStorage is the pragmatic solution.

---

## Claude's Discretion

- Dialog component structure and animations
- Whether FeedbackButton is its own file or inlined in Navbar
- Exact placeholder/label text for the textarea
- Tailwind classes for the centered modal overlay and panel

## Deferred Ideas

- Star rating (could add later as DB column + UI upgrade)
- Admin dashboard — FEED-ADV-02 (v2)
- Upstash rate limiting — FEED-ADV-01 (v2)
