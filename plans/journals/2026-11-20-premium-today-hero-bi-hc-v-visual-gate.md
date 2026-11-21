---
title: "Premium Today: hero bài học và visual gate"
date: 2026-11-20
summary: Today tái bố cục;31fixture checks và402unit pass; build/typecheck bị chặn bởi lỗi route types hiện hữu; chờ duyệt hình.
---

# Premium Today: hero bài học và visual gate

## Đã làm

Thực hiện Phase1 của kế hoạch Premium Learning Studio do người dùng giao bằng ak-cook --auto. Gói source chỉ trong src/features/today; dùng chung TodayLessonFrame. Greeting gọn, hero bài học toàn chiều rộng, một CTA, timeline/vocab dưới hero. Giữ hooks/contracts/data và toàn bộ thay đổi trước phiên.

## Bằng chứng và lỗi

Ảnh before/after375/768/1440 bằng browser fixture. CTA375 từ y933–981 lên y567–623, trước nav732.31checks browser pass,402unit pass, lint không lỗi. Rà soát phát hiện badge14px và CTA focus trắng; sửa thành16px và viền teal rồi focused retest. Baseline source đã lưu và khớp hash để rollback đúng phần thay đổi.

Build Turbopack lỗi môi trường bind port; Webpack compile thành công nhưng Next generated route validation lỗi optional context có sẵn ở withLearner/withAdmin. Final typecheck38TS2344; không che lỗi bằng xóa/exclude generated types. Không sửa API ngoài slice UI đã giao. Typecheck ban đầu pass trước codegen không phải kết quả cuối.

## Tiếp theo

Duyệt hình Today theo mục3.5 trước Phase2–3. Full walkthrough tại plans/reports/premium-today-walkthrough.md. Chưa kiểm provider/production/native-device; chưa commit/push/deploy. AgentWiki publish skipped.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
