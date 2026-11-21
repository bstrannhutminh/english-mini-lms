# Bàn giao YouGlish trên thẻ quẹt

Ngày 20/11/2026. Đã hoàn tất tích hợp trên bản local: [mở màn ôn thẻ](http://127.0.0.1:3000/vocab/flashcards).

## Cách dùng

1. Trong **Sổ từ → Ôn bằng thẻ**, chọn **Ôn tự do** nếu muốn xem cả những từ chưa đến hạn.
2. Bấm **Nghe ví dụ qua YouGlish** ở mặt trước hoặc sau thẻ, rồi bấm nút phát trong khung video.
3. Đóng khung để tiếp tục cùng thẻ và mặt đang xem; chọn **Đã thuộc / Chưa thuộc** hoặc quẹt để ghi kết quả ôn. Nút **Nghe** vẫn đọc từ bằng giọng trình duyệt.

Mở YouGlish dừng TTS đang đọc, khóa thao tác ôn ở nền và không tự chấm từ. Đóng khung gỡ iframe/video, trả focus về nút mở và giữ các lượt ôn chưa lưu. Khi từ không có ví dụ hoặc dịch vụ không tải được, hiện link tìm thêm trên YouGlish.

## Bằng chứng cuối

| Kiểm tra | Kết quả |
|---|---|
| `npm run lint` | Exit 0; 0 lỗi, 1 cảnh báo `@next/next/no-img-element` tại `src/components/ui/markdown-text.tsx:32`, ngoài thay đổi YouGlish |
| `npm run typecheck` | Exit 0 |
| `npm test -- --maxWorkers=1 --no-file-parallelism` | 50 file, 396/396 test PASS |
| `npm run build` | Exit 0; build trên bản sao riêng với cấu hình công khai giả, không gọi DB hoặc Gemini |
| Browser | 20/20 thao tác PASS; ảnh 320/375/1440px đã xem trực tiếp |
| Provider thật | Thẻ fixture `hello`, widget/YouTube thật: native Play phát clip TED, thời gian tăng 216.61 → 222.52 giây; đóng còn 0 iframe |

[Gates cuối](youglish-261120-1601-artifacts/checks-final.json), [báo cáo QA](qa-261120-1601-flashcards-youglish.md), [receipt video](youglish-261120-1601-artifacts/live-provider-summary.json), [ảnh đang phát](youglish-261120-1601-artifacts/live-provider-hello-after-play.png).

Bản kiểm tra có 585 input source/config khớp từng file trước/sau, SHA256 tổng `394c9592a61d33eb0d11efe46c89d9a405c5c8a993dd7abb37ffeb70d664033e`. Deck SHA256 `dde1baea9aded3e586c14bb30b44ef3d7050c0f8a5601ad9e431e038be72df24` khớp bản đã qua browser. [Đối chiếu source](youglish-261120-1601-artifacts/snapshot-source-final.json), [review của controller](youglish-261120-1601-artifacts/controller-review-final.json).

## Phạm vi và vận hành

Thay đổi thuộc lượt tích hợp: `flashcard.tsx`, `flashcard-deck.tsx`, ignore QA artifacts trong `eslint.config.mjs` và [hướng dẫn dùng LMS](../../docs/huong-dan-lms-2026-11-19.md). Props mới tùy chọn; API, DB và SRS giữ hợp đồng hiện tại. Các chỉnh sửa IELTS/Markdown của lượt khác được giữ nguyên. Repo vẫn có một nhánh `master` và một worktree.

Bốn component liên quan khớp source/preview. Preview có riêng giới hạn Tailwind scan để tránh cache/artifacts; CSS chính và style tokens không đổi. Preview PID 1253/IPv4 port 3000 và PostgreSQL mẫu PID 26892/port 54329 được giữ cho người dùng; server của phiên khác PID 93826 được giữ. Chrome/profile QA, bản sao build và process con của build đã dọn; `.next` của repo không đổi. [Cleanup build](youglish-261120-1601-artifacts/lifecycle-final.json), [cleanup browser](youglish-261120-1601-artifacts/live-provider-browser-process.json).

Lần kiểm tra cuối đầu tiên lỗi cấu hình npm dùng chung `/dev/null` cho user/global, trước ESLint; lần thứ hai dùng hai file trống riêng và cả bốn gates đạt. Lịch sử lỗi focus/preview/Tailwind và các thử provider trước vẫn được giữ trong báo cáo QA; không gộp chúng thành PASS. Quét phần diff sở hữu không phát hiện secret literal; dotenv được ignore, không đọc dotenv. QA chặn mutation API local và không ghi kết quả ôn vào DB.

## Còn cần xác nhận

Điện thoại vật lý, nghe âm thanh bằng tai, người dùng duyệt hình ảnh và luồng với tài khoản/hạ tầng production. Hai thuật ngữ mẫu `linear transducer` và `fascial compartment` trả empty/404; playback `hello` không chứng minh mọi cụm từ có video. Không còn quyết định triển khai nào cần người dùng trả lời trong phạm vi tích hợp này.
