---
title: "Review và hoàn thiện LMS để học thực tế"
status: in-progress
created: 2026-11-20
priority: P1
branch: feat/lms-architecture-ux-onboarding
---

# Review và hoàn thiện English Mini LMS

## Kết quả cần đạt

Đánh giá toàn bộ tính năng, UI/UX và kiến trúc của LMS hiện có; đưa ra lời khuyên có bằng chứng và thực hiện các cải tiến trong phạm vi để hoàn thiện vòng học cá nhân của BS. Minh. Người dùng có một bản local dễ dùng, hướng dẫn thiết lập/nghiệm thu cho học thật và danh sách rõ các điều kiện còn thiếu. Không gọi bản dùng dữ liệu mẫu là sản phẩm đã nghiệm thu kết nối thật.

Yêu cầu ngày20/11/2026: `/ak-cook --auto`. Người dùng giao phần review cho terminal codex liên kết `review`, ID `0cc73abd-f91a-43bc-ac33-da4ce8e46680`; không tạo agent/Team mới cho phần này. Receipt `lm-f955ff88-e2d9-494b-b9eb-bada3e654128` đã `delivered`; chờ câu trả lời đi qua link BACK, không đọc terminal hoặc polling reply.

## Ranh giới

Giữ sản phẩm cá nhân một người học, stack Next16/TypeScript/Tailwind/Supabase/Drizzle/Gemini, Teal/Inter, các tính năng hiện có và curriculum approved. Giữ append-only, server-side assisted, speaking `not_assessable` khi thiếu audio và `practice_estimate`. Giữ dirty tree và bản preview người dùng đang xem.

Không mở thêm sản phẩm SaaS, cộng đồng, thanh toán, leaderboard, provider mới hoặc nội dung y khoa mới. Không commit/push/merge/deploy. Không thay schema/dữ liệu thật; mọi test DB cần database riêng và backup trước thay đổi. Không đọc hoặc in secret khi hook chưa cho phép. Có thể sửa source, tests và docs cho lỗi/UX có bằng chứng trong phạm vi người dùng đã cho phép; không hỏi lại phê duyệt thường lệ.

## Bằng chứng mở đầu và touchpoints

- [README](../../README.md), [Lite track](../../docs/plan/lite-mvp-track.md), [product design](../../docs/plan/product-design.md), [data contract](../../docs/plan/data-and-tools-contract.md), [luật học tập](../../.agents/rules/english-mini-lms.md) là authority. `src/contracts/` sở hữu shape API hiện hành.
- Bản làm mới trước: [trạng thái](../261120-0013-lms-visual-refresh/state-current.md), [verification](../reports/verification-261120-lms-refresh-final.md), [browser](../reports/browser-261120-0120-lms-refresh.md). Source mới có394unit tests; lint/typecheck/build đạt ở receipt trước, không tự quy thành kết quả cho source sau sửa.
- Route mỏng ở `src/app`; UI/hook theo vùng ở `src/features`; helpers ở `src/components`/`src/lib`; API contracts ở `src/contracts`; domain/services/providers ở `src/server`. `MODE_META`/registry và API error envelope là contracts cần bảo vệ.
- Touchpoints dự kiến: feedback `priority-observations`, Vocab/review controls, Admin/dashboard/health và các lỗi được peer chứng minh; kiểm thử integration dùng `tests/integration/setup.ts`, `vitest.integration.config.ts` và scripts đã có. Danh sách file sửa sẽ chốt từ review trước khi viết code.
- Preview tại `http://127.0.0.1:3000/today`: Next listener26111, PG26892:54329, app cô lập dưới `plans/reports/local-preview-261119-2241-artifacts/app`. Giữ hai process; không chạy thêm server cùng dự án/cổng.
- Hook đã chặn bước kiểm tra metadata `.env.local`/`.env`; câu hỏi truy cập một lần đang chờ người dùng. Công việc không phụ thuộc file này tiếp tục; phần cần đọc cấu hình không được bypass.
- Sau khi yêu cầu chính delivered, lệnh gửi ghi chú bổ sung trả `quarantined`. `link status` kiểm một lần vẫn ghi yêu cầu chính delivered; `whoami` xác nhận cả inbound/outbound với target đang quarantined. Câu hỏi mở lại liên kết đang chờ người dùng. Không resend yêu cầu chính hoặc tạo agent thay thế; review/plan gate chưa hoàn tất nên chưa sửa source.

## Phases

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 1 | [Review độc lập và chốt các cải tiến](phase-01-review-and-scope.md) | Đang thực hiện |
| 2 | [Sửa source có bằng chứng](phase-02-product-improvements.md) | Chờ review |
| 3 | [Xác minh hành vi và khả năng dùng thật](phase-03-verification.md) | Chờ2 |
| 4 | [Hướng dẫn/pilot/advise và bàn giao](phase-04-readiness-handoff.md) | Chờ1–3 |

## Acceptance

- [ ] Review lập inventory tính năng learner/admin và phân biệt defect, UX advice, thiếu proof, non-issue; findings có path/receipt, trigger, ảnh hưởng, giải pháp và phép kiểm.
- [ ] Kế hoạch sửa cụ thể đã được review trước code; cải tiến xử lý nguyên nhân, giữ features/contracts/invariants và không sửa ngoài phạm vi.
- [ ] Các source changes qua narrow tests/checks thích hợp, review lại và gates bắt buộc; chỉ dùng logs còn khớp input.
- [ ] Browser kiểm các luồng/state liên quan source mới và lưu ảnh/bằng chứng; cập nhật preview có kiểm soát, không mất dữ liệu mẫu hoặc process người dùng đang xem.
- [ ] Khả năng dùng thật được kết luận theo từng gate DB, AI, auth, media, thiết bị và backup; thiếu cấu hình/consent/evidence ghi rõ, không coi skip/mock là pass.
- [ ] Advise có ưu tiên và dependencies, checklist pilot 30–45phút cùng cách quan sát cải tiến; owning docs mô tả đúng behavior/setup.
- [ ] Đồng bộ toàn bộ phase và bàn giao báo cáo tiếng Việt; không tuyên bố production/human acceptance chưa xảy ra.
