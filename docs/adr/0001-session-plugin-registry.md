# ADR 0001: Session plugin registry (SessionShell + MODE_REGISTRY + modeSkill)

- Status: accepted
- Date: 2026-10-19

## Context

Four learning screens (`writing`, `reading`, `speaking`, `listening`) were implemented as four near-duplicate view files (~600–750 lines each), each re-implementing timer, autosave, hint/reveal, wrap-up and Smart Capture. Mode dispatch used raw string comparisons (`mode === "reading"` …) in `learn/[sessionId]/page.tsx`, `session.service.ts` and `assessment.service.ts`. Anything not matching the three hard-coded modes — notably every `ielts-*` mode — fell through to `WritingSessionView`, so IELTS sessions opened the wrong screen and were graded by the writing evaluator.

## Decision

Split session UI into one shared `SessionShell` plus per-skill plugins:

- `src/features/session/shell/` owns everything skill-agnostic: header, timer, autosave indicator, hint rail (writes `session_events`), offline warning, Smart Capture, hotkeys, wrap-up modal, responsive layout.
- `src/features/session/modes/{writing,reading,speaking,listening}/` each export a `ModePlugin` (`Panel`, `initialState`, `canSubmit`, `buildSubmission`). Listening includes the shadowing sub-mode.
- `modes/registry.ts` exposes `MODE_REGISTRY` and `resolvePlugin(mode)`, which resolves the mode through `modeSkill()` (`src/lib/modes.ts` — the single place that strips the `ielts-` prefix) so `ielts-*` modes land on the same skill plugin with an `isIelts` flag for the badge.
- Server code uses the same `modeSkill()` helper instead of raw comparisons (assessment, retry, session services).
- Shared hooks (`useSessionTimer`, `useAutosaveDraft`, `useSessionEvents`, `useSubmit`, `useRecorder`) live in `features/session/hooks/`.

## Consequences

- The `ielts-*` fallthrough bug is fixed at the root — unknown modes return `null` and are rejected explicitly instead of silently opening the writing view.
- A fix to timer/autosave/hint behaviour now happens once, in the shell, not four times.
- `learn/[sessionId]/page.tsx` shrank to ~40 lines: auth → load `SessionData` → render shell with the resolved plugin.
- New skills = new plugin + registry entry; routing needs no `if/else` edits.
