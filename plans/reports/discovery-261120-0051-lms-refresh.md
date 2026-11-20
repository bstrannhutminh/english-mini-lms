# Làm mới Hôm nay, Thư viện và onboarding

Ngày: 20/11/2026 · Trạng thái: triển khai xong trong phạm vi file; chờ kiểm tra browser của controller.

## Kết quả

- Hôm nay: header gọn, thời lượng 30/45, một nhiệm vụ chính. Phiên dở được ưu tiên; bản sửa có nhãn đúng hành động server. Desktop chia nhiệm vụ 8/12 và chu trình 4/12; mobile đặt nội dung phụ phía sau. Lý do gợi ý nằm trong disclosure. Đổi bài giữ nguồn và lý do thật. Khi đổi thời lượng/thử lại, bỏ dữ liệu cũ trong lúc tải để tránh gợi ý sai thời lượng.
- Thư viện: tìm kiếm/trạng thái/kỹ năng trước chủ đề và kết quả; dải chủ đề gọn, cards dễ đọc. Bộ lọc nằm trong URL `q/topic/skill/status`; nhận `query` alias và `?topic=` cũ. History API của Next 16 giữ back/reload; giữ tham số lạ, tham số lặp và hash. Suggestion chỉ xuất hiện khi bài thuộc kết quả; số đếm kỹ năng xét topic/status/query, số đếm chủ đề xét skill/status/query. IELTS luôn hiện, kể cả 0 bài. Tìm kiếm đã bao gồm tên chủ đề hiển thị.
- Chi tiết bài: objective, thời lượng, một CTA và chọn 30/45 trước đề bài trên mobile; desktop đề bài 8/12, bắt đầu 4/12. Nguồn và trọng tâm góp ý mở dần. Luồng tạo/409/revision giữ `parentId`.
- Onboarding: 4 bước mục tiêu/nhịp học/tự đánh giá/xem lại, back/skip/re-entry. Các lựa chọn được khóa khi gửi; lỗi giữ draft và nhận focus; chỉ báo thành công sau response đã parse. Tự đánh giá dùng radio thật (Tab/phím mũi tên), mặc định trung tính 3 được giải thích rõ. Không tự điền chuyên môn hoặc sách như dữ kiện của người học; re-entry giữ cả trường trống và mục tiêu tùy chỉnh. Skip lưu thời lượng đã chọn cùng flags cũ. Lỗi tải hồ sơ hiện retry thay vì mở defaults để ghi đè nhầm.
- Chữ thao tác/nội dung 16px, controls ≥44px, hairline/tint và semantic tokens; không thêm dependencies. Giữ `data-tour`, mode metadata, API envelope, server algorithms và mọi guard học tập.

## File sở hữu

`src/features/{today,library,onboarding}/**`; 3 route composition `library/page.tsx`, `library/[id]/page.tsx`, `onboarding/page.tsx`; tests riêng trong `tests/unit/{library,onboarding}/`.

Mới: `src/features/library/library-filter-url.ts`, `tests/unit/library/library-filter-url.test.ts`.

## Đã kiểm tra

- Focused Vitest: 4 suites, **22 tests đạt** — URL/filter, profile/preferences, learning-focus.
- Scoped ESLint: toàn bộ 3 feature, 3 route và tests chỉnh sửa — **đạt**. Đã sửa lint React Compiler memoization và JSX trong try.
- Source review: không có `text-xs/text-sm`, màu hardcode, inline style hoặc shadow trong TSX của 3 feature.
- Không đọc env, không chạm DB, không gọi provider, không khởi động server, không commit.

## Chưa xác minh

Controller cần browser/render-check: Today fresh/in-progress/revision/error/noactivity ở30/45, CTA đầy đủ trên375×812; Library topic/query/status/IELTS0, back/reload, suggestion/count scope; wizard4steps/skip/failedsave/re-entry/radio arrows. Chưa có bằng chứng ảnh/contrast computed/real-device trong subtask này. Full lint/typecheck/unit/build do controller chạy sau khi ghép shared edits.

## Cách kiểm tra tay trên điện thoại

1. Hôm nay: chọn30/45, vào/tiếp tục bài; mở lý do và đổi bài.
2. Thư viện: tìm “học thuật”, chọn chủ đề/kỹ năng/trạng thái; thử IELTS ở chủ đề không có bài; back và tải lại để kiểm bộ lọc.
3. Thiết lập: đổi thời lượng45, tự chọn4 kỹ năng, xem lại/lưu; mở lại hồ sơ. Thử bỏ qua hoặc response lỗi để xác nhận draft và thời lượng.

## Câu hỏi chưa giải quyết

Không có câu hỏi về phạm vi; nghiệm thu thị giác/browser còn ở controller.
