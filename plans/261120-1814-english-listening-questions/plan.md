---
title: "Sửa câu hỏi nghe sang tiếng Anh"
status: completed
created: 2026-11-20
branch: master
---

# Sửa ngôn ngữ câu hỏi nghe

## Kết quả và ranh giới

Câu hỏi và lựa chọn trả lời trong bài nghe bằng tiếng Anh; hướng dẫn giao diện và giải thích hỗ trợ giữ tiếng Việt. Người dùng đã yêu cầu sửa ngay. Giữ nguyên câu hỏi, thứ tự lựa chọn, đáp án, mốc nghe lại và mọi bài làm đã lưu. Không đổi API/schema/chấm điểm, không seed lại toàn DB, không đọc dotenv, không đổi nhánh hoặc worktree.

## Chẩn đoán và review kế hoạch

GET `/learn/badf0fb3-0fe6-46b1-b292-9e0b2425215f` HTTP200 hiển thị ba câu hỏi tiếng Việt của L1. `ListeningQuestionsCard` render nguyên `prompt` và `options[].text`; `loadListeningQuestions` ưu tiên DB array, rồi đọc YAML khi DB null. Năm YAML câu hỏi L1/L2/L4/I-L1/I-L2 đều có cùng vấn đề, tổng 15 câu.

DB mẫu IPv4 port54329 xác nhận L1 có `questions=null`, `questions_file=texts/l1-questions.yaml`; L2/L4 tương tự, L3 dùng fallback. Do đó sửa YAML và sync vào preview là đủ; không cần thay dữ liệu DB. Đã đọc metadata kết nối mẫu có kiểm tra loopback/port, không đọc dotenv. Kiểm tra role `thuanyogi` ban đầu thất bại; kết nối bằng cấu hình mẫu đúng đã xác nhận nguồn dữ liệu.

Controller review: sửa duy nhất `prompt`/`options[].text`, thêm test ngôn ngữ của các bộ học liệu. Đối chiếu semantic YAML trước/sau để bảo đảm metadata, đáp án và giải thích không đổi; test chấm nghe hiện có và bản render thật xác nhận không lệch lựa chọn. Không thêm dịch động vào UI hoặc đổi nội dung y khoa. Những thay đổi Vocabulary/IELTS của phiên khác được giữ nguyên.

Kiểm tra cuối gặp sáu lỗi type ở fixture Vocabulary vì phiên khác thêm trường `imageUrl` nullable bắt buộc. Kiểm tra hẹp chứng minh ba test khôi phục lượt ôn cũ thất bại: schema mới không nhận snapshot chưa có trường ảnh. Bổ sung tương thích `.default(null)` ở response schema, cập nhật hai fixture API hiện tại và thêm test cho snapshot cũ thiếu trường ảnh; giữ feature ảnh, kiểu output và mọi assertion hiện có. Thay đổi này bảo vệ việc học đã lưu, không đổi DB hay logic chấm.

## Thực hiện và nghiệm thu

Một phase: [Sửa học liệu và kiểm tra](phase-01-repair-and-verification.md). Checklist trong phase là nguồn theo dõi tiến độ. Nghiệm thu khi đủ 15 câu/60 lựa chọn tiếng Anh, giữ các field chấm điểm và lịch sử học, cùng URL cũ hiển thị đúng sau sync, các kiểm tra cuối đạt và báo cáo ghi rõ giới hạn.

## Files

`content/english-lab/texts/{l1,l2,l4,i-l1,i-l2}-questions.yaml`, `tests/unit/listening/question-content-language.test.ts`, một đoạn trong `docs/huong-dan-lms-2026-11-19.md`; artifacts trong `plans/reports/english-questions-261120-1814-artifacts/`.

Touchpoint tương thích do verification phát hiện: `src/contracts/vocabulary.ts`, `tests/unit/vocab/deck-review-storage.test.ts`, `tests/unit/vocab/load-flashcard-data.test.ts`.

Rollback: chỉ hoàn tác các field dịch của lượt này theo bản lưu trước sửa. Không reset/stage các thay đổi khác. DB không bị ghi; không cần restore DB.

## Kết quả cuối

15 câu/60 lựa chọn đã đổi sang English; metadata/đáp án/timing/giải thích giữ nguyên. Live SSR và 12/12 browser checks trên L1 đạt, ảnh 1440/375px đã xem. 53 test liên quan và toàn bộ 51 file/402 tests PASS; lint/typecheck/build exit0, còn hai warning ảnh của thay đổi đồng thời.

589 input được kiểm trên source copy riêng; source/config không drift, `next-env.d.ts` chỉ được Next tự sinh trong snapshot theo dự kiến. Browser/profile và build copy đã dọn, preview/PG được giữ. QA không ghi DB. Các lần typecheck/test lỗi trước sửa tương thích vẫn nằm trong artifacts.

[Báo cáo sửa](../reports/fix-261120-1814-english-questions.md), [browser QA](../reports/browser-qa-261120-1814-english-questions.md), [gates cuối](../reports/english-questions-261120-1814-artifacts/checks-final.json), [journal](../journals/2026-11-20-sa-cu-hi-nghe-sang-ting-anh.md).

Giới hạn: browser chỉ L1, các bộ khác được kiểm học liệu; chưa test thiết bị thật/production hoặc nộp bài trong lượt read-only này. Không còn quyết định triển khai cần người dùng trả lời.
