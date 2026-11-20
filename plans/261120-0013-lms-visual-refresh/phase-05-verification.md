# Phase 5 — Critique, browser và bàn giao

Trạng thái: **đã bàn giao bản local, chờ chấp nhận thị giác**; phase vẫn `in-progress` vì các gate dưới đây còn unchecked. Phụ thuộc phase1–4 đã hoàn tất triển khai. Context: [kế hoạch và acceptance](plan.md), frontend-design self-critique-loop.

## Checklist bàn giao và nghiệm thu

- [x] Review nguồn bằng context mới; cả 7 findings và nhánh error hotkeys đã giải quyết. [Review cuối](../reports/code-review-261120-0051-lms-refresh.md).
- [x] Focused behavior tests và gates cuối đạt: lint/typecheck/unit/build exit0; 50 files/394 tests. [Delivery receipt](../reports/verification-261120-0051-lms-refresh-artifacts/delivery-checks.json).
- [x] Browser inventory/captures các vùng chính: Today/Library/chi tiết L1, W1/R1/S1/L1, MyWork/feedback/revision/compare, Vocab/review, Settings/Progress/Admin/login/offline và wizard4 bước. [Browser QA](../reports/browser-261120-0120-lms-refresh.md).
- [x] Browser regression trọng yếu: hint503→201, draft latest-input/submit503, transcript ledger, modal/timer/nested Escape/focus/scroll, flashcard batch/save/reload/undo/loaderror/hotkeys, micro-challenge pending503, URL reload/back, Settings rollback, onboarding save/skip45. Dữ liệu mẫu và intercept được ghi rõ.
- [x] Render-check375/768/1440 trên màn đại diện; có ảnh loaded riêng thay ảnh skeleton. Login polished và Reading0errors/0warnings; Listening glyph warning đã đối chiếu label hitbox và native click.
- [x] Probe320 riêng Library/Vocab/Settings và4skills không tràn ngang; controls/editor trong mẫu đo đạt44+. Đây là tập mẫu, không toàn bộ state matrix.
- [x] Hai vòng critique độc lập:20/24→21/24, không mục0; các mục5/8/12 còn1 được ghi nguyên. [Critique](../reports/browser-261120-0120-lms-refresh-artifacts/visual-critique.md).
- [x] Source/public preview đã đồng bộ có kiểm soát. Controller đối chiếu519 input hashes và0 khác biệt src/public; input mới nhất trước delivery logs. Receipt không có full source hashes lúc chạy nên không claim cryptographic binding hồi tố. [Current-source receipt](../reports/verification-261120-0051-lms-refresh-artifacts/delivery-current-source.json).
- [x] Controller xác nhận `/today` HTTP200 ở `http://127.0.0.1:3000`; giữ listener NextPID26111/parent98799 và PostgreSQLPID26892:54329. Không tạo/dừng process trong lượt sync.
- [x] Walkthrough tiếng Việt có ảnh trước/sau, thay đổi, cách thử tay và giới hạn. [Verification/Walkthrough cuối](../reports/verification-261120-lms-refresh-final.md).
- [x] Full-plan sync-back phase1–5, acceptance và state; docs owning surface được controller cập nhật. [PM report](../reports/pm-261120-lms-refresh-final.md).
- [x] Chrome QA riêngPID3645 đã đóng/profile tạm xóa; không còn QA-owned browser/render process. Giữ server/DB người dùng xem. [Cleanup receipt](../reports/browser-261120-0120-lms-refresh-artifacts/cleanup.json).
- [ ] Bao phủ Today đầy đủ fresh/in-progress/revision/noactivity/error30/45, tên dài, đường mở/tiếp tục<=2 thao tác; các state detail/edit/long-text chưa được probe đầy đủ.
- [ ] Ma trận mọi control và hover/loading/success/empty/error/disabled/focus; computed typography/hitbox/contrast toàn scope, tour first-run/replay và reduced-motion. Không có chứng nhận WCAG toàn bộ.
- [ ] Native Safari/điện thoại vật lý, zoom200% thật, bàn phím điện thoại và VisualViewport/safe-area trên thiết bị thật.
- [ ] IELTS runtime, W2 hint runtime, timer background/reload/expiry, autosave failure, media invalid/permission/upload/retry/Shadowing và MyWork pending/failed/retry đầy đủ. Source/unit proof không thay runtime proof.
- [ ] Admin wizard2–4/create-collision/partial-retry/Drive sync và Vault>200 browser fixture. Không tạo curriculum mới chỉ để đóng gate.
- [ ] Integration `TEST_DATABASE_URL`, provider/audio quality/Storage upload/Supabase Auth/RLS/OAuth thật: NOT RUN. Đây là thiếu bằng chứng môi trường, không mở triển khai provider/production mới trong scope refresh local.
- [ ] Người dùng xem ảnh/local và chấp nhận hướng thị giác. Phê duyệt triển khai trước đó không thay human visual acceptance của bản cuối.

## Phương pháp đã giữ từ kế hoạch

1. Fresh-context reviewer: tất cả acceptance, touched callers, contracts/invariants, shared UI blast radius. Chứng minh concern bằng source/test/browser; không đảo quyết định người dùng từ lý do trừu tượng.
2. Narrow tests cho sửa behavior trước; sau đó lint/typecheck/unit/build một lượt. Không thêm tests chỉ mirror màu/layout; DOM/HTTP regression qua browser cho lỗi tương tác đã chứng minh, Vitest node-only cho contracts/helpers. Integration DB phải gated `TEST_DATABASE_URL`, dùng DBtạm và backup trước bulk; gate NOT RUN là bằng chứng còn thiếu, không quy thành PASS.
3. Browser inventory toàn routes và overlays/journeys trong scope. Bốn kỹ năng, feedback/compare, filters, onboarding, vocabreview, settings và admin. Fixtures labeled, DBtạm backup trước bulk/migrations; provider thật và real-device tách khỏi bằng chứng synthetic.
4. Chạy render-check375/768/1440 cho Today/Library/Learn/Vocab/Settings và màn đã đổi đáng kể; xem screenshots, hover/focus/openoverlay/empty/error. Sửa ba điểm yếu nhất mỗi vòng, tối đa3 vòng. Rubric mục0–2, >=20/24, không0; ghi đúng mục còn1/chưakiểm.
5. Mở local final từ source đã đổi bằng cách đồng bộ isolated preview có kiểm soát; bản copy đang chạy không tự cập nhật từ source. Giữ cổng3000/DBtạm và ownership/process metadata; không khởi động duplicate. User xem/duyệt thị giác.
6. Walkthrough tiếng Việt với ảnh trước/sau, thay đổi/cách thửtay/giới hạn. Đồng bộ allphase/plan theo evidence, docs impact nhỏ nhất. Không gọi UI hoàn tất chỉ vì build/test xanh.

## Bàn giao và rollback

Files: reports/screenshots dưới plans, docs owning surface khi UX/setup thay. Dừng đúng processes QA do agent tạo; giữ local người dùng đang xem. Không commit/push/deploy khi chưa có yêu cầu. Nếu acceptance chưa đạt, ghi unresolved cụ thể và tiếp tục slice được duyệt thay vì đánh dấu hoàn tất.

Source đã đóng băng để bàn giao theo controller. Ba điểm polish còn lại: observation đơn desktop còn hẹp; state matrix chưa đủ; Vocab/review chưa có ảnh polished chứng minh icon nhất quán. Không claim21/24 là human acceptance hoặc100% luồng đã nghiệm thu; các mục chưa kiểm giữ trên checklist để lượt tiếp tục có ranh giới rõ.
