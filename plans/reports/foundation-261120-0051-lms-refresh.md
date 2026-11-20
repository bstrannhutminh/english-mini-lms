# Foundation — làm mới giao diện LMS

Ngày 20/11/2026. Trạng thái: DONE_WITH_CONCERNS — source hoàn tất, nghiệm thu browser do controller thực hiện sau tích hợp. Phạm vi từ phase-01 đã được người dùng duyệt.

Đã đọc README, Lite track, product-design, hướng dẫn xây dựng, luật dữ liệu, kế hoạch/bản mẫu và QA19/11; áp dụng skill ak-frontend-design. Next16 CSS/use-client guide đọc từ package cài sẵn. Không có CLAUDE.md tại root.

## Kết quả

- Semantic tokens: nền #f6f9f9, chữ #172c2b, primary #0f766e/hover #115e59; neutral tint đồng bộ slate aliases và action teal600/700. Giữ các tone kỹ năng/status. Radius8/12, đường mảnh, shadow dành overlay; focus và reduced-motion gồm backdrop.
- Button mọi size nhãn16px, mục tiêu44/48px; disabled dễ đọc, loading giữ label. Card bỏ shadow; EmptyState, Badge, Toast và trạng thái lỗi/loading cùng nhịp. Toast tối đa3, tạm dừng khi hover/focus, nút đóng44px.
- PageContainer default max-w-6xl, narrow max-w-2xl, wide max-w-7xl; gutter20/24/32px. Sidebar232px; mobile nav80px + safe-area, 5 nhãn16px Hôm nay/Thư viện/Bài làm/Sổ từ/Tiến độ. Giữ đường dẫn và data-tour; tài khoản lấy displayName thật, không cố định BS. Minh.
- Modal chuyển sang dialog native top-layer: focus containment/inert nền, Escape/backdrop, scroll lock, restore trigger, callback ref; effect focus chỉ phụ thuộc open nên timer không kéo focus lại. Giữ props, role=dialog, aria-modal; mô tả liên kết bằng aria-describedby.
- Tabs dùng roving tabIndex, ArrowLeft/Right/Home/End dịch cả focus và selection. UserMenu mở tới item, dùng arrows/Home/End/Escape/Tab, restore trigger; lỗi signOut hiển thị và cho thử lại.
- Guided tour vẫn giữ step/route/data-tour. Tooltip native dialog giữ focus và inert; layout observers tách sang use-guided-tour-layout.ts để module dưới200 dòng. Tiếp/lui/bỏ qua và spotlight teal giữ behavior.
- Đăng nhập dùng shared Button/field-control, label16px, lỗi/thành công/email dài đọc được. Màn404/error/loading/offline đổi sang token teal; offline giữ critical CSS độc lập khi cache CSS/JS thiếu.

Helper có thể dùng trong features: field-control, page-title, page-description, section-title, surface-panel; semantic utilities bg-surface-muted/text-text-secondary/border-border-strong.

## Kiểm tra

- Scoped ESLint ui/layout/auth/shared/offline/tour: PASS. Lượt đầu rule refs báo khi đọc object return từ hook; đã destructure trực tiếp, chạy lại PASS, không tắt lint.
- TypeScript scoped program26 owned roots + dependencies theo tsconfig: PASS0diagnostics. Không thay thế typecheck toàn repo.
- Unit layout/auth/tour:4files,20tests PASS. Hermetic, không env/DB.
- Tailwind PostCSS compilation: PASS,0warnings; đã chạy lại sau safe-area/reduced-motion.
- git diff --check: PASS tại lúc kiểm.
- Contrast tính từ token: white/primary5.47:1, text-muted/paper4.69:1, border-strong/white3.35:1. Đây là tính toán token, chưa phải computed DOM ở mọi state.

## Kiểm tra tay cần controller/browser

375/768/1440 và320: nav nhãn không tràn, CTA không bị nav che; dialog mở/Tab/ShiftTab/Escape/backdrop, chờ timer1.2s focus không đổi, đóng trả về trigger và body scroll phục hồi; menu Enter/Arrow/Home/End/Escape; tour lần đầu/replay/next/back/cancel qua route; auth password/magic và các error/offline states. Kiểm contrast/targets từ computed styles và reduced-motion.

Không thêm dependency, không sửa DB/provider/credentials/env, không chạy server, không commit/push/deploy. Full lint/typecheck/test/build và browser visual acceptance chờ tích hợp, không gọi là đã đạt từ kiểm tra source.

Câu hỏi chưa giải quyết: không có. Concern còn mở: các phép kiểm browser trên chưa được thực hiện trong worker này.
