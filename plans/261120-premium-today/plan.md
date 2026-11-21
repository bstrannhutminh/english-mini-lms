---
title: "Premium Learning Studio — Today visual gate"
status: merged-into-261121-1800-lms-comprehensive-upgrade
created: 2026-11-20
---

> **ĐÃ GỘP (21/11/2026):** Kế thừa vào `plans/261121-1800-lms-comprehensive-upgrade/`.
> Phase 1–3 source đã xong từ trước; acceptance + build kiểm lại ở phase 5 của plan mới.
> Không triển khai thêm theo checklist dưới đây.

# Kết quả được giao

Triển khai kế hoạch người dùng cung cấp qua `ak-cook <plan-path> --auto` ngày 20/11/2026. Bản gốc được lưu tại [accepted-redesign-plan.md](accepted-redesign-plan.md). Ban đầu triển khai Phase1; người dùng đã duyệt hướng Today và yêu cầu triển khai tiếp ngày20/11/2026, mở Phase2–3.

Phase 1: Dashboard tinh gọn, một bài học/hành động chính, lời chào và bộ chọn 30/45 gọn, lộ trình và ôn từ bên dưới. Phase2–3 được mở sau yêu cầu “triển khai đi cho tôi”. Phase 4 thực hiện các checks thích hợp cho slice Today.

## Design brief

Register: Product.
Scene: Bác sĩ học tiếng Anh công việc/y khoa 30–45 phút sau giờ làm, bằng laptop hoặc điện thoại.
Direction: Premium Learning Studio sáng, bình tĩnh, bố cục biên tập; bài học là vùng chính, các bước và từ vựng hỗ trợ.
Color: Restrained; nền và chữ dùng token surface/text hiện có, teal primary cho CTA, selection và focus. Không thay palette của màn khác trước visual gate.
Type: Inter hiện có, phân cấp bằng size/weight/whitespace; nội dung và control 16px, title bài 30/48px.
Signature: Hero bài học toàn chiều rộng với nét teal phía trên, tiêu đề lớn và một CTA; timeline gọn dưới hero.
Dials: variance 3, motion 2, density 3.

## Preflight và ownership

- Working tree có nhiều thay đổi UI/học liệu/DB/flashcards từ trước; không reset/stash/commit/push/deploy, không sửa DB/provider/secret/học liệu.
- Đọc diff Today và globals trước sửa. Chỉ sửa `src/features/today/`; giữ nguyên các lớp Lively ở globals vì đang được màn khác dùng. Today mới không dùng lớp trang trí Lively.
- Hooks Today, contracts, API, recommendation algorithm và shared navigation giữ nguyên.
- Có process nghe port 3000; không thao tác hoặc khẳng định đây là URL người dùng đang mở. Dùng preview riêng dữ liệu synthetic, không DB/credential. Thông tin runtime/ảnh/source hashes lưu trong report.
- Baseline source được reviewer snapshot ở `/private/tmp/lms-premium-today-preview` trước khi parent sửa source. Independent reviewer sở hữu preview/ảnh/browser scripts; parent sở hữu source Today và tài liệu.

## Công việc và bằng chứng

- [x] Đọc kế hoạch, tài liệu Lite, rules, Next CSS docs và diff hiện tại.
- [x] Khóa baseline source trước sửa.
- [x] Tái bố cục Today: header nhỏ, hero toàn chiều rộng, CTA trước lý do đề xuất, timeline và ôn từ dưới hero; setup/streak ở cuối.
- [x] Dùng chung TodayLessonFrame cho đề xuất và tiếp tục phiên.
- [x] Ảnh before/after 375/768/1440 cùng fixture và viewport.
- [x] Browser: fresh/active/revision/empty/loading/error;31interaction checks pass gồm30/45, đổi bài, start/resume/revision, failure/retry và overflow320/375/768/1440; keyboard/focus/reduced-motion có receipt riêng. Không suy ra provider/native-device pass.
- [ ] Tất cả static gates đạt: lint0errors/2warnings,402unit pass, secret/diff checks pass; **build và typecheck cuối FAIL** do generated API route types hiện hữu. Turbopack thêm lỗi môi trường bind-port; Webpack compile được nhưng không qua type validation.
- [x] Review độc lập source cuối; sửa badge thành16px và focus CTA thành teal, không có finding code khác trong slice Today.
- [x] [Walkthrough](../reports/premium-today-walkthrough.md) + cách test điện thoại + giới hạn + rollback.
- [x] Người dùng duyệt hình Today và yêu cầu “triển khai đi cho tôi” ngày20/11/2026; mở Phase2–3, không hỏi lại routine approval.
- [x] Phase2: Learning Studio4kỹ năng/IELTS, feedback/revision đã triển khai; browser/unit evidence trong walkthrough tổng.
- [x] Phase3: Library/Onboarding/MyWork/Vocabulary/Progress/Settings/Admin/Login đã triển khai và có ảnh mobile/desktop.

Không xem kiểm thử fixture là xác nhận backend/provider/production hoặc acceptance thị giác của người dùng.

## Tiếp tục sau duyệt Today — 20/11/2026

User đã duyệt hướng Today và yêu cầu tiếp tục. Triển khai toàn bộ Phase2–3 và verification; không push/deploy/DB/secret. Parent sở hữu globals, UI, MyWork/Vocabulary/Progress/Settings/Admin/Login. Worker session sở hữu shell/modes; worker discovery sở hữu Library/Onboarding; worker type compatibility chỉ sửa annotation/overload helper HTTP để build hợp Next16, giữ hành vi xác thực. Snapshot source444files trước bước này tại `/private/tmp/lms-premium-rest-baseline`, manifest ở `plans/reports/premium-studio-artifacts/baseline-source-hashes.json`.

Design giữ brief đã duyệt; palette nền ngà ấm, surfaces trắng, teal cho CTA; bỏ Lively gradient/pastel/shadow, dùng cùng nhịp header–workspace–secondary. Mỗi màn thay composition phù hợp nhiệm vụ, giữ states/data-tour/contracts.

## Kết quả sau tiếp tục

- [x] Lint exit0 (2warnings ảnh có sẵn), typecheck exit0 sau Nextcodegen,408unit/52filesPASS.
- [x] Build production bằng `npm run build -- --webpack` PASS trên sourcecuối. Sửa38lỗi route bằng type overload, không đổi runtimeauth.
- [ ] `npm run build` mặc định Turbopack: còn compiler panic ModuleGraphcanceled; giữ receipt, không đánh dấuPASS.
- [x] Gallery20màn trước/sau cùng fixture; after320/375/768/1440 cho cácmàn. Browserchecks trọng yếu có receipt riêng, không chứng nhận mọi tổ hợpstate.
- [x] Review/simplify độc lập: không có correctnessfinding còn mở trong source đã sửa.
- [x] [Walkthrough tổng](../reports/premium-studio-walkthrough.md), [Gallery](../reports/premium-studio-review.html), journal và rollback ownedfiles.
- [ ] User visual acceptance toàn bộ20màn, nativephone/provider/audio thật và cácstate chưa verify; không suy ra từ Todayapproval.

Plan giữ in-progress vì finalacceptance/defaultcompiler còn mở; implementationPhase2–3 đã giao. Không push/deploy/DBmigration/seed.
