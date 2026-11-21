# Sửa học liệu và kiểm tra

Thực hiện theo [kế hoạch](plan.md). Root sở hữu năm YAML câu hỏi, test ngôn ngữ và đoạn hướng dẫn tương ứng. QA/checker chỉ ghi báo cáo/artifacts; giữ thay đổi Vocabulary và nội dung của các phiên khác.

- [x] Chuyển 15 câu hỏi và 60 lựa chọn trong năm file YAML sang tiếng Anh; metadata, thứ tự, mã câu hỏi/lựa chọn, đáp án, giải thích và mốc nghe lại giữ nguyên.
- [x] Kiểm tra hồi quy ngôn ngữ và schema; test nghe/chấm/khóa transcript liên quan đạt.
- [x] Sync đúng năm file vào preview đang chạy; cùng URL cũ hiển thị English prompts/options, không sửa DB hoặc restart server.
- [x] Kiểm tra browser và ảnh, các gate cuối và source freshness; dọn process/temp của QA/checker.
- [x] Hướng dẫn, báo cáo và journal khớp bằng chứng; cập nhật kế hoạch theo kết quả thực tế.

DB đã kiểm read-only: L1/L2/L4 đọc YAML vì `questions=null`; không có thay đổi dữ liệu nên không cần backup/restore DB. Bản YAML trước sửa và trước sync preview lưu trong `plans/reports/english-questions-261120-1814-artifacts/` để rollback từng field/file sở hữu.
