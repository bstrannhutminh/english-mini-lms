# Khảo sát thị giác trước khi làm mới LMS

Ngày 20/11/2026. Kết luận: cần thay thứ bậc và nhịp bố cục, bên cạnh xử lý các lỗi tương tác đã có bằng chứng. Giao diện hiện tại có nhận diện thống nhất nhưng nhiều khối ngang cấp, chữ phụ nhỏ và nội dung phụ đứng trước hành động học.

## Môi trường và phạm vi

HEAD `a29c99e`. Preview isolated `http://127.0.0.1:3000`, dữ liệu mẫu, curriculum approved. Browser riêng `lms-refresh-261120`; không dùng tài khoản hay dữ liệu thật. Khảo sát nguồn độc lập tại [scout](scout-261120-0013-lms-visual-refresh.md), QA behavior trước tại [QA19/11](qa-261119-1600-lms-ui-ux.md).

Ảnh đã có ở375×812,768×1024,1440×900: Today, Library, MyWork list/feedback, Vocab, Progress, onboarding bước1, Writing và Reading bằng session mẫu sẵn. Thêm Library hover/noresults và menu tài khoản375. Không tạo/nộp bài, sửa hồ sơ, mở hint, ghi âm hay gọi AI. Speaking/listening mới chưa có bộ ảnh hoàn chỉnh; không suy ra nghiệm thu từ kiểm trước. Wizard bước2–4 và toàn bộ modal/error chưa được đi lại trong khảo sát này.

## Quan sát chính

| Quan sát | Bằng chứng | Hướng sửa |
|---|---|---|
| Today mobile dành nhiều chiều cao cho chào/thời lượng/lý do; CTA xuống sát bottomnav | [375 Today](visual-261120-0013-lms-refresh-artifacts/375-today-loaded.png) | Rút gọn header, một nhiệm vụ chính và CTA trước nội dung phụ. |
| Desktop nhiều card ngang cấp, không xác định rõ nội dung nào cần chú ý đầu tiên | [1440 Today](visual-261120-0013-lms-refresh-artifacts/1440-today-loaded.png) | Khối bài chính rộng, lộ trình nhỏ ở cột phụ, nhóm bằng khoảng trắng/viền mảnh. |
| Library mobile đưa3 topic cards và recommendation trước ô tìm/bài học; bài đầu xuống khoảngy909 theo probe của browser worker | [375 Library](visual-261120-0013-lms-refresh-artifacts/375-library-loaded.png) | Search và bộ lọc gọn trước danh sách, suggestion theo phạm vi lọc. |
| Primary/links/badges có contrast yếu | `render-today.log`, `render-library.log` và JSON trong artifactdir | Accent Teal đậm có contrast đạt, dùng semantic token tại shared và native controls. |
| Learning cần đọc thoáng và trạng thái lưu nhìn thấy trên mobile | [375 Writing](visual-261120-0013-lms-refresh-artifacts/375-learn-writing-loaded.png), [1440 Writing](visual-261120-0013-lms-refresh-artifacts/1440-learn-writing-loaded.png) | Header có tên bài/trạng thái, worksheet hai vùng trên desktop, đề mở/thu gọn trên mobile mà giữ editor state. |

Render-check hiện tại: Today **0 errors/27 warnings**, Library **0 errors/27 warnings** trên3 viewport. Warnings gồm contrast khoảng3.65–3.74:1 và một số sr-only false positives; không coi54warnings là54bug riêng. Source/UI không sửa trong baseline. Vocab375 lần này không tràn theo probe `scrollWidth=375`; điều này không phủ nhận lỗi320/768 trong QA trước vì viewport/state khác.

## Đề xuất và giới hạn

[Kế hoạch làm mới](../261120-0013-lms-visual-refresh/plan.md) giữ Teal/Inter và học thật theo các invariant, thay bố cục/typography/control/interaction state trên toàn bộ các màn hiện có. [Bản mẫu độc lập](../261120-0013-lms-visual-refresh/design-proposal.html) dành cho duyệt hướng thị giác, không đại diện implementation hoàn tất.

Không chạy lại unit/build vì chưa đổi source; không có bằng chứng mới cho Supabase/Gemini/Storage/RLS/production hay điện thoại vật lý. Lỗi hint503, Settings activityId, batch/focus và reminder giữ trong scope sửa theo QA có receipt, không gán là đã sửa.

Câu hỏi chưa giải quyết: người dùng duyệt hướng thiết kế và Implementation Plan trước khi thay sản phẩm.
