# Đồng bộ kế hoạch LMS refresh — 20/11/2026

Trạng thái bàn giao: **đã giao bản local, chờ người dùng chấp nhận thị giác**. Source triển khai đã đóng băng; plan giữ `in-progress` vì còn gate nghiệm thu chưa có bằng chứng.

## Cách đồng bộ

Đã áp dụng `ak-project-management`, đọc toàn bộ phase và đối chiếu reports Foundation, Discovery, Learning, code-review, browser, critique và receipt delivery. Runtime task surface đã được controller phát hiện; `tasks_list mine` hiện có 0 item. Dùng kế hoạch file-backed, không tạo task ngoài dự án.

Live `ak plan --help` và help của `check`, `update`, `phase update`, `validate` xác nhận: `check` chỉ đánh dấu **mọi** checkbox trong một phase; `phase update --status` không hỗ trợ vì status thuộc file; `update --status` sửa frontmatter của `plan.md`. CLI không hỗ trợ sửa prose hoặc từng checklist riêng. Vì vậy bổ sung checklist triển khai ở phase 1–4 và tách gate phase 5/acceptance bằng patch tối thiểu, sau đó chỉ dùng `ak plan check` cho phase đã triển khai đầy đủ. Không bulk-check phase 5. Trước sync, phase 1–5 chưa có checkbox; acceptance trong plan có 0/13 mục được đánh dấu.

## Kết quả và bằng chứng

Full-plan sweep đã đối chiếu mọi phase và backfill bước triển khai trước đó. Không quy phase triển khai hoàn tất thành nghiệm thu toàn bộ.

| Phạm vi checklist | Đã xác nhận | Chưa xác nhận | Trạng thái |
|---|---:|---:|---|
| Phase1 Foundation | 5/5 | 0 | Completed — source |
| Phase2 Discovery/onboarding | 4/4 | 0 | Completed — source |
| Phase3 Learning/MyWork | 5/5 | 0 | Completed — source |
| Phase4 Supporting pages | 6/6 | 0 | Completed — source |
| Phase5 Verification | 12/19 | 7 | In-progress — local đã giao/chờ visual acceptance |
| Tổng phase | 32/39 | 7 | In-progress |
| Acceptance trong plan | 20/32 | 12 | Tách phần local PASS và phần còn thiếu proof |

Số item sau tách criteria không tương đương13criteria kết hợp ban đầu; giữ nguyên ý định/ngưỡng và ghi rõ phần chưa đạt. Không dùng32/39 hoặc20/32 làm coverage%/human acceptance.

`ak plan check` cho phase1–4 exit0; `ak plan update ... --status in-progress` exit0 và sửa frontmatter. CLI trả store id `english-mini-lms/261119-0417` với `dir` đúng kế hoạch refresh hiện tại; không tạo/sửa task runtime hoặc kế hoạch khác. Phase5 sửa từng item bằng patch theo giới hạn CLI đã nêu; không bulk-check.

- [Delivery checks](verification-261120-0051-lms-refresh-artifacts/delivery-checks.json): lint/typecheck/unit/build exit 0; unit log ghi 50 files/394 tests đạt.
- [Review nguồn cuối](code-review-261120-0051-lms-refresh.md): cả 7 findings và nhánh hotkeys khi tải lỗi đã giải quyết ở working tree.
- [Browser QA](browser-261120-0120-lms-refresh.md): critical paths đạt trên preview/DB mẫu; [critique](browser-261120-0120-lms-refresh-artifacts/visual-critique.md) vòng 2 đạt 21/24, không mục 0, các mục 5/8/12 còn 1.
- [Walkthrough và verification cuối](verification-261120-lms-refresh-final.md) là báo cáo bàn giao của controller; không chạy thêm source checks trong lượt PM.

Local `http://127.0.0.1:3000/today` HTTP200 theo [runtime receipt](verification-261120-0051-lms-refresh-artifacts/delivery-preview-runtime.json); Next listener26111/parent98799, PG26892:54329 được giữ. PID98800 của checkpoint cũ đã thoát; Chrome QA3645 đã đóng và cleanup không còn QA-owned process. Không khởi động/dừng process; không đọc `process.json`/credentials, không commit/push/deploy.

Validation sau đồng bộ: `ak plan validate plans/261120-0013-lms-visual-refresh --json` exit0/valid=true; script read-only xác nhận frontmatter `in-progress`, đúng counts từng phase/acceptance và63local links trong8file không có link thiếu. Không chạy lại source tests/build.

## Giới hạn và câu hỏi còn mở

Chưa có human visual acceptance, state matrix đầy đủ, native Safari/điện thoại vật lý/zoom 200%, provider/audio/Storage/Auth/RLS/OAuth thật hoặc production proof. Một observation đơn desktop còn hẹp; icon Vocab/review và state matrix chưa có ảnh polished đầy đủ. Các gate chưa kiểm sẽ giữ unchecked; không claim 100% acceptance.

Không có quyết định sản phẩm mới cần hỏi. Bước tiếp theo: người dùng xem local/ảnh và chấp nhận thị giác; nếu cần nghiệm thu các môi trường chưa kiểm, thực hiện có chủ đích trong lượt riêng, giữ scope provider/production ngoài lần refresh local này.

Status: DONE_WITH_CONCERNS
Summary: Đã đồng bộ cả5phase, plan và state từ evidence cuối; nguồn triển khai xong, bản local đã bàn giao, plan vẫn in-progress với32/39phase items và20/32acceptance items được xác nhận.
Concerns/Blockers: Human visual acceptance và các gate runtime/device/provider chưa có bằng chứng giữ unchecked; không có source blocker hoặc câu hỏi sản phẩm mới.
