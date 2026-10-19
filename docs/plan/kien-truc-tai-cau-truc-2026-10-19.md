# Kiến trúc tái cấu trúc — "Học trước, mọi thứ khác phục vụ việc học"

Ngày: 19/10/2026 · Gốc: `master@5a42fc3` · Người đặt yêu cầu: Thuận · Người học/quản trị: BS. Minh (1 người).
Phạm vi: **tái cấu trúc, không đổi stack, không đổi invariant, không đổi mục tiêu học.** Đọc cùng `AGENTS.md`, `.agents/rules/english-mini-lms.md`, `docs/plan/lite-mvp-track.md`, `docs/plan/product-design.md`.

---

## 1. Mục tiêu

1. **Vào là học:** từ lúc mở app đến lúc đang làm bài ≤ 2 chạm (Hôm nay → Bắt đầu / Tiếp tục).
2. **Một vòng lặp học duy nhất, rõ ràng:** Ôn từ đến hạn → Bài chính → Nhận góp ý → Sửa lại → Lưu từ/lỗi → Tiến độ. Mỗi màn chỉ trả lời "bước kế tiếp là gì".
3. **Gọn:** 4 màn học (viết/đọc/nói/nghe) dùng chung một khung; 1 chỗ định nghĩa mode/màu/nhãn; 1 bộ contract API dùng chung cho server và client; UI dùng Tailwind + vài component dùng chung, hết `style={{}}` rải rác.
4. **Tin cậy:** không còn "trang trắng/500 khó hiểu", AI treo, hay bài IELTS mở sai màn. Lỗi nào cũng có thông báo tiếng Việt + đường thử lại.
5. **Dễ nạp bài:** BS. Minh tự thêm video/bài, duyệt, và thấy ngay bài đó ở Thư viện để học — không cần agent, không cần JSON.

Không làm (giữ nguyên Lite): Zalo/OpenClaw, worker/queue riêng, đổi framework/ORM/DB, thêm dependency ngoài stack.

---

## 2. Hiện trạng (đã đo trên `5a42fc3`)

| Vấn đề | Số liệu / bằng chứng | Hệ quả cho việc học |
|---|---|---|
| File quá lớn | 54 file > 200 dòng; 12 file > 560 dòng (`flashcards-view` 929, `drive-sync` 910, `assessment.service` 780, `today-view` 762, `reading-session-view` 745, `writing-session-view` 709…) | Sửa 1 chỗ dễ vỡ chỗ khác; agent/người khó nắm |
| 4 màn học lặp nhau | `learn/[sessionId]/{writing,reading,speaking,listening}-session-view.tsx` ~600–745 dòng, mỗi file tự làm timer, autosave, hint/reveal, wrap-up, capture | Hành vi lệch giữa các mode; sửa 1 lần phải sửa 4 lần |
| Mode IELTS không có màn riêng | `learn/[sessionId]/page.tsx` chỉ so `=== "reading" / "listening" / "speaking"`; còn lại rơi vào **WritingSessionView**; `session.service.ts` và `assessment.service.ts` cũng so mode thô thay vì `modeSkill()` | Bài `ielts-*` tạo được nhưng mở sai màn, bị chấm bằng evaluator viết |
| `retryAssessment` thiếu nhánh listening | `assessment.service.ts` ~dòng 520–530 | Chấm lại bài nghe ghi feedback rác |
| Gemini không có timeout thật | `GEMINI_TIMEOUT_MS` khai báo (`providers/gemini/client.ts`) nhưng không dùng; retry 1 lần cho mọi loại lỗi | Assessment kẹt `processing`, Vercel kill ở 60s |
| Style rải rác | ~448 `style={{`, ~19 `alert()/confirm()`, ~12 `as any / z.any()` | Giao diện lệch nhau, khó đổi theme |
| Contract API↔client lệch | Từng gây P0 (`media_id` vs `mediaId`, `/today` camel/snake) — xem `reports/code-review-2026-09-26.md` | Nút "Bắt đầu"/nộp bài hỏng im lặng |
| Không có error/loading boundary | Không có `error.tsx`, `global-error.tsx`, `loading.tsx` | Crash server component = trang lỗi mặc định khó hiểu |
| Auth rough edges | `login/page.tsx` không đọc `?error=auth_failed`; middleware redirect làm rơi cookie đã refresh; `today/page.tsx` không bắt lỗi `getCurrentLearner()`; Next 16 đã đổi convention `middleware` → `proxy` | "Không vô được LMS" khó chẩn đoán |
| Health endpoint lộ thông tin | `/api/v1/health` công khai trả `databaseUrlMasked` (vẫn lộ host/user), số learner, tên env | Rủi ro bảo mật; chỉ nên trả "ok" công khai |
| Test không hermetic | 12/21 file test cần `DATABASE_URL`; `npm test` đỏ khi không có env; `build` từng gãy khi thiếu env | Không chạy được CI/agent mới |
| Tài liệu rải | ~30 file trong `docs/plan/` (v2 + Lite + vá lỗi + M2/M3/UI-UX); hướng dẫn người dùng nằm rải | Không biết đâu là "sự thật hiện tại" |

> Lưu ý: nhiều lỗi trong `code-review-2026-09-26.md` đã được vá ở Vá 1–6/M3. **Agent phải xác minh lại từng mục trên code hiện tại trước khi sửa**, không sửa theo báo cáo cũ một cách mù quáng.

---

## 3. Kiến trúc sản phẩm (cái người học thấy)

### 3.1 Vòng lặp học

```text
        ┌────────────────────────── Hôm nay (hub) ──────────────────────────┐
        │  Tiếp tục bài dở  |  Bắt đầu 30' / 45'  |  Kế hoạch phiên + lý do   │
        └───────┬──────────────────────────────────────────────┬─────────────┘
                ▼                                              ▲
   (1) Ôn từ đến hạn  ≤5'                                      │
                ▼                                              │
   (2) Bài chính  15–22'   ──► Học (khung phiên dùng chung)    │
                ▼                                              │
   (3) Nộp ► AI chấm (có trạng thái) ► Góp ý Top-3 ưu tiên     │
                ▼                                              │
   (4) Sửa lại 8–12'  (bản 2, cạnh bản 1)                      │
                ▼                                              │
   (5) Lưu cụm từ/lỗi → vào Sổ từ & lịch ôn ──► Tiến độ ───────┘
```

Mọi gợi ý đều rule-based, **giải thích được** (hiện lý do), cho phép đổi bài (theo `product-design.md`).

### 3.2 Điều hướng (IA)

Giữ 5 tab chính, bớt rối:

| Tab | Route | Vai trò |
|---|---|---|
| Hôm nay | `/today` | Hub duy nhất: tiếp tục / bắt đầu / kế hoạch phiên / từ đến hạn |
| Thư viện | `/library` | Chủ đề → bài → chi tiết → Bắt đầu 30'/45' |
| Sổ từ | `/vocab` (+ `/vocab/flashcards`, `/vocab/review`) | Badge số từ đến hạn; đầu trang có thẻ "Ôn hôm nay" |
| Bài của tôi | `/my-work` | Bản đầu – góp ý – bản sửa |
| Tiến độ | `/progress` | Kỹ năng/lỗi/từ vựng; không vẽ xu hướng từ ít dữ liệu |

`Cài đặt`, `Hồ sơ/Onboarding`, `Quản trị` chuyển vào **menu "Tôi"** (avatar góc phải mobile; cuối sidebar desktop). `Quản trị` chỉ hiện khi `role=admin`. Route cũ giữ nguyên (không đổi URL) trừ khi ghi rõ; nếu đổi phải có `redirect` trong `next.config.ts`.

### 3.3 "Hôm nay" thành hub kế hoạch phiên

- Khối 1 — **Tiếp tục** (nếu có nháp/phiên dở) luôn trên cùng, 1 chạm.
- Khối 2 — **Kế hoạch phiên** theo thời lượng 30/45: `Ôn từ (≤5') → Bài chính → Sửa/vận dụng → Kết thúc`. Mỗi bước là deep-link, bỏ qua được, trạng thái suy ra từ dữ liệu hiện có (events/submissions/reviews hôm nay) — **không thêm bảng mới**.
- Hàm thuần `buildDailyPlan(context, targetMinutes): PlanStep[]` ở `src/server/today/` (mở rộng `pick-activity.ts`), có unit test (hermetic).
- Chỉ hiện streak khi > 0; không hiện mã kỹ thuật; empty state hướng dẫn bằng tiếng Việt (đã có hướng ở UI/UX đợt 1).

### 3.4 Khung phiên học dùng chung ("Học")

Một `SessionShell` lo mọi thứ không phụ thuộc kỹ năng; mỗi kỹ năng chỉ là một plugin.

**SessionShell chịu trách nhiệm:** header (tiêu đề, chip kỹ năng, đồng hồ + tạm dừng/tiếp tục), chỉ báo tự lưu, thang gợi ý (ghi `session_events` hint/reveal — `assisted` luôn do server tính), cảnh báo rớt mạng/thử lại, bôi đen → Smart Capture (mọi mode có văn bản), phím tắt, modal kết thúc phiên (gợi ý bước kế tiếp: "Sửa lại ngay"), bố cục 2 cột desktop / xếp dọc mobile với thanh hành động dính đáy (touch target ≥ 44px).

**Plugin theo kỹ năng** (đăng ký trong một registry duy nhất, tra bằng `modeSkill(mode)` — sửa gốc lỗi IELTS):

```ts
// src/features/session/modes/types.ts
export type Skill = "writing" | "reading" | "speaking" | "listening";

export interface ModePlugin {
  skill: Skill;
  Panel: React.ComponentType<ModePanelProps>;          // phần làm bài, không có chrome
  initialState(data: SessionData): ModeState;
  canSubmit(state: ModeState): { ok: boolean; reason?: string };
  buildSubmission(state: ModeState): SubmissionInput;   // kiểu từ src/contracts/submission.ts
}
// src/features/session/modes/registry.ts
export const MODE_REGISTRY: Record<Skill, ModePlugin>;
export function resolvePlugin(mode: string): ModePlugin;  // dùng modeSkill(); IELTS => cùng skill, thêm huy hiệu "IELTS"
```

Shadowing là chế độ con của `listening`. Hooks dùng chung: `useSessionTimer`, `useAutosaveDraft`, `useSessionEvents`, `useSubmit`, `useRecorder`.

`app/(main)/learn/[sessionId]/page.tsx` còn ~40 dòng: xác thực → lấy `SessionData` → `<SessionShell plugin={resolvePlugin(mode)} …/>`.

### 3.5 Vòng Góp ý → Sửa lại

`/my-work/[id]`: **Top-3 ưu tiên đứng đầu**, nút **"Sửa ngay"** (tạo bản mới `parent_id`, không UPDATE bài cũ), tab So sánh bản 1/bản 2 (xếp dọc trên mobile), trạng thái chờ chấm tự cập nhật, nút "Tôi không đồng ý" giữ nguyên, nút "Lưu cụm từ" từ góp ý.

### 3.6 Sổ từ & ôn tập

Một công cụ SRS duy nhất (`server/vocabulary`). **Quyết định chốt:** giữ dãy ôn **1-3-7-14-30** của code hiện tại (mastery 0–4, hiển thị "x/5"), cập nhật lại docs cho khớp; "partial" = chưa đạt (ôn sớm). Flashcard (quẹt) và ôn viết câu dùng chung bộ lập lịch; UI hiển thị một thang mastery thống nhất.

### 3.7 Nạp nội dung cho BS. Minh

Trang `/admin` → **Nội dung học** làm theo "trình hướng dẫn": (1) Nguồn: dán link YouTube + start/end giây; (2) Transcript: dán text, công cụ tự gợi ý định dạng `start|end|text` và báo dòng sai; (3) Câu hỏi: form (không viết JSON); (4) **Kiểm tra đủ điều kiện duyệt** (checklist tiếng Việt) → "Duyệt & đưa lên Thư viện" → nút "Xem trong Thư viện" / "Học thử ngay". Drive Sync mặc định chạy **Dry-run** trước. Nhãn trạng thái tiếng Việt (Nháp / Đang xét / Đã duyệt / Lưu trữ), không hiện enum thô.

---

## 4. Kiến trúc mã nguồn đích

```text
src/
  app/                         # chỉ route: page.tsx mỏng (auth → lấy dữ liệu → ghép), layout, loading, error, not-found
    (main)/{today,library,learn,my-work,vocab,progress,settings,onboarding,admin}/
    api/v1/**/route.ts         # withLearner/withAdmin → parse(schema) → service → map lỗi
    login/ auth/ page.tsx
  features/                    # UI + hook theo vùng; mỗi file ≤ 200 dòng (mềm), ≤ 250 (cứng)
    session/{shell/, modes/{writing,reading,speaking,listening}/, hooks/}
    today/ library/ my-work/ vocab/ progress/ admin/ settings/ onboarding/ auth/
  components/
    ui/                        # Button, Card, Badge, Modal, Toast, Skeleton, Spinner, EmptyState, Tabs, ConfirmDialog, icons.tsx
    layout/                    # AppNav (bottom/side), UserMenu, PageContainer, tour
  contracts/                   # zod schema + type DÙNG CHUNG route ⇄ client (session, submission, media, vocabulary, today, library, admin-content, common)
  server/                      # domain services (giữ tên thư mục hiện có)
    http/                      # withLearner, withAdmin, parseJson, apiError, mapServiceError
    learning/{session/, assessment/}   # assessment: buildInput → provider → persist → status; chia nhỏ file
    today/ library/ vocabulary/ progress/ admin/ media/ onboarding/ settings/ seed/
    providers/{gemini/, google-drive.ts}
  lib/                         # hàm thuần: modes.ts (MODE_META: màu/icon/nhãn Việt — NGUỒN DUY NHẤT), env.ts (zod, fail-fast), api-client.ts, content-*, topics, format
  db/                          # schema.ts, migrations/ (chỉ additive)
tests/{unit/, integration/}    # unit = hermetic (không cần env); integration = cần TEST_DATABASE_URL
content/english-lab/  scripts/  supabase/  docs/
```

### Quy tắc kỹ thuật bắt buộc

1. **Contracts dùng chung:** mọi body/response của `/api/v1` định nghĩa một lần ở `src/contracts/*` (zod), route dùng để parse, client dùng `lib/api-client.ts` (`apiFetch<T>(schema)`) để gọi. Cấm tự viết `fetch` với field name tay. Lỗi thống nhất `{ error: { code, message, fields? } }`; trong giai đoạn chuyển, client đọc được cả dạng cũ.
2. **Route handler mỏng:** `withLearner(handler)` lấy `learner_id` từ session (không nhận từ body), trả 401 JSON; `withAdmin` thêm kiểm role và **bao cả guard trong try/catch**. Business rule chỉ nằm trong `src/server/*`.
3. **Env:** `src/lib/env.ts` kiểm bằng zod, lỗi nêu **tên biến thiếu** bằng tiếng Việt. Không `throw` ở module top-level làm sập build; build phải chạy được khi không có `DATABASE_URL`.
4. **Ranh giới lỗi:** mỗi segment `(main)` có `loading.tsx` (skeleton), `error.tsx` (thông báo Việt + nút Thử lại + nút Về Hôm nay), thêm `global-error.tsx`, `not-found.tsx`. `today/page.tsx` bắt lỗi `getCurrentLearner()`.
5. **AI độ tin cậy:** bọc mọi call Gemini bằng `AbortSignal.timeout(GEMINI_TIMEOUT_MS)`; chỉ retry khi lỗi **JSON/schema**, **không** retry lỗi mạng/429/timeout; có "sweeper" chuyển `processing` quá hạn → `failed` (bài vẫn được nộp, có nút Chấm lại); `retryAssessment` chặn theo trạng thái, giới hạn số lần, đúng `mimeType`, **có nhánh listening**; shadowing ghi `usage_events`.
6. **Styling:** Tailwind v4 với token trong `globals.css` (`@theme`), component ở `components/ui`. Mục tiêu `style={{` ≤ 30 (chỉ giá trị động như độ rộng thanh tiến độ). Thay `alert/confirm` bằng `Toast/ConfirmDialog`. Hết `as any/z.any()` trừ trường JSONB có comment lý do. **Không cài shadcn/lucide/thư viện mới**; icon là SVG nội bộ trong `components/ui/icons.tsx`. Màu lấy từ token teal hiện có; **không** dùng font "Baloo 2 + Comic Neue" trong `design-system/english-mini-lms/MASTER.md` (phong cách trẻ em, không hợp người học là bác sĩ) — giữ font hệ thống hiện tại.
7. **A11y/mobile:** touch ≥ 44px, chữ nội dung ≥ 16px, `aria-label` cho nút icon, focus ring, `prefers-reduced-motion`, tương phản đủ.
8. **Test tách đôi:** `tests/unit` (hermetic, mock DB/Gemini) chạy bởi `npm test`; `tests/integration` chạy bởi `npm run test:integration`, **chỉ** dùng `TEST_DATABASE_URL`. **Cấm** dùng `DATABASE_URL` production cho test. Mỗi service/hook mới có ≥ 1 test cho invariant của nó.
9. **Dữ liệu:** KHÔNG đổi/xóa cột/bảng có dữ liệu. Nếu cần migration: additive, `IF NOT EXISTS`, bằng `drizzle-kit generate`. Mặc định của đợt này là **không cần migration mới**.
10. **Next.js 16:** đọc đúng guide trong `node_modules/next/dist/docs/` trước khi đổi `middleware.ts` → `proxy.ts`, API `params/searchParams` async, caching. Không dựa trí nhớ cũ.
11. **Bảo mật:** `/api/v1/health` công khai chỉ trả `{ status, time }`; chi tiết env/DB/migration chỉ cho admin (route riêng, đã xác thực, không lộ host/user/learner count). Không log/commit secret. Giữ nguyên toàn bộ invariant của `.agents/rules/english-mini-lms.md` (append-only, assisted server-side, not_assessable, không "official band", y khoa, RLS).

---

## 5. Danh sách lỗi phải xử lý cùng đợt (xác minh lại trước khi sửa)

| # | Việc | Gợi ý vị trí | Owner |
|---|---|---|---|
| 1 | Routing mode IELTS đúng skill ở UI + server + chấm | `learn/[sessionId]/page.tsx`, `session.service.ts`, `assessment.service.ts` | A2 / B8 |
| 2 | `retryAssessment` nhánh listening, guard trạng thái, giới hạn, mimeType | `assessment.service.ts` | B8 |
| 3 | Timeout + retry policy Gemini + sweeper `processing` | `providers/gemini/*`, `assessment.service.ts` | B8 |
| 4 | Login đọc `?error`, thông báo Việt; magic-link PKCE gợi ý "mở bằng trình duyệt chính" | `login/page.tsx` | B9 |
| 5 | Middleware giữ cookie khi redirect; đổi sang `proxy.ts` | `lib/supabase/middleware.ts`, `src/middleware.ts` | B9 |
| 6 | Health công khai tối giản + health admin chi tiết | `api/v1/health/route.ts` | B9 |
| 7 | `guardAdmin()` ngoài try/catch ở route admin | `api/v1/admin/**` | A0 (helper) / B5 |
| 8 | `today/page.tsx` bắt lỗi; `error.tsx`/`loading.tsx` mọi segment | `app/**` | A0 / B3 |
| 9 | Lưu ý bài "Nháp" không hiện Thư viện → wizard có bước duyệt + "Xem trong Thư viện" | `features/admin` | B5 |
| 10 | Thống nhất thang mastery x/5, SRS 1-3-7-14-30, "partial" | `server/vocabulary`, `features/vocab` | B7 |
| 11 | Rà lại các P0/P1 của `code-review-2026-09-26.md` còn tồn tại (transcript lộ trước nộp, PATCH submissions chỉ cho `confirmed_transcript`, regex đáp án nghe, duration/body limit, role mặc định…) và vá nếu còn | nhiều nơi | B2/B6/B8 |
| 12 | `RUNBOOK.md` SQL sai tên cột `usage_events` | `docs/RUNBOOK.md` | C3 |

---

## 6. Kế hoạch giao việc cho đội agent (15 agent, 3 làn)

**Nguyên tắc chung:** mỗi agent sở hữu **thư mục riêng** (cột "Sở hữu"); file dùng chung (`package.json`, `globals.css`, `AGENTS.md`, `src/db/schema.ts`, `next.config.ts`, `bottom-nav`/layout) chỉ **một** agent được sửa như ghi. Cần sửa ngoài vùng → nhắn lead, không tự sửa.

### Làn 0 — Nền móng (chạy song song, merge trước)

| Agent | Nhiệm vụ | Sở hữu | Xong khi |
|---|---|---|---|
| **A0 Foundation** | `src/contracts/*` (khung + `common`), `src/server/http/*` (withLearner/withAdmin/parseJson/apiError), `src/lib/env.ts`, `src/lib/api-client.ts`, `error.tsx/loading.tsx/not-found/global-error` mẫu, tách vitest `unit`/`integration`, script npm (`test`, `test:integration`, `typecheck`, `lint`) | `src/contracts`, `src/server/http`, `src/lib/{env,api-client}.ts`, `vitest.config.ts`, `package.json` scripts, `tests/{unit,integration}` khung | `npm test` xanh khi **không** có env; build chạy khi không có `DATABASE_URL` |
| **A1 Design-system & Layout** | `components/ui/*` (+ icons), token `@theme` trong `globals.css`, `lib/modes.ts` (MODE_META duy nhất), `components/layout/*` (AppNav có badge từ đến hạn, UserMenu, PageContainer), `(main)/layout.tsx` | `src/components/**`, `src/app/globals.css`, `src/lib/modes.ts`, `src/app/(main)/layout.tsx` | Mọi primitive có story kiểm tay trong trang tạm; không còn `alert/confirm` trong `components/` |
| **A2 Session-core** | `features/session/shell/*`, `hooks/*`, `modes/types.ts`, `modes/registry.ts`, port **writing** làm mẫu, `page.tsx` học ~40 dòng, sửa routing IELTS | `src/features/session/{shell,hooks}`, `modes/{types,registry}.ts`, `modes/writing`, `app/(main)/learn/**/page.tsx` | Bài writing & `ielts-writing` chạy trọn vòng (làm → lưu nháp → nộp → góp ý) qua shell mới |

### Làn 1 — Tính năng (song song sau khi A0+A1 merge; B1/B2 chờ thêm A2)

| Agent | Nhiệm vụ | Sở hữu |
|---|---|---|
| **B1 Reading + Speaking** | Port 2 mode vào plugin; ghi âm (`useRecorder`), Smart Capture, bỏ nội dung đọc giả "Trang 42"; speaking text-only → `not_assessable` | `features/session/modes/{reading,speaking}` |
| **B2 Listening + Shadowing** | Port listening/shadowing; YouTube player; transcript chỉ mở sau nộp/reveal (server trả có điều kiện); sửa regex đáp án | `features/session/modes/listening`, `server/learning/listening-questions.ts`, `lib/listening-questions.ts` |
| **B3 Today + Progress** | Hub Hôm nay (Tiếp tục, `buildDailyPlan`, từ đến hạn), tách `today-view`; Progress gọn | `features/{today,progress}`, `server/{today,progress}`, `app/(main)/{today,progress}` |
| **B4 Library** | Chủ đề → bài → chi tiết; nút Bắt đầu 30/45; "Gợi ý"; chỉ approved | `features/library`, `server/library`, `app/(main)/library` |
| **B5 Admin & Content** | Wizard nạp bài (YouTube/transcript/câu hỏi/duyệt), nhãn Việt, Drive Sync (dry-run mặc định, tách `drive-sync.ts` 910 dòng), dashboard gọn, `guardAdmin` an toàn | `features/admin`, `server/admin`, `app/(main)/admin`, `app/api/v1/admin/**` |
| **B6 My-work (Góp ý→Sửa)** | Top-3, "Sửa ngay", So sánh dọc mobile, trạng thái chấm tự cập nhật, flag; PATCH submissions chỉ `confirmed_transcript` | `features/my-work`, `app/(main)/my-work`, `app/api/v1/{submissions,feedback}` |
| **B7 Vocab & SRS** | Hợp nhất lập lịch SRS, thang mastery x/5, tách `flashcards-view` 929 dòng, `vocab-list`, quick-capture, YouGlish | `features/vocab`, `server/vocabulary`, `app/(main)/vocab`, `app/api/v1/vocabulary` |
| **B8 Assessment & AI** | Pipeline chấm chia file (`buildInput→provider→persist→status`), timeout/retry/sweeper, `retryAssessment`, `usage_events` cho shadowing, giữ invariant | `server/learning/assessment/**`, `server/providers/gemini/**`, `app/api/v1/{assessments,sessions}` |
| **B9 Auth, Settings, Onboarding, Health** | Login (lỗi Việt, magic-link), `proxy.ts` + cookie, health tối giản + admin, tách `settings-view`, onboarding, PWA icon/manifest/sw kiểm lại | `app/{login,auth}`, `src/proxy.ts`, `lib/supabase/**`, `features/{auth,settings,onboarding}`, `app/(main)/{settings,onboarding}`, `app/api/v1/{health,settings,onboarding}`, `public/` |

### Làn 2 — Hoàn thiện & kiểm chứng (sau khi Làn 1 merge)

| Agent | Nhiệm vụ | Sở hữu |
|---|---|---|
| **C1 QA end-to-end** | Chạy dev server, dùng browser tool đi **mọi luồng** ở viewport 390px và 1280px: đăng nhập → Hôm nay → mỗi kỹ năng (kể cả `ielts-*`) → nộp → góp ý → sửa → lưu từ → ôn → Tiến độ; admin thêm bài → duyệt → thấy ở Thư viện → học. Chụp màn hình, ghi lỗi, **sửa lỗi nhỏ** hoặc trả lại agent sở hữu | `docs/plan/reports/qa-2026-10-19/` (ảnh + bảng) |
| **C2 Tests & CI** | Bù test hermetic cho invariant (append-only, assisted, not_assessable, không official band, routing mode, daily plan, SRS, http helpers, contracts); gắn nhãn integration; workflow `/.github/workflows/ci.yml` (lint, typecheck, test, build — không cần secret) | `tests/**`, `.github/workflows/` |
| **C3 Docs & Handover** | `docs/README.md` (mục lục "sự thật hiện tại"), cập nhật `AGENTS.md`/`README.md`/`.agents/rules` theo cấu trúc mới, sửa `RUNBOOK.md`, cập nhật `docs/huong-dan-lms-2026-10-14.md` theo UI mới, ADR ngắn cho các quyết định mục 7, ghi **báo cáo** `docs/plan/reports/refactor-report-2026-10-19.md` | `docs/**`, `AGENTS.md`, `README.md`, `.agents/**` |

(Reviewer độc lập: Thuận sẽ nhờ agent khác pull và review sau khi bạn báo xong — không cần tự làm.)

### Quy trình Git (bắt buộc)

- Lead tạo nhánh tích hợp `refactor/learning-first-2026-10-19` **từ `master@5a42fc3`** bằng `git worktree` riêng (không checkout trong thư mục chính — thư mục chính đang có file chưa commit của Thuận: sửa `docs/plan/huong-dan-sua-loi-va-trien-khai.md` và các file docs/ảnh mới. **Không xóa, không ghi đè, không `git checkout .`/`git clean` trong thư mục chính**).
- Commit đầu tiên trên nhánh tích hợp: copy file kiến trúc này vào `docs/plan/kien-truc-tai-cau-truc-2026-10-19.md`.
- Mỗi agent làm trong worktree + nhánh riêng `refactor/<tên-agent>`; commit nhỏ, message `refactor(<vùng>): …`; chỉ báo xong khi `lint + typecheck + unit test` của vùng mình xanh.
- Lead merge `--no-ff` vào nhánh tích hợp theo thứ tự làn 0 → 1 → 2, **chạy `/verify` sau mỗi merge**; xung đột → trả cho agent sở hữu.
- **Không push lên `master`** (Vercel deploy từ master, BS. Minh đang dùng bản production). Cuối cùng `git push origin refactor/learning-first-2026-10-19`, **không** tự merge vào master.
- **Không chạy migration/seed/script nào lên DB production.** Không in/commit secret. Máy này không có `.env.local`; test tích hợp chỉ chạy nếu có `TEST_DATABASE_URL`, nếu không thì **ghi rõ "chưa chạy"** trong báo cáo — không giả vờ pass.

---

## 7. Quyết định đã chốt (agent không cần hỏi lại)

| # | Quyết định |
|---|---|
| D-1 | Không thêm dependency mới (không shadcn, lucide, playwright, swr…). Icon = SVG nội bộ. |
| D-2 | SRS 1-3-7-14-30; mastery 0–4 hiển thị "x/5"; "partial" = chưa đạt, ôn sớm. |
| D-3 | Giữ URL các route hiện có; chỉ thêm menu "Tôi" và badge. |
| D-4 | IELTS = cùng 4 kỹ năng + huy hiệu "IELTS"; vẫn `practice_estimate`, tuyệt đối không "official band". |
| D-5 | Kế hoạch phiên không tạo bảng/cột mới (suy ra từ dữ liệu có). |
| D-6 | Font hệ thống hiện tại; lấy màu từ token teal trong `globals.css`; bỏ qua phần font/phong cách trẻ em của `MASTER.md`. |
| D-7 | `/api/v1/health` công khai tối giản; chi tiết chỉ admin. |
| D-8 | Test: unit hermetic mặc định; integration chỉ `TEST_DATABASE_URL`. |

Ghi chú các điểm Thuận có thể muốn đổi sau khi xem báo cáo: IELTS Academic hay General (I-W2 vẫn để trống), có thêm e2e tự động (Playwright) hay không, có đổi tên tab "Sổ từ" thành "Ôn tập" hay không.

---

## 8. Tiêu chí "xong" của cả đợt

1. `npm run lint`, `npm run typecheck`, `npm test` (unit), `npm run build` **đều xanh khi không có `.env.local`**; báo cáo ghi rõ test integration đã chạy hay chưa.
2. Không file nguồn nào > 250 dòng (trừ `src/db/schema.ts`, migrations, file sinh tự động); `style={{` ≤ 30; 0 `alert/confirm`; `as any/z.any()` còn lại đều có comment lý do.
3. Mỗi kỹ năng và **mỗi biến thể `ielts-*`** mở đúng màn, nộp được, nhận góp ý đúng loại; speaking text-only → `not_assessable`; xem đáp án trước nộp → `assisted`.
4. Từ mở app đến đang làm bài ≤ 2 chạm (đo bằng QA ở C1, ghi số chạm).
5. Thêm một bài nghe YouTube mới trong admin → duyệt → thấy ở Thư viện → học được, không viết JSON/không dùng terminal.
6. Mất env/DB/Gemini → người dùng thấy thông báo tiếng Việt có nút thử lại (không trang trắng); health công khai không lộ thông tin.
7. Ảnh QA 390px + 1280px cho: Hôm nay, Thư viện, 4 màn học, Góp ý/So sánh, Sổ từ/Flashcard, Tiến độ, Admin nạp bài, Đăng nhập.
8. Mọi invariant trong `.agents/rules/english-mini-lms.md` còn test bảo vệ và pass.
9. Tài liệu cập nhật (C3) và có `refactor-report-2026-10-19.md`: bảng agent → thay đổi → test → chưa xong/rủi ro, kèm danh sách việc Thuận/BS. Minh phải làm tay (vd. chạy migration trên production nếu có, kiểm Supabase, redeploy).
