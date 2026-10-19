# Code review tổng hợp — Lite MVP sau Bước 1–7

Ngày: 2026-09-26 · Phương pháp: 22 reviewer agents (read-only) rà soát theo vùng + verify bằng lệnh trên máy.
Đối chiếu: `lite-mvp-track.md` (8 invariants), `huong-dan-xay-dung-voi-antigravity.md` (tiêu chí "xong" từng bước), `product-design.md`, `.agents/rules/english-mini-lms.md`.

## Kết luận

**Đúng hướng về kiến trúc và phần lớn invariants** — nhưng có **6 bug chặn luồng end-to-end**: bản hiện tại **chưa thể pilot**. Claim "58/58 tests" trong journal chỉ đúng trong môi trường có `.env.local` + DB thật + Gemini key (tests là integration, không hermetic).

## Verify trực tiếp (máy local, không .env.local)

| Kiểm tra | Kết quả |
|---|---|
| `npm install` | OK (474 packages) |
| `npm run typecheck` | 0 lỗi |
| `npm run lint` | 0 lỗi |
| `npm test` | 6/8 file fail — thiếu `DATABASE_URL` (integration tests cần env); 10 test thuần pass |
| `npm run build` | FAIL khi không có `DATABASE_URL` — `src/db/index.ts` throw lúc route collection. Vercel vẫn build (có env), nhưng local/CI gãy |
| Migrations `.sql` | Tồn tại + đã commit (`src/db/migrations/0000_*.sql`, `supabase/migrations/00001_enable_rls.sql`). Nhưng `.gitignore:31` `*.sql` sẽ **nuốt migration tiếp theo** |

## P0 — Bug chặn luồng (sửa trước khi pilot)

| # | Bug | Vị trí | Hệ quả |
|---|---|---|---|
| 1 | API trả `media_id`, client đọc `mediaData.mediaId` | `api/v1/media/route.ts:36` vs `speaking-session-view.tsx:150`, `listening-session-view.tsx:219` | Nộp speaking/shadowing **luôn fail** |
| 2 | `/today` gửi `{activity_id, target_minutes}` + đọc `json.session.id`; API nhận camelCase, trả `{sessionId}`; GET dùng `?target_minutes=` vs route đọc `targetMinutes` | `today-view.tsx:53,97-105` vs `sessions/route.ts:6-33`, `today/route.ts:13` | "Bắt đầu" trên Hôm nay **luôn 422**; chọn 45' bị nuốt về 30' |
| 3 | `activeSeconds` không bao giờ ghi; `learning_sessions.status` mãi `active`; không event pause/resume/finish | `learning/service.ts` — không có `update(learningSessions)` nào | "Phút thực học" = 0; rule (a) Hôm nay gợi ý nhầm bài đã nộp |
| 4 | `public/icons/` không tồn tại | `manifest.json`, `sw.js:15` | SW install reject → **PWA chết**; test step7 icons fail |
| 5 | `deleted_at` có trong schema nhưng **không có trong migration 0000** | `schema.ts:259` vs `0000_demonic_scarecrow.sql` | DB migrate từ file → mọi query `isNull(deletedAt)` crash (today, progress, admin, settings, export) |
| 6 | PATCH submissions UPDATE `body` cho **mọi mode** | `submissions/[id]/route.ts:45-51` | Vi phạm invariant #1 append-only — sửa được nội dung bài writing đã nộp |

## P1 — Lệch thiết kế / rủi ro invariant

- **Transcript listening lộ trước nộp**: `learning/service.ts:833-875` trả `transcriptSegments` vô điều kiện — khoá chỉ ở UI, xem được qua DevTools → phá `answer_reveal=after_submit`.
- **Reveal fail vẫn mở transcript**: `listening-session-view.tsx:144-146` → bypass `assisted`.
- **Regex đáp án đúng sai**: `listening-session-view.tsx:270` không khớp `"(B)"` server sinh → hiển thị sai đáp án.
- **`retryAssessment`**: không chặn theo status (retry được bài đã ready → feedback trùng), không giới hạn lần, hardcode `mimeType:"audio/webm"` (iPhone mp4 fail), **thiếu nhánh listening** → chấm lại listening bằng `evaluateWriting` trên JSON.
- **Không timeout thật cho Gemini** (chỉ `maxDuration` Vercel) → assessment kẹt `processing` mãi.
- **Shadowing không ghi `usage_events`** → chi phí ẩn khỏi /admin.
- **Auto-grant `role:"admin"` cho mọi user mới** (`auth.ts:50`) — an toàn chỉ khi dashboard đã tắt public signup.
- **RUNBOOK SQL sai tên cột** (`operation/model/prompt_tokens` vs thật `action/model_name/token_input/token_output/cost_estimate`) — `docs/RUNBOOK.md:96-107`.
- **Vocab review UI↔API lệch schema**: UI đọc `needs_improvement`/`improvedVersion`, API trả `partial`/`exampleCorrection` → gợi ý không render; SRS code `1-3-7-14-30` vs docs `1-3-7-14`; `partial` tính sai → về 1 ngày; review ghi đè `my_attempt`.
- **Smart-capture popup sai tọa độ** (`fixed` + `scrollY`) → lệch/off-screen mobile; thiếu `touchstart` click-outside.
- **Hardcode fallback**: đoạn R1 + "Trang 42" trong `reading-session-view.tsx:85-95`; `questionsFile` fallback trỏ file L1 (`learning/service.ts:329`).
- **Seed un-approve không reconcile**: approved→draft vẫn còn trong DB, vẫn hiện Thư viện.
- **Upload**: không enforce `durationSeconds ≤ 300` server-side; `body`/draft không `.max(20000)`.
- **my-work**: thiếu trạng thái "chờ chấm"; tab So sánh thiếu feedback bản 1; **không có kênh phản đối nhận xét** (schema đã có `feedback_versions.review_state`).
- **Nhỏ**: export signed URL 86400s vs chuẩn 600s; `today` crash khi 0 activity approved; events/drafts không verify session ownership; drafts last-write-wins (không 409); sources/segments/activities không RLS (ghi chú "API layer" — anon key có thể write qua PostgREST nếu grants mặc định); 3 bảng content policy `FOR ALL` trên bảng learner cho phép UPDATE/DELETE → append-only chỉ enforce ở application.

## P2 — Chất lượng / tiến độ nội dung

- 25 file >200 dòng vi phạm rule repo; 3 file >1000: `listening-session-view.tsx` 1097, `learning/service.ts` 1054, `my-work-view.tsx` 1005.
- UI inline style toàn bộ, không Tailwind/shadcn như stack đã chốt.
- ~20 chỗ `as any`/`z.any()` không comment lý do (JSONB fields).
- Chỉ **4 activities approved** (W1/R1/S1/L1) vs mục tiêu 6 → 12 cho pilot; video L1 `M7lc1UVf-VE` nghi placeholder — cần kiểm tay.
- Tests là integration → không hermetic, không chạy CI.
- `next.config.ts` rỗng: không security headers.

## Đúng hướng — đã kiểm chứng

15 bảng khớp contract, không lắp v2, `rubric_json` · assisted server-side + zod strip client · not_assessable ép bằng code · không official band (zod literal + prompt cấm + test reject) · cấm y khoa 2 lớp (prompt + enforce limitations) · auth 3 lớp, 20/20 route check session, learner_id từ session, dev-bypass guard `NODE_ENV` an toàn · seed approved-only/fail-fast/idempotent · library không leak đáp án · upload MIME+20MB server-side, bucket private, signed URL 600s · recorder 5' auto-stop, detect Zalo browser · YouTube start/end/0.75/fallback link · structured output + zod + retry · settings export/soft-delete+file/nhắc tắt · admin role-guard page+API, token/tháng · backup scripts + RUNBOOK · RLS migration tồn tại đúng 12 bảng learner-data (cần xác nhận đã chạy trên dashboard).

## Next steps

**A. Vá luồng chặn (1 phiên):**
1. `media_id`→`mediaId`; 2. Sửa 3 contract mismatch `/today`; 3. Tạo `public/icons/icon-192.svg` + `icon-512.svg`; 4. Migration additive cho `deleted_at` + xác nhận DB thật; 5. Ghi `finish` event + `active_seconds` + `status=completed`; 6. Chỉ trả transcript sau reveal/nộp + reveal-fail không mở; 7. Sửa regex đáp án; 8. Giới hạn PATCH submissions (chỉ speaking/confirmed transcript hoặc cột riêng).

**B. Invariant & robustness (1–2 phiên):** timeout thật 55s Gemini + sweep processing→failed; `retryAssessment` status-guard+cap+mimeType+nhánh listening; shadowing ghi usage_events; sửa SQL RUNBOOK; seed reconcile un-approve; đồng bộ vocab review schema + chốt "partial"/chuỗi SRS; enforce duration≤300 + body≤20k; default role admin→learner; sửa `.gitignore` `*.sql`.

**C. Pilot:** verify dashboard (signup tắt, bucket private, RLS đã chạy); thêm 2+ activities → 6, hướng 12; kiểm video L1; checklist nghiệm thu tay trên điện thoại; deploy Vercel; test tài khoản thứ 2; backup lần 1.

## Câu hỏi cần anh Minh xác nhận

1. Supabase dashboard: public signup đã tắt? bucket `learner-media` private? `00001_enable_rls.sql` đã chạy SQL Editor? DB tạo bằng `db:migrate` hay `db:push` (quyết định `deleted_at` tồn tại)?
2. Transcript sửa sau nộp: PATCH có điều kiện, cột `confirmed_transcript` riêng, hay revision mới?
3. Chuỗi SRS chuẩn: 1-3-7-14 (docs) hay 1-3-7-14-30 (code)?
4. "partial" trong review từ: đạt hay sai?
5. Video L1 `M7lc1UVf-VE` đúng nội dung khớp transcript?
