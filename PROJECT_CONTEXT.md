# English Mini LMS — Project Context

**Ngày tổng hợp:** 2026-11-20. **Trạng thái:** bản chụp thông tin từ tài liệu, không phải kết quả chạy lại kiểm thử. Khi có tài liệu mới, hãy đọc và đối chiếu trước khi kết luận.

## Truy cập
- Workspace Cloud Harness MCP: `ssd_mes`.
- Windows: `Y:\AI4A\english-mini-lms`.
- Mac: `/Volumes/SSD ME/AI4A/english-mini-lms`.
- Kết nối qua Tailscale/SMB; đã duyệt và đọc được thư mục. Bộ duyệt `files_list` có thể báo `path escapes workspace` với thư mục con của ổ UNC; đã từng truy cập được bằng lệnh CMD đổi sang ổ Y:. Không coi đây là bằng chứng mọi lệnh ghi đều hoạt động.

## Sản phẩm
LMS cho một người học, 30–45 phút/ngày; 4 kỹ năng tiếng Anh, Vocabulary Vault, bài học y khoa, lộ trình hướng IELTS 7.5–8.0. Phục vụ học ngôn ngữ, không phải khám chữa bệnh. Tuyệt đối tách khỏi dữ liệu phòng khám/bệnh nhân.

## Stack & đường dẫn nguồn
- `package.json`: Next.js 16.3.6, React 19.2.8, TypeScript, Supabase, Drizzle, Gemini, Tailwind, Vitest.
- `src/app/` route & API; `src/features/` UI theo tính năng; `src/contracts/` schema; `src/server/` domain/service/provider; `src/db/` migration; `content/english-lab/` học liệu; `tests/unit/`, `tests/integration/`.
- `AGENTS.md` và `.agents/rules/english-mini-lms.md` đã tồn tại — **không ghi đè**. `docs/README.md` chỉ nguồn sự thật. `docs/RUNBOOK.md` hướng dẫn vận hành.

## Tình trạng gần nhất theo tài liệu đã đọc
1. `docs/huong-dan-lms-2026-11-19.md` mô tả onboarding, phiên học, Thư viện, 4 kỹ năng, Sổ từ và flashcards/YouGlish. Tài liệu thừa nhận chưa xác nhận chạy trọn vẹn trên điện thoại thật với Supabase/Gemini/production.
2. `plans/reports/consolidation-261120-1123-master.md` cho biết một đợt local master consolidation đã kiểm tra lint/typecheck/unit/build đạt và ghi nhận 394 unit tests — đây là **báo cáo lịch sử**, không thay cho chạy lại ở bản hiện tại.
3. `plans/261120-1601-flashcards-youglish/plan.md` ghi `in-progress`; `plans/reports/qa-261120-1601-flashcards-youglish.md` ghi nhận lỗi restore focus sau đóng modal và các checklist QA chưa xác nhận. Có thể đã có cập nhật sau báo cáo; đọc mới trước khi sửa.
4. Git CLI trên Windows từng báo `dubious ownership` với repo trên SMB. Không sửa cấu hình Git toàn cục nếu chưa được duyệt.

## Bất biến phải giữ
- Submission append-only, assisted server-side, speaking không có audio thật thì `pronunciation: not_assessable`.
- IELTS là practice estimate, không phải chứng nhận/chấm thi chính thức.
- Nguồn học phải được duyệt trong manifest. Không đưa dữ liệu bệnh nhân hoặc secret vào Gemini/chat/Git.
- Giữ scope Lite, đọc `docs/plan/lite-mvp-track.md` và `AGENTS.md` trước khi code.

## Mở phiên kế tiếp
1. `workspace_list` → xác minh `ssd_mes` → mở đúng `Y:\AI4A\english-mini-lms`.
2. Đọc `AGENTS.md`, rules, docs/README.md, kế hoạch và QA mới nhất.
3. Kiểm tra working tree và trạng thái tiến độ, tránh đụng task/agent đang chạy.
4. Review/plan trước; không sửa/deploy khi chưa duyệt.

## Cập nhật
Sau mỗi giai đoạn đã được duyệt và thực hiện, ghi ngày, thay đổi, bằng chứng test và liên kết báo cáo. File này là điểm bắt đầu, không thay thế mã nguồn hoặc tài liệu chính thức.
