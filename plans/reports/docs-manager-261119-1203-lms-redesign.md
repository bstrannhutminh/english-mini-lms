# Báo cáo tác động tài liệu — LMS redesign

## Phạm vi và kết quả

- Skill: `ak-docs` (`update`), đã đọc `doc-content-rules.md` và `update-workflow.md`.
- Đối tượng: BS. Minh cần luồng sử dụng/kiểm tra tay; người bảo trì cần đường tới nguồn sự thật.
- Tạo `docs/huong-dan-lms-2026-11-19.md` sau khi kiểm tra chưa tồn tại; thêm đường dẫn trong `docs/README.md`, bỏ mốc cập nhật mục lục đã cũ.
- Chỉ sửa hai tài liệu trên và báo cáo này. Không sửa source/test/env, chạy server, gọi DB/provider, hoặc thao tác Git mutation.

## Tác động cần ghi bền vững

Hướng dẫn mới bao phủ onboarding bốn bước, bỏ qua và mở lại; mặc định 30/45 phút lưu từ lộ trình so với lựa chọn riêng ở Hôm nay; chu trình ôn–làm–sửa–kết thúc; lọc thư viện; bốn skill panel; giới hạn riêng tư, timer và ngoại tuyến. Kiến trúc/contracts được liên kết tới chủ sở hữu, không tạo bản sao API hoặc tài liệu kiến trúc mới.

## Bằng chứng mã nguồn đã đọc

- `src/features/onboarding/{onboarding-view,onboarding-presets,onboarding-header}.tsx/ts`, `src/server/onboarding/service.ts`, `src/app/(main)/today/page.tsx`: bước thiết lập, điều kiện lần đầu, lưu mặc định và chuyển trang.
- `src/components/layout/user-menu.tsx`, `src/features/settings/learning-plan-card.tsx`: đường mở lại.
- `src/features/today/{today-view,use-today-recommendation,start-controls,session-plan,continue-block,recommended-card}`, `src/server/today/daily-plan.ts`: lựa chọn thời lượng, bài dở/gợi ý và chu trình.
- `src/features/library/{library-explorer,filter-activities}`: tìm kiếm/lọc tại trang, trạng thái "Đã nộp" và IELTS khi có nội dung.
- `src/features/session/modes/{writing,reading,speaking,listening}`: giao diện/đầu vào từng kỹ năng; nói text-only không chấm phát âm; transcript và nhãn hỗ trợ.
- `src/features/session/shell/{session-shell,shell-header,offline-banner}`, `src/features/session/hooks/{use-session-timer,use-autosave-draft}`, `src/components/layout/focus-routes.ts`: focus, đồng hồ, lưu và cảnh báo.
- `public/sw.js`, `src/app/offline/page.tsx`: cache giao diện, không cache API/audio/bài nộp; học đầy đủ vẫn cần mạng.

## Kiểm chứng

- Đích ghi là file/thư mục thật trong project, không symlink; file hướng dẫn và báo cáo chưa tồn tại trước khi tạo.
- Đối chiếu hướng dẫn với mã nguồn, không coi checkbox đã tick trong plan là kiểm chứng chạy thật.
- Đã kiểm tra 14 đích Markdown link ở mục lục/hướng dẫn đều tồn tại; `git diff --check` trong phạm vi tài liệu không báo lỗi.
- Đã đọc lại sửa lỗi của controller: skip thất bại giữ onboarding và hiện lỗi; lưu nháp thất bại giữ màn học, lưu thành công mới pause timer/rời bài. Đây là kiểm chứng source, chưa phải bấm thử runtime.
- Chưa nhận kết quả tester/reviewer cuối cùng từ controller tại lúc viết báo cáo; không khẳng định lint/typecheck/unit/build/review đã qua.

## Giới hạn và việc còn mở

- Chưa kiểm chứng điện thoại thật: micro, bàn phím, audio, chuyển ứng dụng, PWA và mất mạng.
- Chưa kiểm chứng đăng nhập, RLS/ownership, đọc–ghi hồ sơ/bài và Storage với Supabase thật; chưa gọi Gemini thật.
- Chưa xác nhận bản production có thay đổi này; source và tài liệu không thay bằng chứng deploy.
- Chờ controller cung cấp kiểm chứng cuối; rà lại đường dẫn tài liệu sau khi các sửa lỗi source kết thúc.

Câu hỏi chưa giải quyết: không có câu hỏi sản phẩm mới; các mục trên là khoảng trống kiểm chứng.

## Sync-back từ controller

Controller đã đối chiếu hướng dẫn với source cuối, bổ sung cách dùng gợi ý thu gọn ở Hôm nay và mục tiêu số từ theo đề. Lint/typecheck/358 test/default Turbopack build và browser local có receipt riêng tại báo cáo PM; không nâng chúng thành bằng chứng dịch vụ hoặc điện thoại thật. Đã liên kết nhật ký CLI trong báo cáo PM và đồng bộ plan 6/6 phase.
