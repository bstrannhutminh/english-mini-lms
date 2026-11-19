# ADR 0002: Shared zod contracts in src/contracts/

- Status: accepted
- Date: 2026-10-19

## Context

API request/response shapes were defined separately on the server (inline parsing in route handlers) and on the client (hand-typed `fetch` payloads with hand-written field names). Drift between the two had already caused P0 incidents: `media_id` vs `mediaId` mismatches, and camelCase/snake_case divergence on `/today` that silently broke the "Bắt đầu" (start session) and submit buttons. There was no compile-time or runtime check that the two sides agreed.

## Decision

Create `src/contracts/` as the single source of truth for every `/api/v1` body and response:

- One zod schema per domain file (`session.ts`, `submission.ts`, `media.ts`, `vocabulary.ts`, `today.ts`, `progress.ts`, `library.ts`, `admin-content.ts`, `admin-dashboard.ts`, `settings.ts`, `onboarding.ts`, `common.ts`), re-exported via `src/contracts/index.ts`.
- Route handlers validate with `parseJson(schema)` from `src/server/http/`; responses conform to the same schema.
- Clients call through `apiFetch<T>(schema)` in `src/lib/api-client.ts`, which validates the response against the contract and normalises errors into `ApiClientError`.
- Unified error envelope: `{ error: { code, message, fields? } }`. `apiFetch` still understands the legacy `{ error: "..." }` shape so routes can migrate incrementally.
- Hand-written `fetch` calls with manually typed field names are forbidden for `/api/v1`.

## Consequences

- Field-name drift becomes a zod error surfaced in development, not a silent production failure.
- Both sides of an endpoint change in one file; TypeScript propagates the type to client and server.
- Slight duplication is accepted in favour of clarity (camel/snake documented per schema) to match existing payloads.
