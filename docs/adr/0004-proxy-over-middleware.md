# ADR 0004: `src/proxy.ts` replaces `middleware.ts` (Next.js 16) with cookie preservation

- Status: accepted
- Date: 2026-10-19

## Context

Next.js 16 renamed the `middleware` file convention to `proxy` (Node.js runtime only; see `node_modules/next/dist/docs/`). Keeping `middleware.ts` triggers deprecation and will break on the newer convention.

Separately, the existing session-refresh logic had a bug: when an unauthenticated user hit a protected route, the redirect response was built **without** the Supabase cookies that `updateSession` had just refreshed, so refreshed tokens were dropped on every redirect — sessions appeared to expire unpredictably ("không vô được LMS").

## Decision

- Rename `src/middleware.ts` → `src/proxy.ts`, exporting `async function proxy(request: NextRequest)` with the same matcher. Its only job is `updateSession(request)` from `src/lib/supabase/session-proxy.ts`.
- All redirect/JSON responses produced inside `updateSession` are constructed through a `withSessionCookies(response)` helper that copies the refreshed `sb-*` cookie set onto the outgoing response before returning it.
- Public-path list and `DEV_BYPASS_AUTH` handling (development-only) moved into `session-proxy.ts` alongside the cookie logic.

## Consequences

- Follows the Next.js 16 convention verified against bundled docs, not memory.
- Refreshed Supabase tokens now survive auth redirects; logins persist across navigations instead of randomly expiring.
- Cookie handling lives in exactly one helper — future response paths can't drop cookies by accident.
- `proxy` runs on the Node.js runtime only (no edge); no behaviour change for static assets (same matcher exclusions).
