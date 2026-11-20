# Phase 1 — Tokens, controls và khung điều hướng

Trạng thái: hoàn tất triển khai nguồn ngày 20/11/2026; các gate nghiệm thu còn thiếu được theo dõi ở [phase 5](phase-05-verification.md). Context: [kế hoạch](plan.md), `src/app/globals.css`, `.agents/rules/english-mini-lms.md`, frontend-design skill.

## Phạm vi sở hữu

`src/app/globals.css`, `src/components/ui/{button,card,modal,tabs,confirm-dialog,toast}.tsx` và module thực tế liên quan; `src/components/layout/*`, `src/components/guided-tour.tsx`, `src/components/tour-steps.ts` khi nhãn/nav thay. Input/textarea/select hiện chủ yếu là native controls trong features: chuẩn hóa style/token tại owner, chỉ tạo primitive mới khi có nhiều callers dùng chung và giảm lặp thật. `src/app/layout.tsx` chỉ khi cần font/config; đọc Next docs cài trong `node_modules/next/dist/docs/` trước sửa.

## Thực hiện

- [x] Chốt semantic scales cho surface/text/accent, typography16+, spacing, radii8/12, control44/48, motion160/200 và focus/overlay.
- [x] Đồng bộ shared controls theo brief; loại utility màu riêng lẻ ở touchpoint đã đổi. Shared exports/signatures giữ tương thích.
- [x] Sidebar và container desktop 24–32px gutter, nội dung rộng theo mục đích; mobile giữ5 vùng có nhãn ngắn dễ đọc và safe-area. Tên hồ sơ lấy dữ liệu thật.
- [x] Modal giữ focus trap/restore, inert background, Escape/scroll lock; timer update không reset focus. Tabs dùng roving focus; menu Arrow/Home/End/Escape đúng.
- [x] Skeleton, error, toast và empty state cùng nhịp token; reduced motion.

## Kiểm tra và rollback

Browser DOM probes meaningful cho focus/modal/tabs/menu, viewport và contrast; Vitest hiện node-only, dùng unit cho nav/focus routes và helpers, không giả lập DOM bằng test không thể chạy. Lint/typecheck; walk callers Button/Modal/Tabs trong session/vocab/settings/admin. Rollback chỉ file slice do worker sở hữu, bảo toàn thay đổi khác; không reset checkout.

## Bằng chứng bàn giao

[Foundation](../reports/foundation-261120-0051-lms-refresh.md) xác nhận source và scoped checks; [delivery checks](../reports/verification-261120-0051-lms-refresh-artifacts/delivery-checks.json) xác nhận gates toàn repo cuối. [Browser QA](../reports/browser-261120-0120-lms-refresh.md) xác nhận modal/timer/Tab/Shift+Tab/Escape/scroll restore, nested dialogs, tabs/menu và kích thước/contrast trên các mẫu đo. Ma trận mọi control/state, tour đầy đủ, reduced-motion và native-device còn thiếu bằng chứng; checklist trên ghi tiến độ triển khai, không chứng nhận WCAG toàn ứng dụng.
