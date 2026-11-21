# Đã sửa câu hỏi nghe sang tiếng Anh

Ngày 20/11/2026. Tải lại [bài đang học](http://127.0.0.1:3000/learn/badf0fb3-0fe6-46b1-b292-9e0b2425215f): ba câu hỏi và các lựa chọn A–D hiện bằng tiếng Anh.

## Thay đổi

Đã dịch 15 câu hỏi và 60 lựa chọn trong năm bộ L1/L2/L4/I-L1/I-L2. Chỉ thay `prompt` và `options[].text`; mã câu hỏi/lựa chọn, thứ tự, đáp án, mốc nghe lại và giải thích được đối chiếu trước/sau và giữ nguyên. Giao diện hướng dẫn và giải thích hỗ trợ vẫn tiếng Việt.

Nguyên nhân là học liệu YAML viết tiếng Việt; màn học render nguyên nội dung. DB mẫu xác nhận L1/L2/L4 có `questions=null` và đọc YAML. Đồng bộ đúng năm file vào preview đang chạy đã sửa cùng URL cũ; không ghi DB, seed lại dữ liệu hay restart server.

Kiểm tra cuối còn phát hiện thay đổi ảnh Vocabulary của phiên khác làm fixture thiếu `imageUrl` và ba test khôi phục lượt ôn cũ thất bại. Response schema giờ mặc định ảnh trống thành `null`, giữ kiểu output và feature ảnh. Hai fixture cập nhật cấu trúc mới; thêm test cho snapshot cũ thiếu ảnh. Không bỏ hoặc nới assertion cũ. Bản sửa bảo vệ khôi phục lượt ôn, không sửa DB/schema hoặc logic chấm điểm.

## Kiểm chứng

| Kiểm tra | Kết quả cuối |
|---|---|
| Đối chiếu năm YAML | 15 câu/60 lựa chọn English; mọi field khác giữ nguyên |
| Test liên quan | 8 file, 53/53 test PASS |
| `npm run lint` | Exit0; 0 lỗi, 2 warning `<img>` trong Markdown/flashcard của thay đổi đồng thời |
| `npm run typecheck` | Exit0 |
| Unit toàn bộ | 51 file, 402/402 test PASS |
| `npm run build` | Exit0 trên source copy riêng |
| Browser L1 | 12/12 PASS; 3 prompt/12 lựa chọn khớp YAML; IDs/values q1–q3/A–D giữ nguyên; ảnh 1440/375px đã xem trực tiếp |

[Đối chiếu nội dung](english-questions-261120-1814-artifacts/content-integrity.json), [test hẹp](english-questions-261120-1814-artifacts/focused-after.log), [gates cuối](english-questions-261120-1814-artifacts/checks-final.json), [QA trình duyệt](browser-qa-261120-1814-english-questions.md), [ảnh desktop](english-questions-261120-1814-artifacts/browser-questions-1440-clear.png), [ảnh mobile](english-questions-261120-1814-artifacts/browser-question-3-375-clear.png).

589 input source/config khớp trước chạy. SHA256 source/config, loại file Next tự sinh: `7d6ac4ab39342e5b9c5c2aa6a2b4280c1000617dda99e3aa3140012b9e04c188`; source/config không drift. Next chỉ đổi `next-env.d.ts` trong bản sao từ import dev sang production như dự kiến. Bản sao build và browser/profile QA đã dọn; preview PID1253/IPv4 port3000 và PG mẫu PID26892/port54329 giữ nguyên. Server của phiên khác PID15545 kết thúc trong lượt kiểm tra; checker không gửi signal đến nó.

Lần typecheck lỗi đầu và ba test thất bại trước sửa tương thích được giữ riêng trong artifacts. Cả bốn gates cuối đã được chạy lại sau sửa; không gộp lần lỗi thành PASS. QA chặn mutation API và media/provider, chỉ đọc/scroll bài hiện có.

## Cách kiểm tra tay và giới hạn

Tải lại bài cũ, kiểm tra câu hỏi/lựa chọn tiếng Anh rồi làm bài như trước. Nộp để xem đáp án và giải thích hỗ trợ. Chưa test thao tác chọn/reveal/submit trên thiết bị thật hoặc production trong lượt này; browser chỉ xác nhận L1, hai bộ IELTS chưa được nạp vào DB mẫu. Test ngôn ngữ dùng dấu tiếng Việt để bắt lỗi tái xuất hiện; chất lượng diễn đạt đã được controller rà, không dùng nó như bộ nhận diện ngôn ngữ tổng quát.

Không còn quyết định triển khai nào cần người dùng trả lời trong phạm vi sửa này.
