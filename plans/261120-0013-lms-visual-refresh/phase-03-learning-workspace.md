# Phase 3 — Không gian học và góp ý/sửa bài

Trạng thái: hoàn tất triển khai nguồn ngày 20/11/2026; các gate nghiệm thu còn thiếu được theo dõi ở [phase 5](phase-05-verification.md). Phụ thuộc phase1. Context: [kế hoạch](plan.md), QA19/11, MODE_META/MODE_REGISTRY, learning/session contracts.

## Phạm vi sở hữu

`src/features/session/{shell,shared,modes,hooks}/*`, `src/features/my-work/*`; hint event owner và curated-support selector khi cần, qua service/contracts hiện có. Bảo toàn signatures/plugin interface/API.

## Thực hiện

- [x] Focus header có tên bài, timer và trạng thái lưu nhìn thấy; điều hướng thoát có bảo vệ nháp. Desktop đề/nội dung và vùng làm bài phân chia rõ; mobile đề mở/thu gọn phù hợp, editor/recording luôn giữ state.
- [x] Reading: passage và bản dịch dễ đối chiếu, capture không che câu. Writing: yêu cầu/wordcount/editor rõ. Speaking: ghi/nghe lại/upload/trạng thái thật. Listening: player/questions/shadowing và locked transcript giữ đúng gate.
- [x] ActionBar có chiều cao đo/space dự phòng, tránh keyboard/viewport/safearea overlap; disabled nêu việc cần hoàn thành, failure giữ input và retry.
- [x] Reproduce hint-event503 trước sửa: đợi event accepted mới mở hỗ trợ; failure báo rõ/thử lại, không mất server-side assisted. W2 chọn hỗ trợ phù hợp approved activity/rubric, không dùng email hint chung cho summary.
- [x] Feedback: việc cần sửa ưu tiên, đầy đủ các trường; bản1/bản2/compare/retry/pending/failed trình bày nhất quán, trace tới submission đúng. Copy điểm là practice_estimate.

## Kiểm tra và rollback

Browser4plugins+IELTS routing, draft/autosavefailed/exit/reload/timerbackground, event503→noreveal→retryaccepted→assisted đúng; transcript503 giữ khóa; media invalid/uploadfailure; MyWork pending/failed/feedback/revision/compare. Unit learning invariants và browser integration trên DBtạm nếu cần. Mọi thay đổi fixture bulk có backup trước; không chạm dữ liệu thật. Rollback tương thích server event/submission contract, giữ nháp.

## Bằng chứng bàn giao

[Learning](../reports/learning-261120-0051-lms-refresh.md), [review nguồn cuối](../reports/code-review-261120-0051-lms-refresh.md) và [delivery checks](../reports/verification-261120-0051-lms-refresh-artifacts/delivery-checks.json) xác nhận source/guard/provenance. [Browser QA](../reports/browser-261120-0120-lms-refresh.md) xác nhận W1/R1/S1/L1 ở375/768/1440 và320, W1 hint503→201, transcript ledger accepted, autosave latest-input/save-exit/reload, submit503 giữ nháp, feedback/bản2/compare mẫu, text-only speaking và capture→YouGlish nested dialog. IELTS runtime, W2 hỗ trợ runtime, timer background/expiry, các nhánh autosave failure, media thật/permission/upload/retry và MyWork pending/failed/retry chưa được bao phủ đầy đủ. Provider thật/âm thanh thật không được suy ra từ fixture hoặc unit.
