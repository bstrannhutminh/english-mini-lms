# Walkthrough — Cải tiến toàn diện LMS (21/11/2026)

Plan gốc: `plans/261121-1800-lms-comprehensive-upgrade/plan.md` (gộp 4 plan UI ngày 20/11).
Mốc rollback toàn đợt: ref `refs/leader/baseline-261121` + `plans/reports/leader-261121-artifacts/baseline-untracked.tgz`.

## Đã làm gì

### Hiệu năng & cảm giác "mượt"

- **SSR dữ liệu đầu** cho `/today` và `/my-work`: server render sẵn danh sách/bài gợi ý trong HTML đầu → không còn nháy skeleton sau hydrate, không fetch trùng. Client hook (`useTodayRecommendation`, `useSubmissionList`) nhận `initialData`; lần đổi 30/45 hay "Thử lại" mới gọi API.
- **Giảm gọi auth**: cache `getCurrentLearner` bằng React `cache()`; bỏ lookup trùng trong layout; mỗi điều hướng trước đây gọi auth tới 3 lần.
- **Truy vấn Hôm nay song song**; đếm từ đến hạn bằng count query thay vì tải toàn bộ sổ từ.
- **Skeleton theo route**: mỗi màn có khung xương đúng bố cục thay vì spinner chung; thêm `page-enter`/`stagger` cho cảm giác chuyển cảnh (tôn trọng `prefers-reduced-motion`).

### Design system "Clinical Studio"

- Tokens + primitive mới trong `src/components/ui/`: `SkillTile`, `StatTile` (kèm `hideIconOnMobile`), `ProgressRing`, `SegmentedControl`, `MeterBar`, `Card elevated`, `Skeleton` shimmer. File `src/app/learning-studio.css` chứa util `hero-wash-*`, `pressable`, `card-lift`, `eyebrow`, `scroll-strip`.
- `/ui-preview` (chỉ dev) đã trưng đủ các primitive mới để kiểm tay.

### Luồng học (Learning Studio)

- Mobile ≤390px: tab **Đề bài ⇄ Bài làm** — ô làm bài trong màn hình đầu sau ≤1 chạm ở Viết/Đọc/Nói. Desktop: cột đề bài dính (sticky), action bar gọn.
- Nghe: sau nộp có SegmentedControl **Đáp án & giải thích ⇄ Shadowing từng câu** — thẻ từng câu với nút "Nghe mẫu".
- Góp ý (`/my-work/[id]`): điểm ước tính + việc cần làm + CTA "Bản 2" nằm ở màn hình đầu; nhãn lỗi tiếng Việt; CTA dính trên mobile.

### Dọn nợ nhỏ (Task)

- Gom 3 thanh SVG lặp (progress ×2, my-work ×1) thành `MeterBar` dùng chung.
- `StatTile.hideIconOnMobile` thay hack `max-sm:[&>span]:hidden` ở Sổ từ.
- `format-submitted-at.ts` chuyển `src/features/my-work/` → `src/lib/` (progress cũng dùng).
- Xoá `audio-recorder.tsx` (component cũ không còn import).
- Tách hàm thuần `resolveSubmissionList` + `shouldFetchOnMount` → 7 unit test mới cho nhánh `initialData`.

## Kết quả kiểm chứng

- Gates: typecheck ✓ · lint 0 lỗi (2 warning `<img>` cũ, có sẵn) · **427 unit test** ✓ · `npm run build` exit 0.
- Ảnh: 38 capture route·viewport ở 390px + 1440px, thêm `/today` + 1 phiên Viết ở 320px — **mọi capture `overflowX=0`, 0 lỗi console**. Thư mục `/private/tmp/lms-shots/` (tiền tố `task-final-*`, `task-debt-*`, `v1-*`, `v2-*`, `v3-*`).
- Tương tác: E2E Thư viện → phiên → nộp → góp ý → Bản 2 → so sánh: 9/9 bước. Shadowing từng câu, tổng kết flashcard, trạng thái lỗi lưu flashcard, onboarding 4 bước, `/admin` sau đổi token — đều đạt.

## Cách test tay trên điện thoại

1. Chạy `npm run dev` (port 3000), mở trên điện thoại cùng mạng hoặc DevTools device toolbar 390px.
2. **Hôm nay**: thấy bài học ngay (không nháy skeleton); đổi 30/45 → dữ liệu cũ giữ nguyên tới khi có dữ liệu mới.
3. **Vào bài Viết**: chạm tab "Bài làm" → ô nhập + nút nộp trong màn đầu; viết vài câu, nộp → đợi chấm → trang Góp ý có điểm + CTA "Bản 2" trên cùng.
4. **Bài Nghe**: làm quiz, nộp → bấm tab "Shadowing từng câu" → mỗi câu có nút "Nghe mẫu".
5. **Sổ từ** → "Ôn tự do" → lật hết thẻ → màn tổng kết; tắt mạng giữa chừng để thấy trạng thái lỗi lưu.
6. **Tiến độ**: thanh MeterBar theo kỹ năng (teal = tự làm, amber = có hỗ trợ).

## Chưa chứng minh được (cần môi trường thật)

- **iOS Safari thật**: bàn phím ảo, safe-area, scroll — mới kiểm qua Chromium mô phỏng.
- **Micro thật**: ghi âm + upload bài Nói/Shadowing (preview stub media).
- **Gemini thật**: preview stub provider — chất lượng chấm/feedback chưa kiểm.
- **Supabase Auth/Storage thật**: preview dùng `DEV_BYPASS_AUTH` + DB local.
- `npm run smoke`, test integration (cần `TEST_DATABASE_URL`), và **nghiệm thu thị giác cuối của BS. Minh**.
