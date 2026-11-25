# Plan: Audit remediation 25/11 — fix toàn bộ phát hiện 8-agent audit

Status: in-progress
Owner: user duyệt "fix hết, đưa hết lên production". Quyết định: speaking text-only ĐƯỢC PHÉP.

## Đã xong (đã push production)
- [x] Đợt 1a: next 16.4.6 + react 19.3.1 + drizzle-orm 0.45.4 (CVE critical) — commit d9f5f8d
- [x] Đợt 1b: RLS production siết 15/15 bảng (00002_tighten_rls.sql, apply-rls-00002.mjs) + allowlist ALLOWED_EMAILS + X-Frame-Options — commit 0b8646e

## Batch A — Đang chạy (subagent): 6 lỗi học tập nóng
1. activeSeconds pipeline đứt (pause/resume/finish không POST)
2. Speaking text-only server 422 → cho phép
3. Draft speaking mất mediaId
4. Micro không dừng khi thoát
5. modeSkill: progress/service.ts:126-137, library/detail.ts:51, drive-sync/stage-activities.ts:69,191
6. Chống nộp trùng (server guard completed session + idempotent + client disable)

## Batch B — Learning core (spec chi tiết cho subagent tiếp theo)
1. **Picker không xoay inventory**: tìm logic chọn bài trong today/library picker — hiện lấy phần tử đầu skill, không loại bài đã completed. Fix: ưu tiên bài chưa làm (không có session completed), xoay vòng hết inventory mới lặp lại; deterministic theo ngày nếu cần. Viết unit test.
2. **L3 fallback load nhầm câu hỏi L1**: `src/server/learning/listening-questions.ts:23-25` fallback legacy `texts/l1-questions.yaml` → xóa fallback, fail-fast hoặc trả empty rõ ràng; kiểm shadowing path.
3. **SRS seed stagger**: 1.142 từ seed đến hạn cùng lúc. Fix 2 lớp:
   a. scripts/seed.ts: rải due_at ngẫu nhiên trong 5-10 ngày cho vocab seed mới
   b. Data remediation production: UPDATE vocabulary_vault rải due_at cho rows mastery_level=0 đang due (script riêng, chạy 1 lần — hỏi user trước khi chạy vì đụng dữ liệu)
4. **Persist AI transcript**: transcript Gemini trả về không lưu DB → trang feedback hiện nhầm notes learner. Thêm cột (additive migration — phối hợp Batch D) hoặc vào feedback payload JSON; hiển thị đúng transcript AI ở trang góp ý.
5. **Speaking prompt mislabel**: `src/server/providers/gemini/speaking.ts` dán nhãn notes learner là "TRANSCRIPT CHUẨN SHADOWING" → sửa prompt phân biệt rõ: transcript AI vs notes learner.
6. **feedbackGuide/rubric wiring**: rubric metadata trong content không vào evaluator — nối feedback_guide vào prompt evaluator nếu có (đọc content/english-lab/rubrics/).

## Batch C — Integrity migration + atomicity
Migration additive `src/db/migrations/0007_*.sql` (drizzle-kit generate hoặc viết tay theo pattern migrations cũ, rồi apply production):
1. Indexes: learning_sessions(learner_id,status,updated_at desc), (learner_id,activity_id,status); submissions(learner_id,deleted_at,submitted_at desc), (parent_id,learner_id,deleted_at,submitted_at desc), (session_id,learner_id,deleted_at); assessments(submission_id,created_at desc); vocabulary_vault(learner_id,due_at); drafts(session_id,learner_id)
2. Unique partial: 1 open session/learner/activity; 1 draft/session/learner; assessment run uniqueness; xem audit chi tiết
3. FK: submissions.parent_id → submissions.id (self-FK, nullable)
4. CHECK constraints: mastery range, enum-like text fields nếu khả thi
5. Trigger append-only cho submissions (chặn UPDATE body/assisted sau insert) — cân nhắc soft-delete vẫn phải update được deleted_at → trigger chỉ chặn các cột immutable
6. Atomic pipeline: create-submission-and-assess gom transaction
7. Seed reconcile: activity gỡ khỏi manifest/retired → update review_state tương ứng
8. Apply production + verify (dùng pattern scripts/apply-rls-00002.mjs)

## Batch D — Hiệu năng
1. Auth kép: proxy.ts matcher bắt /api/ + withLearner cùng gọi auth.getUser() 2 lần/request → bỏ /api khỏi proxy refresh hoặc early-return (API routes tự enforce qua withLearner/withAdmin)
2. Autosave skip nội dung không đổi: use-autosave-draft.ts thêm lastSavedContentRef
3. Flashcard N+1: src/server/vocabulary/quick-review.ts:83-179 — preload inArray, bulk insert reviews/usage_events, CASE update vault. Giữ transaction + clientReviewId idempotency
4. Lazy skill bundle: modes/registry.ts static import cả 4 plugin → dynamic import theo skill
5. Waterfall /learn: get-session-details.ts + listening-session-data.ts — join/parallel hóa; feedback detail: poll endpoint nhẹ thay vì router.refresh full page
6. /progress: parallel 4 nhóm query, aggregate SQL, Map matching, không select full body
7. SSR flashcards/review/settings initialData như /today
8. Vocab vault pagination/cursor
9. preload="none" audio nhất quán; ảnh markdown lazy+dimensions
10. countDueVocabulary gọi 2 lần/request (layout + today) → cache()

## Batch E — UX mobile trung bình
1. Lỗi micro → hướng dẫn tiếng Việt cấp quyền Safari/Chrome theo NotAllowedError/NotFoundError/NotReadableError
2. Shadowing: cho nghe lại trước khi gửi chấm thay vì auto-submit
3. Textarea autoresize
4. Ôn từ bằng câu: sticky CTA khi bàn phím mở
5. break-words cho chuỗi dài không khoảng trắng (320px overflow)
6. Login error mapping: invalid_credentials etc → tiếng Việt thay vì raw Supabase message
7. SegmentedControl → radiogroup semantics; MeterBar semantic meter (thấp)

## Batch F — CI + tests
1. CI workflow: docs có bản nháp (tìm trong docs/) → tạo .github/workflows/ci.yml chạy typecheck+lint+unit test (+build?)
2. Fix test invariant #7 vacuous (assert chính mock)
3. Contract roundtrip tests: zod schema parse response thật của service
4. retryAssessment test thực thi
5. Integration hermetic: fixtures isolated thay vì select existing rows (nếu khả thi nhanh)
6. Gate live-Gemini tests riêng

## Batch G — Code quality debt (thấp, làm nếu còn sức)
1. Admin CRUD routes: looseObject({}) → dùng admin*CreateSchema/UpdateSchema từ contracts; type client admin-api.ts
2. Vocab client import server module: chuyển SRS pure functions sang src/lib/ hoặc src/contracts/
3. use-autosave-draft fetch tay → apiFetch + response contract
4. Gemini providers dedupe: generateValidatedJson helper trong gemini/call-gemini.ts, cô lập `as any`
5. Onboarding contract: 15-120 → literal 30/45 cho khớp runtime
6. YouTube player: typed YTPlayer interface, xóa fallback video "uVSiFJ85EtM", bớt silent catch
7. Xóa dead export toClientQuestions hoặc dùng nó trong listening-session-data.ts (comment B8 stale)
8. feedback as any trong get-submission-with-feedback.ts → type đúng
9. sessionConflictResponseSchema lỗi thời + legacy error branch api-client.ts
10. Split file >200 dòng còn lại (15 file — danh sách trong audit report)

## Nội dung học (manual, không auto-fix được hết)
- Verify transcript L1-L4 khớp video YouTube (nghi không khớp) — cần nghe đối chiếu
- IELTS Reading hiện là đọc-dịch, chưa format thi — cần authoring thêm
- Thiếu giao tiếp đời sống — cần authoring content mới
- Inventory chỉ đủ ~2-4 tuần

## Sau khi fix xong — việc user phải làm tay trên dashboard
1. **Vercel env**: thêm `ALLOWED_EMAILS=nhutminh1989@gmail.com` (Production + Preview)
2. Supabase dashboard: kiểm Authentication → Signup disabled; Storage bucket private; SMTP custom nếu muốn magic link
3. Test thật trên iPhone: micro, luồng học end-to-end
