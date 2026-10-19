# QA Report — E2E browser QA (agent C1) — 2026-10-19

Worktree: `english-mini-lms-wt/integration` · branch `refactor/learning-first-2026-10-19`
App: Next.js 16.3.6 (Turbopack), `npm run dev` on port **3001** (port 3000 held by an unrelated pre-existing process, pid 9079).
Browser: Playwright 1.64.1 / Chromium headless (npx cache, no deps added).
Viewports: mobile **390×844**, desktop **1280×800**.

## Test matrix — scenarios

- **S1 — no env at all**: `env -i PATH HOME npm run dev` (no DATABASE_URL / Supabase / GEMINI / DEV_BYPASS_AUTH).
- **S2 — fake Supabase env, no bypass**: `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9` (dead port → instant ECONNREFUSED), `ANON_KEY=qa-fake`. Used to exercise the proxy auth path that is skipped when Supabase env is absent.
- **S3 — fake Supabase env + `DEV_BYPASS_AUTH=true`**: partial-config scenario; Supabase client constructs, auth bypass active, DATABASE_URL still missing.
- **S4 — only `DEV_BYPASS_AUTH=true`** (no other env): the literal checklist scenario for item 5.

## Results — flow × viewport

| # | Flow | Scenario | 390px | 1280px | Notes |
|---|------|----------|-------|--------|-------|
| 1 | `npm run dev` boots | S1 | — | — | PASS — `Ready in 808ms`, no crash |
| 2 | `GET /api/v1/health` | S1 | — | — | PASS — returns ONLY `{status,time}` (output below) |
| 3 | `/login` | S1 | PASS | PASS | Vietnamese login form (email + password + magic link) |
| 4 | `/ui-preview` | S1 | PASS | PASS | Full design-system gallery, Vietnamese labels |
| 5 | `/today` | S3 | PASS | PASS | In-shell VI error: "Chưa tải được dữ liệu học tập" |
| 5 | `/library` | S3 | PASS | PASS | In-shell VI error: "Có lỗi xảy ra" + digest |
| 5 | `/vocab` | S3 | PASS | — | In-shell VI error screen |
| 5 | `/progress` | S3 | PASS | — | In-shell VI error: "Chưa tải được tiến độ học tập" |
| 5 | `/settings` | S3 | **FAIL*** | — | Renders LOGIN page, not error state — see Bug B2 |
| 5 | `/admin` | S3 | PASS | — | In-shell VI error screen |
| 5b | `/today`,`/library`,`/vocab`,`/progress`,`/settings`,`/admin` | S4 | PASS (all) | PASS (today+library) | Uniform root VI error boundary ("Có lỗi xảy ra", digest `3403729697`) — no white screen, no raw stack |
| 6 | `/learn/any-id` | S1/S3 | PASS | PASS | VI error boundary (route exists: `(main)/learn/[sessionId]`) |
| 7 | `/today` unauthenticated | S2 | — | — | PASS — `307 → /login`; `/api/v1/today` → `401 {code:"unauthorized", message:"Chưa đăng nhập — vui lòng đăng nhập lại."}` |
| 7b | `/today` unauthenticated | S1 (no env) | PASS | — | 200 + VI error screen, NOT redirect — intentional pass-through (`session-proxy.ts:23-28`) |
| 8 | `/sw.js` | S1 | — | — | PASS — 200 `application/javascript` |
| 8 | `/manifest.json` | S1 | — | — | PASS — 200, valid PWA manifest |
| 8 | `/icons/icon-192.svg`, `/icons/icon-512.svg` | S1 | — | — | **FAIL — 404 both** (see Bug B1) |
| 9 | Console / hydration | all | PASS | PASS | No hydration errors, no client crashes. Only expected forwarded RSC error logs |

## Health endpoint (verified)

```
$ curl -s http://localhost:3001/api/v1/health
{"status":"ok","time":"2026-10-19T03:47:04.101Z"}
```

Exactly two keys — `status`, `time`. No DB/env/host details. `Cache-Control: no-store`. ✓ (`src/app/api/v1/health/route.ts`)

## Bugs found

### B1 — PWA icons + favicon 404 (medium)

- `public/icons/` does not exist; `manifest.json` references `/icons/icon-192.svg`, `/icons/icon-512.svg`; root layout metadata also emits `<link rel="icon">` + `apple-touch-icon` to those paths.
- Repro: `curl -sI http://localhost:3001/icons/icon-192.svg` → `404`. Same for 512 and `/favicon.ico`.
- Impact: PWA install icon broken, browser tab icon missing.
- Fix: add the two SVGs under `public/icons/` (and a favicon).

### B2 — `/settings` + `/onboarding` bounce to /login on backend failure (low–medium)

- `src/app/(main)/settings/page.tsx:10-12` and `src/app/(main)/onboarding/page.tsx:9-11` do `getCurrentLearner().catch(() => null)` then `redirect("/login")` — conflates *unauthenticated* with *backend down*.
- Repro (S3): open `/settings` with DEV_BYPASS_AUTH + missing DATABASE_URL → login page renders (screenshot `settings-error-390.png` is byte-identical to `login-390.png`).
- Sibling pages (`/today`, `/progress`) instead show a Vietnamese retry screen. An authed user hitting a transient DB error gets silently logged out to /login — wrong UX and inconsistent.
- Note: under S4 (Supabase env also missing) the layout throws first, so `/settings` does show the error boundary — the bug only surfaces in the partial-config path.

### B3 — observation, not a bug

- With Supabase env entirely absent, unauthenticated `/today` does NOT redirect to /login; proxy deliberately passes through (`session-proxy.ts:23-28`) and the root error boundary renders. Verified redirect DOES work once Supabase env is present (S2 → 307). Documented design — flagging only because the checklist expected a redirect.

## Console errors

- No hydration errors, no unhandled client exceptions, no missing-chunk errors.
- Expected handled errors forwarded to console by React in dev: `EnvError: Thiếu hoặc sai biến môi trường: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY` (S1/S4) and `Error: DATABASE_URL is not set. Vui lòng kiểm tra file .env.local.` (S3) — all caught by error boundaries; UI stays Vietnamese.
- Raw capture: `console-log-enverror.json` (S4 run; S3 console data is summarised above — same pattern, DB error instead of env error).

## Extra spot-checks (beyond checklist)

| Route | Result |
|-------|--------|
| `/` | redirects → `/today` → VI error screen (S1) |
| `/api/v1/vocabulary` (S3, authed-bypass, no DB) | `503 {"error":{"code":"service_unavailable","message":"Hệ thống đang bảo trì hoặc chưa cấu hình đầy đủ. Vui lòng thử lại sau."}}` — VI ✓ |
| `/my-work`, `/vocab/flashcards`, `/vocab/review`, `/library/abc`, `/my-work/xyz` (S3) | all in-shell VI error screens |
| `/nonexistent-route-xyz` | 404 + VI "Không tìm thấy trang" not-found ✓ |

## Artifacts

Screenshots (naming `{flow}-{width}.png`; `-error` = S3 in-shell error, `-enverror` = S4 root error, `-noenv-unauth` = S1):

```
login-390.png  login-1280.png
ui-preview-390.png  ui-preview-1280.png
today-noenv-unauth-390.png
today-error-390.png  today-error-1280.png
library-error-390.png  library-error-1280.png
vocab-error-390.png  progress-error-390.png
settings-error-390.png  admin-error-390.png
today-enverror-390.png  today-enverror-1280.png
library-enverror-390.png  library-enverror-1280.png
vocab-enverror-390.png  progress-enverror-390.png
settings-enverror-390.png  admin-enverror-390.png
learn-any-id-390.png  learn-any-id-1280.png
```

Helpers (repro): `capture.mjs` (screenshot+console), `innertext.mjs` (DOM text dump), `spec-*.json` (run specs), `console-log-enverror.json`.

## Verdict

**9/10 checklist items pass** (item 8 partially fails on missing icons). 1 real bug (B1) + 1 UX inconsistency (B2). Error handling under missing env is otherwise solid: every route fails into Vietnamese UI — no white screens, no raw English stack traces. Dev server killed after run.
