# Phạm vi kiểm tra lại UI/UX LMS — 19/11/2026

Kiểm thử và báo cáo trên `a29c99e` (source `06a3cd3`), không sửa sản phẩm hoặc commit/deploy. Thẩm quyền: yêu cầu `$ak-test`, plan redesign đã hoàn tất, hướng dẫn dùng ngày 19/11 và luật dự án.

Mốc kiểm tra: các luồng sử dụng có phản hồi rõ; ô nhập ≥16px; vùng chạm ≥44px; mobile không tràn ngang/bị footer che; bàn phím truy cập được controls và modal; nháp, hỗ trợ và kết quả ôn được giữ đúng khi lỗi hoặc đổi màn. Contrast kiểm theo kích thước/weight text thực; không khẳng định chứng nhận WCAG đầy đủ.

| Nhóm | Phạm vi |
|---|---|
| Đăng nhập / onboarding | Hai form đăng nhập, bốn bước, skip, lưu, mở lại và lỗi |
| Hôm nay / điều hướng | 30/45 phút, CTA chính, bài dở, đổi bài, menu và keyboard |
| Thư viện | Search/topic/skill/status, rỗng, chi tiết, gợi ý khi đổi bộ lọc |
| Học | Bốn plugin, timer, nháp, hint/reveal, ghi âm/UI upload lỗi, lỗi nộp và hết giờ |
| Bài của tôi | Danh sách có dữ liệu, chờ/lỗi/góp ý, hai bản so sánh, sửa lại |
| Sổ từ | Tuple có dữ liệu, mở/đổi câu, thêm/lọc, YouGlish, review và flashcards có batch |
| Tiến độ / cài đặt | Dữ liệu đã luyện, hồ sơ, mật khẩu/reminder/export UI và lỗi |
| Quản trị | Bảng, form/wizard tạo/sửa, validation và va chạm ID ở nhánh tạo mới |
| PWA / shared UI | Cold offline trước auth, cache riêng tư, modal/tab/menu, zoom và viewport hẹp |

Browser chạy tuần tự một worker, 390×844 và 1280px cho các nhóm chính; 320px/768px và zoom 200% cho các vùng dùng chung có rủi ro responsive. Dùng Chrome/Playwright có sẵn, Next/PostgreSQL tạm riêng; backup trước migration/seed/fixture. Chỉ seed curriculum approved. Fixture bài làm/feedback dùng để kiểm tra render được ghi nhãn riêng, không thay bằng chứng provider hoặc dữ liệu thật.

Rerun UI là yêu cầu trực tiếp. Unit được chạy lại một lượt (42 file/358 test PASS); lint/typecheck/build của source trước vẫn hợp lệ khi fingerprint và môi trường không đổi, không chạy build lặp lại cho một lượt kiểm thử không sửa source. Các số pass không thay thế trạng thái FAIL/SKIP của từng luồng.

Lỗi phải được tái hiện và phân loại source/UI, fixture, môi trường hoặc provider; không sửa assertion để có kết quả xanh. Mọi script/log/ảnh mới dùng thư mục artifacts mới, không ghi đè bằng chứng cũ. Dừng toàn bộ tiến trình do lượt này tạo và xác minh nguồn/dirty tree giữ nguyên khi bàn giao.

Chưa thuộc bằng chứng này: điện thoại vật lý/Safari, đăng nhập/RLS/Storage Supabase thật, kết quả Gemini/audio thật hoặc production.
