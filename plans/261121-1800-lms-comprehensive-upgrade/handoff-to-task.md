# Handoff: Leader → Task (21/11/2026 19:10)

Người dùng yêu cầu: **Task làm phần còn lại; Leader chỉ review và lập plan tối ưu mới khi cần.** Đọc `plan.md` và `agent-brief.md` cùng thư mục trước (luật cứng, ngôn ngữ thiết kế, công cụ kiểm chứng vẫn áp dụng nguyên).

## Đã xong (đừng làm lại)

- **Nền tảng** — `src/app/globals.css` (bóng `shadow-card`/`shadow-lift`, `rounded-2xl` = 16px, animation), `src/app/learning-studio.css` (class `page-enter`, `stagger`, `pressable`, `card-lift`, `hero-wash-*`, `skeleton-shimmer`, `eyebrow`, `scroll-strip`), primitives mới trong `src/components/ui/`: `progress-ring`, `skill-tile`, `stat-tile`, `segmented-control`; `Card` thêm `elevated`; `Skeleton` có shimmer; `PageContainer` tự `page-enter`.
- **Hiệu năng server** — `getCurrentLearner` bọc `cache()` (`src/server/auth.ts`); `(main)/layout.tsx` không gọi `auth.getUser()` lần hai; `countDueVocabulary` thay việc tải cả danh sách; `getTodayRecommendation` chạy 7 truy vấn song song + trả `weekActivity`/`weekMinutes` (contract thêm 2 trường tuỳ chọn); `/today` và `/my-work` render dữ liệu đầu ở server.
- **Hôm nay** (`src/features/today/*`), điều hướng (`src/components/layout/*`).
- **Learning Studio** (`src/features/session/**`, Agent A), **Góp ý/Bài làm/Tiến độ** (`src/features/my-work/**`, `src/features/progress/**`, `src/lib/feedback-labels.ts`, Agent B), **Thư viện/Sổ từ/Cài đặt** (`src/features/{library,vocab,settings}/**`, Agent C), skeleton `loading.tsx` cho các route.
- **Leader bổ sung sau agent**: `latestRevision` (bản sửa mới nhất) trong `getSubmissionWithFeedback` → Bản 1 đã có Bản 2 thì nút chính là "Mở Bản 2 và góp ý"; `scripts/smoke-e2e.mjs` bấm tab "Bài làm" trước khi điền; nhãn nộp bài nghe rút gọn; chú thích ô viết khi là bản sửa.
- **Gates lúc 19:01–19:03**: typecheck đạt, lint 0 lỗi (2 warning `<img>` có từ trước), 420 unit test đạt, `npm run build` Turbopack mặc định exit 0. **E2E preview** 9/9 đạt.

## Việc của Task (theo thứ tự)

1. **Chạy lại gates** sau các sửa cuối: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Sửa nếu đỏ.
2. **Quét ảnh cuối** (lượt của Leader bị ngắt): `bash /private/tmp/lms-leader-sync.sh` rồi `python3 /private/tmp/lms-shots.py final …` cho /today, /library, /library/W1, 4 phiên học, /my-work, 3 trang góp ý (…202, …204, …206), /vocab, /vocab/flashcards, /vocab/review, /progress, /settings, /onboarding, /login, /admin. Yêu cầu `overflowX=0`, 0 lỗi console; thêm viewport 320px cho /today và 1 phiên học. Mở ảnh xem; lỗi thị giác thì sửa trong đúng feature.
3. **Chưa có ảnh/kiểm chứng** — bổ sung: thẻ Shadowing từng câu (bài nghe sau khi mở transcript), màn tổng kết flashcard và review, trạng thái lưu lỗi của flashcard, `/admin` sau thay đổi token (bo góc, bóng), `/onboarding` 4 bước.
4. **Nợ nhỏ từ báo cáo agent** (làm nếu gọn, không mở rộng phạm vi):
   - `src/features/session/shared/audio-recorder.tsx` không còn ai import → xác nhận bằng `rg` rồi mới xoá.
   - Thanh điểm/tần suất SVG lặp ở 3 file (my-work, progress) → gom thành `MeterBar` trong `src/components/ui`.
   - `StatTile` thêm prop ẩn icon trên mobile, bỏ hack `max-sm:[&>span]:hidden` ở `vocab-page-header.tsx`.
   - `src/features/my-work/format-submitted-at.ts` đang được `features/progress` import chéo → chuyển sang `src/lib/`.
   - Thêm unit test cho `useTodayRecommendation`/`useSubmissionList` nhánh `initialData` nếu tách được phần thuần; không thêm dependency test mới.
   - `/ui-preview` chưa trưng các primitive mới.
5. **Tài liệu**: walkthrough `plans/reports/walkthrough-261121-1800-lms-comprehensive-upgrade.md` (đã làm gì, cách test tay trên điện thoại, còn gì chưa xong); journal `docs/journals/2026-11-21-cai-tien-toan-dien-luong-hoc-hieu-nang-ui.md`; cập nhật `AGENTS.md` (primitives mới, `learning-studio.css`, quy trình preview cô lập); đánh dấu 4 plan cũ ngày 20/11 là đã gộp vào plan này; tick nốt acceptance trong `plan.md`.
6. **Báo Leader review** qua link khi xong từng mục 1–3 (gates + đường dẫn ảnh) và khi xong toàn bộ.

## Không được làm nếu chưa hỏi người dùng

Commit/push/deploy, migration/seed DB thật, đọc `.env*`, đổi stack/dependency, dừng dev server port 3000, xoá DB `lms_leader_preview` hoặc thư mục preview.

## Môi trường kiểm chứng (Leader đã dựng, Task dùng tiếp)

- Preview: `http://localhost:3111`, bản sao `/private/tmp/lms-leader-preview` (webpack, `DEV_BYPASS_AUTH`, DB local `lms_leader_preview` trên Postgres 5432, dữ liệu mẫu QA). Log: `/private/tmp/lms-leader-preview-dev.log`. Nếu server chết: `cd /private/tmp/lms-leader-preview && npx next dev --webpack -p 3111`.
- Hai file trong bản sao KHÁC repo có chủ ý và không bị sync đè: `src/db/index.ts` (tắt SSL cho Postgres local) và `src/server/providers/gemini/client.ts` (**stub Gemini trả phản hồi mẫu** — vì vậy mọi kết quả chấm trên preview không chứng minh provider thật).
- Script: `/private/tmp/lms-leader-sync.sh`, `/private/tmp/lms-shots.py`, `/private/tmp/lms-e2e.py` (luồng nộp → góp ý → Bản 2; mỗi lần chạy ghi thêm 2 submission vào DB preview).
- Rollback toàn đợt: ref `refs/leader/baseline-261121` (trạng thái working tree lúc 18:00, tạo bằng `git stash create`) + `plans/reports/leader-261121-artifacts/baseline-untracked.tgz`.

## Chưa được chứng minh (ghi thẳng vào walkthrough)

Điện thoại thật (Safari iOS, bàn phím ảo, safe-area), micro/ghi âm/upload thật, Gemini thật, Supabase Auth/Storage thật, `npm run smoke` và `npm run test:integration` (cần env thật), nghiệm thu thị giác của BS. Minh.
