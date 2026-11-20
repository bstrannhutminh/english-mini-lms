# Chuẩn bị nghiệm thu LMS để học thật — 20/11/2026

Trạng thái: đang chờ review độc lập và quyền kiểm tra cấu hình. Báo cáo này chỉ ghi preflight của controller; không thay báo cáo tính năng/UI/UX/kiến trúc đã giao cho terminal `review`.

## Bằng chứng hiện tại

Repo `english-mini-lms`, Next16.3.6/React19.2.8/TypeScript, Supabase/Drizzle/Gemini; không đổi stack. Dirty tree chứa bản làm mới được duyệt; chưa commit/push/deploy. [Trạng thái trước](../261120-0013-lms-visual-refresh/state-current.md) và [verification](verification-261120-lms-refresh-final.md) xác nhận394unit tests/lint/typecheck/build cho source trước lượt này; chưa có sửa source mới trong lượt preflight.

Review chính đã gửi và được acknowledged: `lm-f955ff88-e2d9-494b-b9eb-bada3e654128`, target `0cc73abd-f91a-43bc-ac33-da4ce8e46680`, state `delivered`. Không đọc peer terminal, không spawn replacement/Team, không polling reply. Lệnh gửi ghi chú bổ sung bị hook nhận nhầm tên cấu hình trong văn bản là đường dẫn đọc; lần gửi văn bản không có đường dẫn cấu hình trả `quarantined`. Board kiểm một lần vẫn xác nhận yêu cầu chính delivered; không retry-loop hoặc coi ghi chú bổ sung đã gửi.

[Preview health](readiness-261120-1038-artifacts/preview-health.json) được lấy qua HTTP read-only, không đọc file secret:

| Gate | Quan sát | Kết luận được phép |
|---|---|---|
| Public app health | HTTP200/status ok | Web process đang phản hồi. |
| DB preview | HTTP200/connected,6migration | Postgres mẫu đang truy cập được; chưa phải proof Supabase/RLS. |
| AI chấm bài | geminiApiKey=false trong preview process | Preview chưa cấu hình Gemini; không nghiệm thu chấm bài thật. |
| Storage | service-role presence=false; Supabase URL/anon presence=true trong môi trường mẫu | Chưa có proof upload/playback Storage thật. Presence không xác minh tính hợp lệ của credential. |
| Auth | Preview development/bypass theo checkpoint | Không nghiệm thu đăng nhập/role/RLS thật từ luồng mẫu. |
| Drive | Presence=false | Đồng bộ Drive chưa nghiệm thu; không tự coi là bắt buộc cho học từ curriculum đã seed. |

Next listener26111/parent98799 và PostgreSQL26892:54329 được giữ nguyên. Không start/stop server, không thay database preview. Root file-config access đang có câu hỏi hook chờ người dùng; không coi `--auto` hoặc thời gian chờ là consent.

## Kiểm tra cần chuẩn bị từ nguồn hiện có

`tests/integration/` đã có12file kiểm library/admin/content/Drive, writing, reading/vocab, speaking/listening, revisions/deletion, Today/Progress và settings/flashcards. Các test có dùng mock tại provider boundary; khi chạy DB riêng, kết quả sẽ là proof dịch vụ/DB, không phải Gemini/Supabase Auth chạy thật.

`tests/integration/setup.ts` và một số tests load dotenv rồi map `TEST_DATABASE_URL` vào `DATABASE_URL`. Chưa chạy: cần database test riêng, backup trước mutation và xác minh không đọc cấu hình bị hook chặn. Runner hiện không đủ để suy ra URL được đặt chắc chắn là database riêng.

`scripts/smoke-e2e.mjs` tạo Postgres với default54329, hiện trùng owner preview; không chạy trực tiếp. Script có tạo IELTS clones cho routing smoke: clone chỉ là fixture, không được nâng thành curriculum IELTS đã duyệt. Chọn check phù hợp hoặc phương án cô lập trước khi chạy; không tạo thêm server chỉ để lấp thời gian chờ.

## Checklist học thật dự kiến

1. Tài khoản thật đăng nhập, quyền học/quản trị đúng; dữ liệu học không đọc được bằng tài khoản khác. Giữ bypass chỉ ở preview local.
2. Thư viện có curriculum approved, nguồn đọc/audio phù hợp bài; onboarding lưu/re-entry đúng30/45.
3. Hoàn tất một vòng Viết với bài thật: nộp, nhận góp ý có giới hạn, tạo bản2, so sánh và tiếp tục từ Hôm nay. Lỗi AI không làm mất bài hoặc báo đã chấm thành công.
4. Đọc–dịch giữ nguồn gốc và lưu cụm từ; Nói có audio thật, upload/private playback; Nghe/transcript giữ ledger assisted và Shadowing. Text-only không được chấm phát âm.
5. Ôn thẻ/viết câu giữ kết quả qua lỗi/reload; Tiến độ thể hiện bằng chứng và tách hỗ trợ, không gọi số phút/số bài là tiến bộ đã được chứng minh.
6. Backup DB và audio, thử khôi phục vào môi trường riêng; bản xuất JSON không thay full backup. Thiết bị thật kiểm bàn phím, micro, safe-area và offline retry.

Pilot theo Lite track hiện có: theo dõi4tuần học thật30–45phút/ngày. Quan sát chỗ bị kẹt, chất lượng góp ý, khả năng sửa lại và dùng lại từ; không hứa IELTS band, tốc độ tiến bộ hoặc chi phí khi chưa có dữ liệu. Những checkpoint này sẽ được chốt trong advise cuối sau review.

## Tiếp theo

Nhận report của terminal review, phân loại findings và chốt file/caller/acceptance trước code ở [kế hoạch](../261120-1038-lms-product-readiness/plan.md). `--auto` cho phép thực hiện các cải tiến được yêu cầu; evidence/privacy/DB backup gate vẫn giữ.

Câu hỏi chưa giải quyết: quyền truy cập cấu hình root đang chờ. `whoami` xác nhận link review inbound/outbound quarantined; người dùng đã được hỏi mở lại liên kết. Yêu cầu chính vẫn delivered, chưa có report ở đường dẫn được giao. Chưa có kết luận dùng thật hoặc production readiness.
