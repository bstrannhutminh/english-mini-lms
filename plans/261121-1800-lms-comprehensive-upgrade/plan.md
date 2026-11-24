---
title: "Cải tiến toàn diện LMS: luồng học, hiệu năng, UI/UX"
status: completed
created: 2026-11-21
priority: P1
branch: master
---

# Cải tiến toàn diện English Mini LMS (21/11/2026)

Yêu cầu: BS. Minh giao qua terminal `Task` — học dễ nhất, UI/UX chuyên nghiệp hơn mockup 6 màn, web mượt, mobile-first. Mọi phương án đã được duyệt trước; không push/deploy, không migrate/seed DB thật, không đọc secret.

## Audit các plan đang dở → quyết định

| Plan | Trạng thái thực | Quyết định |
|---|---|---|
| `261120-0013-lms-visual-refresh` | Source xong, chỉ thiếu visual acceptance | Gộp: plan này kế thừa, không làm lại |
| `261120-premium-today` | Source Phase 1–3 xong; thiếu acceptance + build Turbopack | Gộp; kiểm lại `npm run build` ở phase 5 |
| `261120-2013-lively-learning-studio` | Đã bị Premium thay lớp trang trí | Đóng theo plan này |
| `261120-1038-lms-product-readiness` | Kẹt ở review link bị quarantine, chưa sửa source | Gộp phần "luồng học thật" vào phase 2–3 |
| `1601-flashcards-youglish`, `1814-english-listening-questions` | Completed | Giữ nguyên |

Working tree đầu phiên: 90 file sửa + file mới của các plan trên (gates xanh: typecheck, lint 0 lỗi/2 warning `<img>`, 408 unit tests). Mốc rollback: ref `refs/leader/baseline-261121` (`git stash create`, không đổi working tree) + `plans/reports/leader-261121-artifacts/baseline-untracked.tgz`.

## Chẩn đoán (ảnh baseline 390px + 1440px, preview cô lập)

1. **Mượt**: Hôm nay, Bài làm, Cài đặt fetch phía client sau khi hydrate → luôn nháy skeleton; mỗi lượt điều hướng gọi `auth.getUser()` 3 lần (proxy, layout, page) + `getCurrentLearner` 2 lần; badge Sổ từ tải cả danh sách để đếm; `loading.tsx` chỉ là spinner chung.
2. **Ma sát học trên điện thoại**: màn Viết/Đọc/Nói mở đề bài dài trước, ô làm bài nằm sâu bên dưới; thanh hành động cao (dòng nhắc + phím tắt); header phiên học bị bó hẹp trên desktop, cột đề không dính.
3. **Góp ý**: điểm ước tính nằm cuối trang, nhãn lỗi tiếng Anh thô (`tone`, `grammar`), nút phụ chiếm đầu mỗi thẻ trên mobile, CTA "Sửa ngay" trôi mất khi cuộn.
4. **Thị giác**: phẳng, ít thứ bậc; chưa có nhịp tuần/tiến trình trong ngày; thẻ bài học chỉ có chữ; không có chuyển cảnh.

## Hướng thiết kế — "Clinical Studio"

Giữ Teal + Inter (D-6) và 4 màu kỹ năng. Thêm: chiều sâu nhẹ (shadow 2 lớp, bo 16px), ô icon kỹ năng, nền wash theo kỹ năng cho thẻ bài chính, vòng tiến trình, stepper có đường nối, skeleton shimmer đúng hình trang, chuyển cảnh vào trang 180ms, phản hồi nhấn nút. Không gamification công khai, không dependency mới. `prefers-reduced-motion` tắt toàn bộ motion.

## Phases

| # | Nội dung | Chủ | Trạng thái |
|---|---|---|---|
| 1 | Nền tảng: tokens, primitives (`ProgressRing`, `SkillTile`, `StatTile`, `SegmentedControl`, shimmer, page-enter), hiệu năng server (`cache()` learner, count query, song song hoá truy vấn Hôm nay) | Leader | completed |
| 2 | Hôm nay + khung điều hướng: SSR dữ liệu đầu, hero bài học, stepper, nhịp tuần, skeleton theo route | Leader | completed |
| 3 | Learning Studio 4 kỹ năng: tab Đề bài/Bài làm trên mobile, cột đề dính trên desktop, header full-bleed, action bar gọn | Agent A | completed — Leader đã review diff 21/11 |
| 4 | Bài làm/Góp ý/Tiến độ + Thư viện/Sổ từ/Cài đặt | Agent B, C | completed — Leader đã review diff 21/11 |
| 5 | Kiểm chứng cuối, dọn nợ nhỏ, walkthrough + journal | **Task** (Leader review) | completed — Leader đã review 21/11 (xem [handoff](handoff-to-task.md)) |

Từ 19:10 ngày 21/11/2026 người dùng chuyển vai: terminal `Task` làm phần còn lại, Leader chỉ review và lập plan tối ưu mới khi cần.

## Invariant giữ nguyên

Submissions append-only (`parent_id`), `assisted` do server tính, `not_assessable` khi thiếu audio, chỉ `practice_estimate`, feedback đủ 6 trường + `limitations`, nội dung chỉ từ manifest approved, không khuyến nghị điều trị, không secret. Giữ `data-tour`, `MODE_META`/`MODE_REGISTRY`, contracts `/api/v1` (chỉ thêm trường tuỳ chọn), migration additive (đợt này không thêm migration).

## Nghiệm thu

- [x] `npm run typecheck`, `npm run lint` (0 lỗi, 2 warning `<img>` cũ), `npm test` (55 file/427 test), `npm run build` (Turbopack mặc định, exit 0) — Leader đạt lúc 19:01–19:03; Task chạy lại đạt sau mọi sửa cuối (19:20, gồm 7 test mới cho nhánh `initialData`).
- [x] Hôm nay hiển thị bài học ngay ở HTML đầu (không skeleton sau hydrate); 1 chạm vào bài.
- [x] Mobile 390px: ô làm bài nằm trong màn hình đầu sau ≤1 chạm ở Viết/Đọc/Nói.
- [x] Không tràn ngang / 0 lỗi console ở toàn bộ màn chính 320/390/1440 — Task quét lại 38 route·viewport (390+1440) + /today và 1 phiên học ở 320px; `overflowX=0` và 0 lỗi console trên mọi capture; ảnh tại `/private/tmp/lms-shots/` (tiền tố `task-final-*`, `task-debt-*`).
- [x] Góp ý: điểm ước tính + việc cần làm + CTA Bản 2 ở màn hình đầu; nhãn tiếng Việt.
- [x] Luồng Thư viện → phiên → nộp → góp ý → Bản 2 → so sánh chạy trên preview mobile 390px, 9/9 bước đạt, 0 lỗi console (`/private/tmp/lms-e2e.py`; Gemini giả lập — chưa chứng minh provider thật).
- [x] Kiểm chứng bổ sung (Task): Shadowing từng câu sau khi chấm Nghe; tổng kết flashcard; trạng thái lỗi lưu flashcard; /admin và /onboarding 4 bước sau đổi token.
- [x] Walkthrough tiếng Việt + cách test trên điện thoại + phần chưa xong — `plans/reports/walkthrough-261121-1800-lms-comprehensive-upgrade.md`.

## Review cuối phase 3–4 (Leader, 21/11)

Phạm vi: diff so với `refs/leader/baseline-261121` của `src/server`, `src/contracts`, `src/features/{session,my-work,progress,library,vocab,settings}`. Đọc kỹ phần logic (server, shell phiên học, panel 4 kỹ năng, trang góp ý); phần chỉ đổi giao diện đọc theo mẫu.

- Invariant giữ nguyên: bản sửa vẫn là submission mới có `parent_id`; `assisted` chỉ đọc từ server; góp ý hiện đủ 6 trường + `limitations`; điểm chỉ `practice_estimate` thang 0–10; `data-tour` không đổi; contract chỉ thêm trường tuỳ chọn.
- Thanh gợi ý chuyển sang slot: cả 3 plugin có `Hint` (Viết, Đọc, Nói) đều render qua `SessionColumns` nên nút gợi ý không mất.
- ~~**Chờ quyết định:**~~ **Đã quyết 24/11/2026 — giữ chữ phụ 13–14px.** Luật trong `.agents/rules/english-mini-lms.md` đã sửa: chữ nội dung/tương tác vẫn ≥ 16px; caption/meta/ghi chú trạng thái/eyebrow được 13–14px. (`text-sm` 92 chỗ, `text-xs` 19 chỗ, `eyebrow` 13px giữ nguyên.)
- Nhỏ, chưa sửa: `weekMinutes` tính theo 168 giờ trượt trong khi dải 7 ngày tính theo ngày lịch giờ VN; `src/server/today/service.ts` 236 dòng (>200); JSDoc của `getLearnerVocabulary` bị tách khỏi hàm do chèn `countDueVocabulary` vào giữa.

## Preview kiểm chứng

Bản sao cô lập `/private/tmp/lms-leader-preview` (port 3111, `DEV_BYPASS_AUTH`, DB local `lms_leader_preview`, dữ liệu mẫu ghi nhãn QA). Không dùng `.env.local` thật, không chạm Supabase/Gemini thật, không đụng dev server port 3000 của người dùng.
