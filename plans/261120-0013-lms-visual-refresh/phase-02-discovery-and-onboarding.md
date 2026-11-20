# Phase 2 — Hôm nay, Thư viện và onboarding

Trạng thái: hoàn tất triển khai nguồn ngày 20/11/2026; các gate nghiệm thu còn thiếu được theo dõi ở [phase 5](phase-05-verification.md). Phụ thuộc phase1. Context: [kế hoạch](plan.md), `docs/plan/product-design.md`, `src/contracts/{today,library,onboarding}.ts`.

## Phạm vi sở hữu

`src/features/today/*`, `src/features/library/*`, `src/features/onboarding/*`; route page chỉ chỉnh composition cần thiết. Đọc các hooks/services hiện có, tránh đổi thuật toán đề xuất ngoài lỗi phản hồi bộ lọc đã chứng minh.

## Thực hiện

- [x] Hôm nay: header không đóng hộp riêng, chọn thời lượng gọn, một khối nhiệm vụ nổi bật. Ưu tiên phiên dở/bản sửa theo server; giữ lý do đề xuất. Lộ trình/ôn từ thành vùng phụ; đổi bài bằng disclosure nhẹ.
- [x] Library: header/search trước kết quả; topic/skill/status cùng hệ thống, thứ bậc nhẹ. Gợi ý chỉ khi phù hợp phạm vi hiện tại. Persist query/topic/skill/status trong URL, giữ deep links cũ; search lời hứa đúng dữ liệu searchable.
- [x] Chi tiết bài: objective, thời lượng, nguồn và CTA rõ; nội dung thật đọc thoáng, nguồn/trạng thái đầy đủ.
- [x] Onboarding: mỗi bước một quyết định rõ, defaults và recap, back/skip/submit state; không bịa điểm năng lực. Re-entry/settings/default30/45 giữ behavior.

## Kiểm tra và rollback

Probe Today fresh/in-progress/revision/noactivity/error30/45; Library noresult/topic khôngIELTS/search/back/reload; wizard4steps/skip/failedsave/re-entry. Captures375/768/1440, CTA abovefold, labels16. Unit filtering/preferences và render-check. Không đổi API envelope/schema dữ liệu học; rollback UI slice cùng state serialization tương thích link cũ.

## Bằng chứng bàn giao

[Discovery](../reports/discovery-261120-0051-lms-refresh.md), [review nguồn cuối](../reports/code-review-261120-0051-lms-refresh.md) và [delivery checks](../reports/verification-261120-0051-lms-refresh-artifacts/delivery-checks.json) xác nhận implementation/URL helpers/skip45 schema→merge. [Browser QA](../reports/browser-261120-0120-lms-refresh.md) xác nhận Today loaded30/45 và CTA trước nav375, Library q/topic/skill/status/reload/back/IELTS0, chi tiết L1, wizard4 bước/save503/retry45/re-entry và first-run skip45. Today toàn bộ tổ hợp fresh/in-progress/revision/noactivity/error30/45, tên dài và mọi tham số lạ vẫn cần bổ sung bằng chứng runtime ở phase5; không nâng các source/unit cases thành browser PASS.
