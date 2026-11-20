# Bản mẫu UI/UX để duyệt

Ngày20/11/2026. [Mở bản mẫu](design-proposal.html) · [Implementation Plan](plan.md).

Đã dựng hướng giao diện sáng, bình tĩnh, chữ dễ đọc, một nhiệm vụ học chính. Mẫu gồm Hôm nay, Thư viện và khung WritingW1 có thể chuyển màn; Bài làm/Sổ từ/Tiến độ chỉ minh họa empty state. Curriculum từ nguồn approved; timeline, trạng thái lưu và góp ý có nhãn minh họa. Source ứng dụng chưa thay đổi.

## Những điểm đã điều chỉnh qua ảnh

1. Vòng đầu mobile còn CTA sát bottomnav, nhãn nav xuống dòng, nhiều chữ desktop14px. Đã bỏ lời mở đầu trùng, rút header và đồng bộ body/control16px. CTA375px nằmy571–621, bottomnav bắt đầuy732 theo DOM probe, còn111px trước nav.
2. Giữ tên English Mini LMS; lộ trình4 bước cùng các vùng hiện có. Desktop chuyển từ các card ngang cấp sang nhiệm vụ chính và cột lộ trình phụ, bớt box lồng nhau.
3. Focus mẫu ẩn chrome, có tiêu đề/trạng thái rõ. Mobile mở/thu gọn đầy đủ đề; nhập mẫu giữ khi chuyển disclosure. Library đưa search và bài đầu lên vùng màn hình đầu, link có vùngbấm44px.
4. Đã sửa cảnh báo touching-text footer và link Xem bài bị ép vào gridcell nhỏ. Dùng Teal đậm và typography đủ contrast theo checker.

## Render và phạm vi chứng minh

| Mẫu/trạng thái | Viewport | Checker cuối |
|---|---|---|
| [Hôm nay](screenshots/today/1440x900.png) | 375/768/1440 | 0errors/0warnings |
| [Thư viện](screenshots/library/375x812.png) | 375/768/1440 | 0errors/0warnings |
| [Làm bài](screenshots/session/1440x900.png) | 375/768/1440 | 0errors/0warnings |
| [Góp ý minh họa](screenshots/feedback/1440x900.png) | 375/1440 | 0errors/0warnings |
| [Lỗi lưu minh họa](screenshots/error/375x812.png) | 375/1440 | 0errors/0warnings |
| [Hộp thoại](screenshots/overlay/375x812.png) | 375 | 0errors/0warnings |
| [Trạng thái tìm kiếm trống](screenshots/empty/375x812.png) | 375 | 0errors/0warnings |

Checker là `ak-frontend-design/scripts/render-check.mjs`, dùng Chrome headless riêng, không cần dependency sản phẩm. Đã xem ảnh375/1440 Today, Library, Writing, feedback và overlay; viewport768 có checker nhưng không gọi là kiểm đầy đủ toàn bộ tương tác.

Raw [browser probe](browser-probe.json) ghi36 lệnh. Query30/45, wordcount, disclosure giữ input, search noresults/matching và Escape restore có receipt. Tuy nhiên probe Tab ghi `focusInside=false`, click góp ý/lỗi có kết quảfalse và bước wait không kết thúc trong thời gian chờ; **không tính những probe này là PASS**. Đã dừng đúng CLI/browser QA. Render trên document mới với `?state=feedback/error/overlay/empty` xác nhận trình bày từng trạng thái và handler `.click()` của mẫu góp ý trên document mới; không thay thế phép kiểm click/keyboard tự nhiên còn thiếu. Trạng thái thật của sản phẩm sẽ kiểm ở phase5 sau khi triển khai.

Tooling: `agent-browser skills get core` trả `Skill not found: core`; live catalog dùng tên `agent-browser`. Đã đọc guide đúng tên và CLIhelp; không sửa/cài lại skill. Các lỗi công cụ và probe không được đổi thành lỗi sản phẩm hoặc kết quả xanh.

## Rubric cuối: 22/24 cho bản mẫu

| Tiêu chí | Điểm0–2 | Bằng chứng/giới hạn |
|---|---|---|
| Brief fidelity | 2 | Sáng, bình tĩnh, rõ; Teal/Inter fallback và nhiệm vụ/lộ trình4 bước. |
| Hierarchy | 2 | Một CTA Teal ở Today, mission title nổi bật; desktop cột phụ nhẹ. |
| Spacing rhythm | 2 | Padding20/24/32, khoảng giữa vùng rộng hơn controls, giảm hộp lồng. |
| Alignment | 2 | Header/mission/list/worksheet dùng cạnh chung; paragraph căn trái. |
| Typography | 2 | Body/control16px; type scale/reading line1.75; tiếng Việt hiển thị rõ. |
| Color discipline | 2 | Accent dùng cho action/selection/focus, nền trung tính; checker không còn contrastwarnings. |
| Depth/shape | 2 | Một hệ hairline/nền dịu/radius8–12, shadow dành dialog. |
| States/feedback | 1 | Default/hover/focus/error/empty/overlay có ảnh; click/Tab tự nhiên chưa xác minh đầy đủ. |
| Responsiveness | 2 | Tái bố cục375/768/1440, CTA375 không che, mobile worksheet có disclosure. |
| Slop tells | 2 | Không gradient/trang trí lặp/thành tích giả; giữ nội dung học thật. |
| Content/copy | 2 | W1/objective/durations từ approved manifest; phần mô phỏng có nhãn. |
| Craft details | 1 | Icons/title/favicon thống nhất; mẫu chỉ có Writing, nhiều trạng thái populated còn cần thiết kế trong ứng dụng thật. |

Hai mục dưới2 được giữ nguyên, không chấm lại bằng giả định. Rubric này không chứng minh toàn bộ LMS đạt yêu cầu UI/UX, AI, audio, auth, dữ liệu thật hay production. Người dùng cần xem và duyệt hướng thị giác; sau đó mới triển khai các phase và nghiệm thu lại.

## Cách xem

Mở `design-proposal.html`; bấm Bắt đầu học để xem worksheet, Thư viện để xem search/list, Về bản mẫu để biết giới hạn. Có thể gõ trong editor mẫu; nội dung chỉ ở trang đang mở và không gửi tới dịch vụ. Dùng cửa sổ hẹp để xem mobile. Bản local3000 vẫn là sản phẩm cũ với dữ liệu mẫu riêng.

Câu hỏi chưa giải quyết: duyệt bản mẫu và Implementation Plan để áp dụng toàn bộ scope vào sản phẩm.
