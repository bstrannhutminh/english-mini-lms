# Bàn giao bản làm mới UI/UX LMS — 20/11/2026

Đã triển khai toàn bộ giao diện trong phạm vi được duyệt và kiểm tra các luồng chính trên bản local. Lint, typecheck, unit và build đều đạt; browser QA trọng yếu đạt, critique thị giác cuối **21/24**. Bản này sẵn sàng để người dùng xem và đánh giá trực tiếp; chưa phải nghiệm thu provider hoặc production.

Phạm vi và tiêu chí: [kế hoạch đã duyệt](../261120-0013-lms-visual-refresh/plan.md). Working tree trên `feat/lms-architecture-ux-onboarding`, baseline `a29c99e7fa2a854826dfb0935a61839ba262921c`; chưa commit, push, merge hoặc deploy.

## Giao diện và luồng đã thay đổi

- Hôm nay ưu tiên một việc học chính, hiển thị đầy đủ CTA trên mobile; lộ trình và lý do gợi ý nằm sau hành động học.
- Thư viện đưa tìm kiếm và bộ lọc tới danh sách bài, giữ query/chủ đề/kỹ năng/trạng thái qua reload và browser Back.
- Onboarding bốn bước giữ lựa chọn khi lưu lỗi; bỏ qua vẫn lưu thời lượng 30/45 phút được chọn khi request thành công.
- Không gian Viết, Đọc, Nói, Nghe/Shadowing có đề và vùng trả lời rõ trên desktop, đề thu gọn trên mobile, trạng thái lưu nháp và timer nhìn thấy. Giữ routing IELTS hiện có.
- Bài làm, góp ý và bản sửa ưu tiên việc cần sửa, giữ câu gốc/vấn đề/gợi ý/ví dụ/yêu cầu thử lại/giới hạn; so sánh hai bản theo chiều cao nội dung.
- Sổ từ, thẻ ôn, bài viết câu, Cài đặt, Tiến độ, Quản trị, Đăng nhập và các màn loading/error/offline dùng chung nhịp chữ, khoảng cách và controls.

Giữ Teal/Inter, stack và curriculum approved. Không thêm dependency, migration hoặc kết nối dữ liệu phòng khám. Review nguồn không còn finding mở trong phạm vi đã giao; giữ append-only, server-side assisted, `not_assessable` khi thiếu audio và `practice_estimate`.

## Bằng chứng kiểm tra

| Gate | Kết quả | Receipt |
|---|---|---|
| `npm run lint` | exit 0 | [lint-delivery.log](verification-261120-0051-lms-refresh-artifacts/lint-delivery.log) |
| `npm run typecheck` | exit 0 | [typecheck-delivery.log](verification-261120-0051-lms-refresh-artifacts/typecheck-delivery.log) |
| `npm test -- --maxWorkers=1 --no-file-parallelism` | 50 files / 394 tests đạt | [unit-delivery.log](verification-261120-0051-lms-refresh-artifacts/unit-delivery.log) |
| `npm run build` | exit 0, Next 16.3.6 | [build-delivery.log](verification-261120-0051-lms-refresh-artifacts/build-delivery.log) |
| Source review độc lập | 7 findings và nhánh hotkeys/load error đã đóng | [review, mục xác minh nguồn cuối](code-review-261120-0051-lms-refresh.md) |
| Browser QA | Các luồng trọng yếu đạt trên dữ liệu local mẫu | [báo cáo browser](browser-261120-0120-lms-refresh.md) |
| Critique thị giác | Vòng 1: 20/24; vòng 2: 21/24; không mục 0 | [rubric và giới hạn](browser-261120-0120-lms-refresh-artifacts/visual-critique.md) |

Receipt lệnh cuối: [delivery-checks.json](verification-261120-0051-lms-refresh-artifacts/delivery-checks.json). Các log này bao gồm source polish cuối. Không chạy lại suite sau khi chỉ cập nhật hồ sơ bàn giao.

Kiểm tra nguồn lúc bàn giao: [delivery-current-source.json](verification-261120-0051-lms-refresh-artifacts/delivery-current-source.json) ghi hash của 519 input; `src/` và `public/` của preview khớp source, không có khác biệt. Timestamp input cuối trước các log delivery. Digest mới xác định nguồn hiện tại; receipt lệnh cũ không chứa full digest nên không tuyên bố liên kết mật mã hồi tố với từng lần chạy.

Quét literal credential trên source/tests đã đổi không phát hiện mẫu key/JWT; `.env` và `.env.local` được ignore, không có file staged. Không đọc dotenv hoặc in giá trị credential. Tracked pattern scan chỉ xuất đường dẫn; một pattern hit hoặc tên biến chưa phải bằng chứng có literal secret.

## Browser đã đi qua

Các màn chính và bốn kỹ năng có ảnh 375/768/1440px; probe 320px riêng cho Library, Vocab, Settings và bốn kỹ năng không tràn ngang. Controls có ý nghĩa được đo với vùng bấm ít nhất 44px; radio/checkbox tính cả label. Today CTA cuối ở y510–558, trước bottom navigation y732. Đây là các mẫu/state đã kiểm, không phải chứng nhận accessibility toàn ứng dụng.

Đã xác nhận hint/reveal 503 không mở hỗ trợ; retry được server chấp nhận mới mở. Modal giữ focus với Tab/Shift+Tab và timer, Escape trả trigger; Capture → YouGlish đóng riêng dialog con và giữ scroll lock. Flashcard có save/discard/cancel, giữ batch và `clientReviewId` khi retry/reload, Undo về zero không khôi phục grade cũ; lỗi tải chặn hotkeys nền. Written-review pending khóa input và giữ văn bản khi lỗi.

Đã gõ thêm trong lúc autosave cũ bị trì hoãn, rồi lưu và thoát: request cuối và editor reload giữ input mới nhất. Settings chấp nhận activity ID TEXT, lỗi preferences rollback. First-run pending/default30 → chọn45 → Skip gửi PATCH200, Today hiển thị45; baseline/preferences mẫu ban đầu được khôi phục. Admin keyboard/menu/editor cancel và invalid-source đã thử; create collision có bằng chứng source/unit riêng. Offline fallback hoạt động trong browser emulated offline.

114 ảnh trực tiếp được lập [catalog với kích thước thật](browser-261120-0120-lms-refresh-artifacts/screenshot-catalog.json). Không dùng skeleton hoặc hai prefix ảnh cũ sai kích thước làm viewport proof. Raw timeout/stream abort, tab hidden và pending attempts giữ ở artifacts, được phân loại trong [attempt-classification.json](browser-261120-0120-lms-refresh-artifacts/attempt-classification.json). Lint trước đó scan generated preview bundles được sửa bằng ignore artifact; không tắt rule trên source và không xóa log lỗi cũ.

## Trước và sau

Cùng trang Hôm nay trên hồ sơ mẫu ở 375px; trạng thái từ đến hạn thay đổi trong QA nên không so số lượng từ như cải thiện sản phẩm. Ảnh full-page chứa thanh navigation cố định tại vị trí viewport ban đầu.

| Trước làm mới | Source mới chạy local |
|---|---|
| [Today baseline](visual-261120-0013-lms-refresh-artifacts/375-today-loaded.png): khối chào/gợi ý/giải thích đẩy CTA sát thanh navigation. | [Today cuối](browser-261120-0120-lms-refresh-artifacts/375-today-final.png): hành động sửa bài rõ, trọn nút trước navigation; thông tin phụ thu gọn. |
| [Library baseline](visual-261120-0013-lms-refresh-artifacts/375-library-loaded.png): khám phá chủ đề đứng trước danh sách. | [Library mới](browser-261120-0120-lms-refresh-artifacts/375-library.png): tìm kiếm/bộ lọc/kết quả cùng một luồng. |

Ảnh bổ sung: [Writing desktop](browser-261120-0120-lms-refresh-artifacts/1440-writing-final.png), [Settings mobile](browser-261120-0120-lms-refresh-artifacts/375-settings-polished.png), [Compare desktop](browser-261120-0120-lms-refresh-artifacts/1440-compare-polished.png).

## Local và cách xem

Mở **http://127.0.0.1:3000/today**. Preview dùng hồ sơ **Bản xem thử**, 16 activity approved và dữ liệu bài/góp ý/từ mẫu có ghi nhãn; `DEV_BYPASS_AUTH` chỉ ở môi trường cô lập. Fixture và HTTP intercept chứng minh UI/retry, không chứng minh Gemini chấm hoặc Supabase Auth hoạt động.

Lúc bàn giao, listener Next PID **26111**, parent **98799**, ở `plans/reports/local-preview-261119-2241-artifacts/app`; HTTP Today trả200. PID98800 ghi trong checkpoint cũ đã thoát. PostgreSQL mẫu PID **26892**, port **54329** được giữ để người dùng xem. Chrome QA PID3645 và browser/render-check riêng đã đóng, profile QA được xóa: [cleanup](browser-261120-0120-lms-refresh-artifacts/cleanup.json). Không mở server trùng hoặc dừng process của người dùng.

Đã gửi lệnh mở URL bằng trình duyệt mặc định, exit0; [receipt lúc mở local](verification-261120-0051-lms-refresh-artifacts/delivery-preview-runtime.json) ghi HTTP200, listener hiện tại và browser QA đã đóng. Lệnh mở được hệ điều hành nhận không thay cho việc người dùng xác nhận đã xem giao diện.

Kiểm tra tay: mở Hôm nay → bài chính → thử viết/đọc; xem Bài làm → góp ý → bản sửa/so sánh; vào Sổ từ → ôn thẻ; thử tìm/lọc trong Thư viện rồi Back; mở Cài đặt → chỉnh lộ trình. Trên điện thoại thật, thử cuộn khi bàn phím mở và nghe lại bản ghi của mình. Hướng dẫn thao tác: [hướng dẫn LMS](../../docs/huong-dan-lms-2026-11-19.md).

Nhật ký local: [bàn giao UI/UX](../journals/2026-11-20-bn-giao-bn-lm-mi-ui-ux-english-mini-lms.md). AgentWiki publish skipped; không xuất bản ra dịch vụ khác. Tiến độ và các checklist được đối chiếu riêng trong [báo cáo PM](pm-261120-lms-refresh-final.md).

## Phần chưa nghiệm thu

Người dùng chưa duyệt giao diện sau triển khai. Critique còn 3 mục dưới2: observation đơn desktop có cột hơi hẹp; state matrix chưa đủ hover/loading/success cho từng control; icon Vocab/review và một số chi tiết chưa có bằng chứng polished đầy đủ.

Chưa xác minh Safari/thiết bị vật lý, browser zoom200% thật, chất lượng audio, upload Storage thật, Gemini, Supabase Auth/RLS/OAuth, Admin wizard bước2–4/Drive sync trên dịch vụ thật hoặc production. Không có coverage% hay WCAG certification suy diễn từ tổng test/ảnh.

Câu hỏi chưa giải quyết: không có quyết định sản phẩm mới; còn người dùng xem và chấp nhận hướng thị giác, cùng các gate runtime/provider ngoài phạm vi local đã nêu.
