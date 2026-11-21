# Premium Learning Studio — Today

> Cập nhật sau yêu cầu triển khai tiếp: người dùng đã duyệt hướng Today; Phase2–3 đã triển khai. Typecheck và build Webpack hiện đạt. Xem [Walkthrough tổng mới nhất](premium-studio-walkthrough.md); các kết quả lỗi dưới đây là receipt lịch sử của Phase1.

Ngày 20/11/2026. Trạng thái: Phase 1 đã triển khai và kiểm tra fixture; **chờ người dùng duyệt hình Today**, build/typecheck toàn dự án chưa đạt. Không coi hoàn tất toàn bộ redesign.

Đối chiếu trực quan: [mở gallery before/after](premium-today-review.html).

Kế hoạch: [plan](../261120-premium-today/plan.md), [bản yêu cầu được giao](../261120-premium-today/accepted-redesign-plan.md). Mục 3.5 yêu cầu duyệt Today trước Phase 2. `--auto` cho phép thực hiện kỹ thuật, không thay thế visual acceptance được yêu cầu riêng.

## Thay đổi

Chỉ sửa UI trong `src/features/today/`: `today-view`, `today-hero`, `recommended-card`, `continue-block`, `start-controls`, `session-plan`, `due-vocab-teaser`, `baseline-banner`; thêm `today-lesson-frame` dùng chung.

Khối chào lớn được thu thành lời chào ngắn và bộ chọn thời lượng. Hero bài học mở toàn chiều rộng, title lớn, một CTA; lý do gợi ý chuyển xuống disclosure sau CTA. Lộ trình chuyển thành stepper dưới hero, có mở chi tiết; ôn từ là tile phụ với link văn bản. Mục tiêu/streak xuất hiện sau nội dung học. Giữ phiên đang dở ưu tiên và bài khác trong disclosure; không sửa hooks/thuật toán/API.

Today không còn dùng gradient/pastel/shadow Lively. Không đổi globals vì những lớp đó còn được các màn khác dùng; chưa lan thiết kế sang Phase 2–3. Giữ nguyên dữ liệu/học liệu/Vocabulary/DB/provider/secret và các thay đổi từ trước.

## Ảnh đối chiếu thật

Ảnh từ Next app với component/hook thật, GET/POST được fixture synthetic trong browser đáp ứng. Không DB/provider; không ảnh AI. Font hệ thống fallback giống nhau ở before/after; font Inter production chưa xác minh.

| Viewport | Trước | Sau |
|---|---|---|
| 375×812 | [Before](premium-today-artifacts/before-fresh-375.png) | [After](premium-today-artifacts/after-fresh-375.png) |
| 768×1024 | [Before](premium-today-artifacts/before-fresh-768.png) | [After](premium-today-artifacts/after-fresh-768.png) |
| 1440×900 | [Before](premium-today-artifacts/before-fresh-1440.png) | [After](premium-today-artifacts/after-fresh-1440.png) |

Ở 375×812, CTA từ y933–981 xuống ngoài fold ở bản cũ chuyển lên y567–623, cao56px; bottom nav bắt đầu y732. Cùng W1, nội dung và dữ liệu mẫu. Đây là bằng chứng bố cục trên fixture, không phải cam kết mọi title dài hay điện thoại vật lý.

Các state: [active375](premium-today-artifacts/after-active-375.png), [active1440](premium-today-artifacts/after-active-1440.png), [revision375](premium-today-artifacts/after-revision-375.png), [revision1440](premium-today-artifacts/after-revision-1440.png), [empty375](premium-today-artifacts/after-empty-375.png), [empty1440](premium-today-artifacts/after-empty-1440.png), [loading](premium-today-artifacts/after-loading-375.png), [error](premium-today-artifacts/after-error-375.png).

## Critique hình ảnh

| Tiêu chí | Trước → Sau và giới hạn |
|---|---|
| Primary hierarchy | Nhiều khối màu ngang cấp → hero bài học toàn chiều rộng, CTA teal duy nhất. Đã xem trực tiếp ảnh375/1440; chưa có user acceptance. |
| Spaciousness | Lộ trình bốn thẻ lớn cạnh hero → timeline dưới hero; desktop có khoảng nghỉ rõ, mobile gọn hơn. |
| Readability | Title bài trước nhỏ hơn lời chào → bài học lớn nhất; nhãn kỹ năng được sửa thành16px, nội dung16px. Font production chưa kiểm. |
| Mobile usability | CTA ngoài fold → trước bottom nav; nút56px, chọn thời lượng44px. Bàn phím/tab kiểm browser, chưa thử điện thoại thật. |
| Consistency | Hero đề xuất/tiếp tục dùng chung TodayLessonFrame; mode lấy MODE_META. Màn khác giữ source cũ đến khi duyệt gate. |
| Polish | Bỏ chấm màu/gradient/chips trang trí, giảm nested cards; reason/timeline mở có chủ đích. Sửa viền focus CTA để thấy trên nền trắng. |

Không dùng điểm tự chấm để chứng nhận người dùng hài lòng.

## Kiểm thử thực chạy

| Lệnh/kiểm tra | Kết quả |
|---|---|
| `npm run lint` | Exit0, không lỗi;2cảnh báo `<img>` có sẵn ở markdown-text và flashcard. |
| `npx eslint src/features/today` | Exit0 sau sửa cuối. |
| `npm test` | Exit0:51files,402tests pass; invariant append-only/assisted/audio/IELTS trong suite. |
| `npm run typecheck` ban đầu | Exit0 trước Next sinh lại type route; **không dùng kết quả này làm kết luận cuối**. |
| `npm run build` | Exit1 cả sandbox và escalated: Turbopack tạo process/bind port bị môi trường từ chối (os error1). |
| `npm run build -- --webpack` | Exit1: production compile thành công35.3s, sau đó Next route-type validation lỗi. |
| `npm run typecheck` cuối | **FAIL38TS2344** trong `.next/types`: optional context của withLearner/withAdmin không khớp RouteContext. Hai helper byte-identical HEAD. [Log](premium-today-artifacts/typecheck-after-build.log). Không xóa/exclude type sinh tự động, không sửa API ngoài scope. |
| Browser interactions | **31/31pass** trên fixture:30/45 POST đúng payload; đổi bài/reset; active/draft resume không POST; revision parentId giữ ở200và409; GET503retry; POST503toast+retry; disclosures/baseline; no overflow320/375/768/1440. [Receipt](premium-today-artifacts/qa-checks.json), [network](premium-today-artifacts/qa-network.json). |
| Render checker | Exit0:0errors,12warnings đều `sr-only` chủ ý ẩn cho screen reader; giữ đúng semantics, không sửa để triệt warning. Lượt375chụp loading,768/1440fresh. Ảnh loaded375 ở matrix riêng. [Output](premium-today-artifacts/render-check-final/). |
| Accessibility |7/7checks pass;40visible text samples AA đạt, contrast thấp nhất5.21. Native Tab cho CTA start/continue có viền teal sau transition160ms (checker chờ250ms); reduced motion đạt; reflow720CSSpx tương đương desktop200% không overflow. [Receipt](premium-today-artifacts/a11y-results.json). Không thay cho native browser zoom/phone QA. |
| `git diff --check` | Pass. |
| Secret check | Staged/owned diff0potential secret values; `.env` và `.env.local` đều ignored. |

Reviewer độc lập kiểm tra invariants và final source; simplifier chạy sạch, không chỉnh nguồn. Counsel xác nhận build fallback hợp lệ nhưng không thay default-build gate. Không chạy integration, seed/migrate hoặc provider thật.

## Preview và nguồn

Main process68143 nghe3000 có cwd repo thật; không dừng hoặc cấu hình lại. Không xác định URL người dùng hiện đang mở. Preview riêng tại `http://127.0.0.1:3034/today`, cwd `/private/tmp/lms-premium-today-preview`, dùng Next Webpack và dữ liệu mẫu, không credential/DB. Endpoint GET mặc định synthetic hỗ trợ xem giao diện/chọn30/45; các bài test POST chạy qua interception riêng, preview không phải backend học thật.

Source snapshots/hashes ở [baseline](premium-today-artifacts/baseline-hashes.json), [final13/13files](premium-today-artifacts/final-source-hashes.json), [browser QA](premium-today-browser-qa.md), [browser receipts](premium-today-artifacts/). Artefacts là local, gitignored theo convention dự án.

## Thử tay và rollback

1. Mở `/today` ở app local đã đăng nhập trên điện thoại. Xác nhận tên bài và nút học dễ nhận ra; ở dữ liệu bình thường CTA nằm trước thanh dưới.
2. Chọn30rồi45, đổi bài, mở lý do/lộ trình. Bắt đầu một bài; quay về Hôm nay để thấy Tiếp tục. Mở bản cần sửa để xác nhận CTA tương ứng.
3. Kiểm tra ôn từ/thiết lập đúng dữ liệu thật. Dùng Tab trên máy tính để thấy viền focus.
4. Xem ảnh desktop/mobile rồi duyệt hoặc nêu điều cần chỉnh; Phase2–3 vẫn pending.

Rollback có thể khôi phục **chỉ8file Today đã sửa** từ `premium-today-artifacts/baseline-source/src/features/today/`, đã khớp SHA256 snapshot trước sửa; bỏ riêng file mới `today-lesson-frame.tsx` khi được yêu cầu rollback. Không dùng `git reset/checkout/stash`, vì các file Today cũng chứa sửa đổi có sẵn từ trước. Không rollback các file khác. Plan/report giữ làm lịch sử nếu rollback.

Còn thiếu: user visual acceptance, typecheck/build xanh, Inter production, native phone/Safari/keyboard/safe-area thật, long-title stress coverage đầy đủ và toàn bộ Phase2–3. Chưa commit/push/deploy.
