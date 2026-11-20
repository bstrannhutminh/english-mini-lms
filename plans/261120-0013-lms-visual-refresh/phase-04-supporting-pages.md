# Phase 4 — Các vùng hỗ trợ học

Trạng thái: hoàn tất triển khai nguồn ngày 20/11/2026; các gate nghiệm thu còn thiếu được theo dõi ở [phase 5](phase-05-verification.md). Phụ thuộc phase1–3. Context: [kế hoạch](plan.md), QA/source audit19/11 và owning contracts/services.

## Phạm vi sở hữu

`src/features/{vocab,progress,settings,admin,auth}/*`, `src/contracts/settings.ts`, `src/app/{_shared,offline}/*`, error/loading/not-found composition. Đọc `src/server/learning/submission-mutations.ts` để copy xóa phản ánh behavior thực; thay backend/policy chỉ khi có lý do và scope đã được duyệt. Shared capture owner phối hợp phase3, không sửa song song.

## Thực hiện

- [x] Vocab list/search/filter/detail/edit: tuple ngữ cảnh đọc rõ, Câu của tôi16px và vùng bấm44; capture provenance theo nguồn thật, giữ6tuple contract.
- [x] Flashcards/review: một nhiệm vụ một lượt; grade actions rõ, batch chưa lưu có save/discard/cancel khi chuyển mode/thoát; hotkeys ngừng khi modal/input/pending. Input pending phản ánh đúng payload đã gửi; failure giữ batch và retry.
- [x] Progress: trả lời học gì/tiến bộ từ bằng chứng nào/cần luyện gì; đủ/thiếu dữ liệu và assisted tách riêng, không thêm metric giả hoặc đảo thang mastery đã chốt.
- [x] Settings: account/lộ trình/giờ học/dữ liệu chia nhóm, dirty-save rõ; activityId schema theo text ID hợp lệ từDB thay vì UUID (sửa contract parse tương thích response thực); reminder rollback503; copy notification/deletion theo khả năng thực đã xác minh.
- [x] Admin: list/editor/wizard/readiness làm rõ thao tác tạo/sửa/duyệt. Reproduce collision create409→PATCH cũ; nếu xác nhận, tạo mới không ngầm thay nguồn khác, reuse/edit phải có lựa chọn cụ thể, giữ retry phiên tạo dở đúng.
- [x] Login/offline/loading/error/notfound cùng design, giải thích lỗi và bước tiếp theo; nội dung offline vẫn độc lập và dùng được khi không có JS.

## Kiểm tra và rollback

Populated/empty/longtext375/768/1440 và reflow320; flashcard batch/modeswitch/modalkeyboard/pending/error; Settings W1 activityId parse, profile actual,503 switch rollback; Admin create/editcollision trên fixtures/intercept; capture Writing/Listening source; auth forms local/static. Schema không đổi DB; kiểm caller Settings/exports. Rollback từng UI slice giữ dữ liệu và public fields.

## Bằng chứng bàn giao

[Review nguồn cuối](../reports/code-review-261120-0051-lms-refresh.md) xác nhận export copy, snapshot/Vault>200/Undo, error hotkeys và targets44; [delivery checks](../reports/verification-261120-0051-lms-refresh-artifacts/delivery-checks.json) xác nhận toàn repo. [Browser QA](../reports/browser-261120-0120-lms-refresh.md) xác nhận flashcard mode/route guards/save503/retry200/undo/reload/loaderror, micro-challenge pending503, Settings IDsTEXT/45/reminder rollback, Progress/Admin/login/offline mẫu và Admin bước1/invalid source. Vault>200 có unit/source proof, chưa có browser fixture đủ lớn. Admin wizard2–4/collision/Drive sync, auth thật, các state/long text/detail/edit chưa được probe đầy đủ. Không tạo thêm curriculum chỉ để đóng checklist runtime.
