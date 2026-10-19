# Báo cáo tái cấu trúc "Học trước" — English Mini LMS

---
date: 2026-10-19
branch: refactor/learning-first-2026-10-19 (gốc master@5a42fc3)
spec: docs/plan/kien-truc-tai-cau-truc-2026-10-19.md
status: DRAFT — lead điền số liệu verify sau khi chạy /verify trên nhánh tích hợp
---

> **DRAFT.** Các ô đánh dấu `<<điền khi lead verify>>` chờ kết quả lint/typecheck/test/build/QA trên nhánh tích hợp. Bảng agent đã điền theo summary từng agent.

## 1. Mục tiêu (tóm tắt)

Tái cấu trúc không đổi stack/invariant/mục tiêu học: (1) vào là học ≤ 2 chạm, (2) một vòng lặp học duy nhất, (3) 4 màn học dùng chung `SessionShell` + plugin registry, (4) contracts zod dùng chung route ⇄ client, (5) lỗi nào cũng có thông báo tiếng Việt + đường thử lại, (6) admin wizard để BS. Minh tự nạp bài. Chi tiết: `kien-truc-tai-cau-truc-2026-10-19.md` mục 1.

## 2. Bảng agent → thay đổi chính

| Agent | Vùng | Thay đổi chính | Test đi kèm | Chưa xong / ghi chú |
|---|---|---|---|---|
| **A0 Foundation** | `src/contracts`, `src/server/http`, `src/lib/{env,api-client}`, error boundaries, vitest split | Bộ contracts zod dùng chung; helpers `withLearner/withAdmin/parseJson/apiError/mapServiceError`; env lazy-init (build chạy không cần env); `error/loading/not-found/global-error` mẫu; tách `vitest.unit` / `vitest.integration` | `tests/unit/contracts`, `tests/unit/lib` | <<điền khi lead verify>> |
| **A1 Design-system** | `globals.css`, `src/lib/modes.ts`, `src/components/{ui,layout}` | Token `@theme` + skill colors; `MODE_META`/`modeSkill` nguồn duy nhất; UI kit (Button, Card, Badge, Modal, Toast, Skeleton, EmptyState, Tabs, ConfirmDialog, icons nội bộ); AppNav + UserMenu + badge từ đến hạn; trang ui-preview | <<điền khi lead verify>> | — |
| **A2 Session-core** | `src/features/session/{shell,hooks,modes}`, `learn/[sessionId]/page.tsx` | `SessionShell` (timer, autosave, hint rail, offline, Smart Capture, hotkeys, wrap-up); `MODE_REGISTRY` + `resolvePlugin(modeSkill)` — sửa gốc lỗi `ielts-*` mở sai màn; port plugin writing làm mẫu; page.tsx ~40 dòng | `tests/unit/session-modes` | — |
| **B1 Reading+Speaking** | `features/session/modes/{reading,speaking}` | Plugin reading (passage, hint) + speaking (recorder, text-only → `not_assessable`) | `tests/unit/session-modes/{reading,speaking}-plugin` | — |
| **B2 Listening+Shadowing** | `features/session/modes/listening`, `server/learning/listening-questions`, `lib/listening-*` | Plugin listening + chế độ con shadowing; YouTube player; transcript chỉ mở sau nộp/reveal; sửa emit⇄parse đáp án nghe | `tests/unit/listening` | — |
| **B3 Today+Progress** | `features/{today,progress}`, `server/{today,progress}` | Hub Hôm nay (Tiếp tục, kế hoạch phiên, từ đến hạn); hàm thuần `buildDailyPlan`; tách `today-view`; Progress gọn | `tests/unit/today-and-progress` | — |
| **B4 Library** | `features/library`, `server/library` | Chủ đề → bài → chi tiết → Bắt đầu 30'/45'; "Gợi ý"; tách service library | `tests/unit/library` | — |
| **B5 Admin & Content** | `features/admin`, `server/admin`, `api/v1/admin/**` | Wizard nạp bài 4 bước (nguồn → transcript → câu hỏi → duyệt) tiếng Việt; nhãn trạng thái Việt; Drive Sync dry-run mặc định + tách `drive-sync` thành modules; routes qua `withAdmin` | `tests/unit/admin` | — |
| **B6 My-work** | `features/my-work`, `api/v1/{submissions,feedback}` | Góp ý Top-3, "Sửa ngay" (append-only `parent_id`), so sánh dọc mobile, trạng thái chấm tự cập nhật, flag; PATCH chỉ `confirmed_transcript` | `tests/unit/my-work` | — |
| **B7 Vocab & SRS** | `features/vocab`, `server/vocabulary` | Hợp nhất lập lịch SRS **1-3-7-14-30**, mastery x/5, "partial" = chưa đạt; tách `flashcards-view` 929 dòng; quick-capture, YouGlish | `tests/unit/vocab` | — |
| **B8 Assessment & AI** | `server/learning/assessment/**`, `server/providers/gemini/**`, `api/v1/{assessments,sessions}` | Pipeline chấm chia file (buildInput → provider → persist → status); Gemini timeout thật + retry chỉ lỗi JSON/schema; sweeper `processing`→`failed`; `retryAssessment` đủ nhánh listening + guard trạng thái/giới hạn/mimeType; `modeSkill` server-side; `usage_events` cho shadowing; limits | `tests/unit/assessment`, `tests/unit/providers` | — |
| **B9 Auth, Health, PWA** | `src/proxy.ts`, `lib/supabase/**`, `features/{auth,settings,onboarding}`, `api/v1/{health,admin/health,settings,onboarding}`, `public/` | `middleware.ts` → `proxy.ts` (Next 16) + giữ cookie khi redirect; login đọc `?error` thông báo Việt + magic-link; health công khai tối giản + `/api/v1/admin/health` chi tiết; tách settings; onboarding; PWA icons/manifest/sw | `tests/unit/auth`, `tests/unit/settings` | — |
| **C1 QA end-to-end** | `docs/plan/reports/qa-2026-10-19/` | Đi mọi luồng 390px + 1280px, chụp màn hình, sửa lỗi nhỏ | — | <<điền khi lead verify: số luồng pass/fail>> |
| **C2 Tests & CI** | `tests/**`, `.github/workflows/ci.yml` | Bù test invariant; workflow lint+typecheck+test+build không cần secret | — | <<điền khi lead verify>> |
| **C3 Docs & Handover** | `docs/**`, `AGENTS.md`, `README.md`, `.agents/rules` | Mục lục `docs/README.md`; cập nhật AGENTS/README/rules theo cấu trúc mới; RUNBOOK (env, deploy, health, sửa SQL `usage_events`); ADR 0001–0004; báo cáo này | — | `docs/huong-dan-lms-2026-10-14.md` không tồn tại trong repo → bỏ qua phần cập nhật theo spec; cần lead xác nhận |
| **Lead cleanup** | toàn repo | Xoá view legacy `*-session-view`, tách shared components, hoàn tất migrate `apiFetch` | — | <<điền khi lead verify>> |

## 3. Kết quả kiểm chứng (verify trên nhánh tích hợp)

| Kiểm tra | Lệnh | Kết quả |
|---|---|---|
| Lint | `npm run lint` | <<điền khi lead verify>> |
| Typecheck | `npm run typecheck` | <<điền khi lead verify>> |
| Unit test (không env) | `npm test` | <<điền khi lead verify>> |
| Build (không env) | `npm run build` | <<điền khi lead verify>> |
| Integration test | `npm run test:integration` (cần `TEST_DATABASE_URL`) | <<điền khi lead verify — nếu chưa chạy ghi rõ "chưa chạy", không ghi pass>> |
| File > 250 dòng | — | <<điền khi lead verify>> |
| `style={{` ≤ 30 · 0 `alert/confirm` · `as any` có comment | — | <<điền khi lead verify>> |
| Mỗi mode + `ielts-*` mở đúng màn | QA C1 | <<điền khi lead verify>> |
| Mở app → đang làm bài ≤ 2 chạm | QA C1 | <<điền khi lead verify>> |
| Admin thêm bài → duyệt → thấy Thư viện → học | QA C1 | <<điền khi lead verify>> |

**Ảnh QA:** `docs/plan/reports/qa-2026-10-19/` (390px + 1280px: Hôm nay, Thư viện, 4 màn học, Góp ý/So sánh, Sổ từ/Flashcard, Tiến độ, Admin, Đăng nhập). Trạng thái: <<điền khi C1 hoàn tất — hiện thư mục chưa có>>

## 4. Rủi ro còn lại

- <<điền khi lead verify — rủi ro từ QA C1 và các ô "chưa xong">>
- Client đọc cả error shape cũ trong giai đoạn chuyển (`apiFetch` hiểu `{ error: "..." }`): cần rà lại các route chưa migrate sang envelope mới trước khi bỏ nhánh legacy.
- `DEV_BYPASS_AUTH` chỉ an toàn khi không ai deploy `NODE_ENV=development` lên môi trường public — giữ nguyên quy ước.
- Mode mới ngoài 4 skill sẽ bị `modeSkill()` trả `null` → route từ chối thay vì fallthrough (đúng thiết kế, nhưng cần nhớ khi thêm mode).

## 5. Việc Thuận / BS. Minh làm tay sau khi merge vào `master`

1. **Migration:** đợt này additive-only, **không cần chạy migration production** (không bảng/cột mới). Nếu lead verify phát hiện migration mới → ghi bổ sung tại đây.
2. **Supabase:** kiểm tra nhanh project còn hoạt động, RLS bật đủ trên bảng có `learner_id`, bucket `learner-media` còn private. Vào `/api/v1/admin/health` sau khi đăng nhập admin để xem cờ env + DB + migration.
3. **Vercel:** sau khi lead push merge vào `master`, vào **Deployments** đợi bản "Ready"; nếu đổi env → **Redeploy**. Smoke test: `/api/v1/health` → đăng nhập → `/today` → mở 1 bài → nộp.
4. **Backup:** chạy `scripts/backup.sh` (hoặc `.ps1`) một lần trước khi deploy bản mới.

## 6. Câu hỏi mở cho lead

- `docs/huong-dan-lms-2026-10-14.md` được spec/C3-task nhắc nhưng **không tồn tại** trên nhánh tích hợp (cũng không ở `docs/` gốc). Có cần tạo mới hay file này nằm ở máy Thuận?
- IELTS Academic hay General — nội dung `ielts-*` hiện dùng chung skill + badge; chốt lại khi nạp bài IELTS thật.
- Có muốn đổi tên tab "Sổ từ" → "Ôn tập" (ghi chú mục 7 của spec)?
