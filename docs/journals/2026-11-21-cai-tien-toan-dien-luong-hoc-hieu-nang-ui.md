---
title: Cải tiến toàn diện LMS — luồng học, hiệu năng và UI Clinical Studio
date: 2026-11-21
summary: "Gộp 4 plan UI ngày 20/11 thành plan 261121-1800-lms-comprehensive-upgrade; hoàn thiện SSR dữ liệu đầu cho Hôm nay/Bài làm, giảm gọi auth, Learning Studio 4 kỹ năng với tab Đề bài/Bài làm trên mobile, design system Clinical Studio (SkillTile/StatTile/ProgressRing/SegmentedControl/MeterBar), dọn nợ nhỏ và bổ sung kiểm chứng. Gates: typecheck ✓, lint 0 lỗi, 427 unit test ✓, build ✓; 40 capture screenshot overflowX=0, 0 lỗi console. Chưa chứng minh: iOS Safari thật, micro thật, Gemini/Supabase thật."
---

# Cải tiến toàn diện LMS — luồng học, hiệu năng và UI Clinical Studio

## What happened

Người dùng đưa mockup 6 màn và yêu cầu làm app "chuyên nghiệp hơn, dễ dùng và học hiệu quả hơn", giao toàn quyền cho Leader đề xuất + thực hiện. Leader audit và phát hiện **90 file dirty** là source gần xong của 4 plan UI ngày 20/11 — quyết định **gộp** (không làm lại) vào `plans/261121-1800-lms-comprehensive-upgrade/`, tạo mốc rollback `refs/leader/baseline-261121` trước khi tiếp tục.

### Chẩn đoán gốc (đo trên preview cô lập port 3111)

- `/today`, `/my-work`, `/settings` fetch client sau hydrate → luôn nháy skeleton; mỗi điều hướng gọi auth 3 lần.
- Mobile: ô làm bài nằm sâu dưới đề dài; action bar cao; CTA "Sửa ngay" trôi.
- Góp ý: điểm ước tính ở cuối trang, nhãn lỗi tiếng Anh thô.
- Thị giác phẳng, không chuyển cảnh.

### Đã làm (Leader phase 1–4)

- **SSR initialData** `/today` + `/my-work`; cache `getCurrentLearner`; song song hoá truy vấn Hôm nay; count query cho từ đến hạn.
- **Clinical Studio**: tokens, `learning-studio.css` (`hero-wash-*`, `pressable`, `card-lift`, `eyebrow`, `scroll-strip`, `page-enter`, `stagger`, `skeleton-shimmer`), primitive mới.
- **Hôm nay + điều hướng**: hero bài học, stepper 4 bước, nhịp tuần, skeleton theo route.
- **Learning Studio 4 kỹ năng**: tab Đề bài/Bài làm trên mobile, cột đề sticky desktop, action bar gọn; SegmentedControl Đáp án⇄Shadowing cho Nghe.
- **Góp ý/Tiến độ/Thư viện/Sổ từ/Cài đặt/Onboarding**: điểm + CTA Bản 2 lên đầu, nhãn tiếng Việt, đồng bộ token.

### Đã làm (Task — verify + nợ nhỏ + docs)

- Chạy lại 4 gates sau sửa cuối: typecheck ✓, lint 0 lỗi (2 warning `<img>` cũ), **427 test** ✓ (+7 test nhánh `initialData`), build ✓.
- Quét ảnh cuối: 38 capture 390/1440 + 2 capture 320px — `overflowX=0`, 0 lỗi console; mở mắt kiểm toàn bộ.
- Kiểm chứng bổ sung: Shadowing từng câu, tổng kết + lỗi lưu flashcard, `/admin`, `/onboarding` 4 bước.
- Nợ nhỏ: gom `MeterBar`, `StatTile.hideIconOnMobile`, `format-submitted-at` → `src/lib/`, xoá `audio-recorder.tsx` thừa, `/ui-preview` trưng primitive mới.
- 4 plan ngày 20/11 đánh dấu `merged`; walkthrough tại `plans/reports/walkthrough-261121-1800-lms-comprehensive-upgrade.md`.

## Why

App phục vụ 1 người học 30–45 phút/ngày chủ yếu trên điện thoại → mỗi lần mở phải thấy ngay việc cần làm, mỗi phiên phải vào ô làm bài trong ≤1 chạm, góp ý phải đọc được ngay. SSR initialData + ít gọi auth là cách rẻ nhất để "mượt" mà không đổi kiến trúc.

## What's next / unverified

- Kiểm thật trên iOS Safari (bàn phím, safe-area), micro ghi âm/upload, Gemini thật, Supabase Auth/Storage thật; `npm run smoke` và integration tests.
- Nghiệm thu thị giác cuối bởi BS. Minh; Leader review diff + ảnh, có thể lập plan tối ưu tiếp nếu cần.
- Không commit/push/deploy trong đợt này (chưa được yêu cầu); rollback nếu cần: `refs/leader/baseline-261121`.
