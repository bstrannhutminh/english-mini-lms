# Browser QA — câu hỏi Listening bằng tiếng Anh

Status: DONE. Ngày 20/11/2026, Asia/Ho_Chi_Minh. **12/12 kiểm tra hẹp PASS** trên phiên L1 có sẵn:
`http://127.0.0.1:3000/learn/badf0fb3-0fe6-46b1-b292-9e0b2425215f`.

## Nguồn và kết quả

- Đã đọc README, plan, `l1-questions.yaml` và `listening-questions-card.tsx`. Hash năm YAML + component khớp byte với isolated preview: [source hashes](english-questions-261120-1814-artifacts/browser-source-hashes.json).
- Cả 3 legend chứa English prompt và 12 lựa chọn A–D khớp chính xác YAML ở viewport 1440 và 375. Tiền tố UI `Câu 1/2/3` và tiêu đề tiếng Việt được giữ đúng phạm vi.
- Source IDs `q1/q2/q3`, option IDs `A/B/C/D` đúng. DOM radio names là `listening-q1/q2/q3`, values A–D; `input.id` rỗng theo component hiện tại. Không đổi lựa chọn: checked `0 → 0`.
- Không tràn ngang hoặc text box vượt label/legend. Font 16px; label cao 52–78px desktop, 78–130px mobile, vượt target 44px. Lựa chọn dài nhất q3-B xuống dòng đầy đủ.
- [Kết quả 12 checks](english-questions-261120-1814-artifacts/browser-results.json), [expected source text](english-questions-261120-1814-artifacts/browser-source-expected.json), [DOM 1440](english-questions-261120-1814-artifacts/browser-dom-1440.json), [DOM 375](english-questions-261120-1814-artifacts/browser-dom-375.json).

## Hình ảnh đã trực tiếp xem

- [Desktop 1440×1800 — đủ 3 câu](english-questions-261120-1814-artifacts/browser-questions-1440-clear.png).
- Mobile 375×1000: [Câu 1](english-questions-261120-1814-artifacts/browser-question-1-375-clear.png), [Câu 2](english-questions-261120-1814-artifacts/browser-question-2-375-clear.png), [Câu 3 — q3-B dài nhất](english-questions-261120-1814-artifacts/browser-question-3-375-clear.png).
- Đã scroll để chụp ngoài vùng header/footer cố định, không sửa DOM/CSS để giấu UI. Header kết thúc ở y157.75, footer bắt đầu y879; ở scroll tối đa, option q3-D kết thúc y833.88 nên xem đủ. [Viewport metrics](english-questions-261120-1814-artifacts/browser-clear-viewport-metrics.json).
- Ảnh full/capture ban đầu có sticky UI che một phần và một ảnh được chụp trước hydration; chúng được giữ riêng. Ảnh `*-clear` ở trên là bằng chứng hình ảnh cuối.

## Ranh giới read-only và cleanup

- Browser connector hiện có không hỗ trợ request interception; dùng skill `ak-web-testing` và CDP `next/dist/compiled/ws` sẵn có, Chrome/profile riêng, IPv4/port9337. Không dùng tab người dùng.
- Chặn mọi local API mutation trước server; không có mutation request được quan sát. YouTube `iframe_api` bị abort trước provider; video không thuộc lượt kiểm tra này. [Network](english-questions-261120-1814-artifacts/browser-network.json), [capture network](english-questions-261120-1814-artifacts/browser-capture-network.json), [desktop network](english-questions-261120-1814-artifacts/browser-desktop-network.json).
- Chỉ đọc và scroll phiên cũ; không chọn đáp án/reveal/submit, mở study/session mới, gọi provider, sửa app/content/config/tests/DB/Git hoặc động server. Transcript hiển thị sẵn khi tải phiên; QA không bấm reveal. URL query được bỏ khỏi receipt để tránh export token.
- Console chỉ có React DevTools/HMR, không warning/error hoặc runtime exception. [Console](english-questions-261120-1814-artifacts/browser-console.json), [capture console](english-questions-261120-1814-artifacts/browser-capture-console.json), [desktop console](english-questions-261120-1814-artifacts/browser-desktop-console.json).
- Các Chrome riêng đều exit0, profile đã xóa; port 9337 không listener. PID cuối 26451: [lifecycle](english-questions-261120-1814-artifacts/browser-process.json). Preview PID 1253 và PG PID 26892 được giữ; QA không tác động server của phiên khác. PID 93826 thuộc metadata cũ, không dùng làm bằng chứng server đang chạy.

## Còn mở

Browser coverage chỉ L1 (3 câu/12 lựa chọn); L2/L4/I-L1/I-L2 đã đối chiếu byte nhưng chưa mở UI. Chưa test thiết bị Safari/iPhone/Android vật lý, production hoặc người dùng duyệt hình ảnh. Các thao tác chọn/reveal/submit/chấm nằm ngoài lượt read-only này.
