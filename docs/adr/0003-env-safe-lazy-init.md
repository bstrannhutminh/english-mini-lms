# ADR 0003: Env-safe lazy initialisation + minimal public health

- Status: accepted
- Date: 2026-10-19

## Context

Two related reliability problems:

1. Several modules read and validated environment variables at import time (DB clients, Gemini provider, Supabase). `next build` evaluates page modules during prerendering, so any missing variable failed the build — even though the variables are only needed at request time. CI and fresh checkouts could not build or run tests.
2. The public `GET /api/v1/health` endpoint returned diagnostic detail: a masked database URL (still leaking host/user), learner counts, and environment names — information useful to an attacker and unnecessary for an uptime probe.

## Decision

- `src/lib/env.ts` performs zod validation **lazily**: `getEnv()`/`requireEnv()` are called at request time and throw `EnvError` with a Vietnamese message naming each missing variable. The module has no top-level side effects, so `next build`, `npm test` (unit) and `npm run lint` all succeed with zero env vars.
- DB/Gemini/Supabase clients are created on first use inside request handlers (lazy singletons), never at module scope.
- `GET /api/v1/health` is public and minimal: `{ status: "ok", time }` only.
- All diagnostics moved to `GET /api/v1/admin/health` behind `withAdmin`: boolean presence flags per env var (never values), `SELECT 1` DB ping, applied-migration count, and only the error *kind* on DB failure (no raw messages that could leak connection strings).

## Consequences

- Build, lint, typecheck and unit tests pass on a clean machine/CI without secrets (spec criterion 1).
- Missing configuration surfaces as a readable Vietnamese error at runtime instead of a white screen or cryptic 500.
- The public attack surface loses host/user/counts disclosure; operators keep a useful authenticated diagnostics endpoint.
- Callers must remember env access is request-time — no `getEnv()` at module top-level.
