# Báo cáo tách module UI — 19/11/2026

Status: DONE

## Kết quả

Tách 7 vùng UI/hook có nhiệm vụ riêng; giữ nguyên props công khai, markup, lớp CSS và hành vi. Không thêm dependency. Tất cả file gốc được giao và file mới đều ≤200 dòng.

| File gốc trong `src/features/` | Trước → sau | File cùng thư mục được tách |
|---|---:|---|
| `my-work/list/work-list-view.tsx` | 218 → 171 | `use-submission-list.ts` — tải dữ liệu, huỷ cập nhật sau unmount, thử lại |
| `session/modes/listening/listening-panel.tsx` | 239 → 192 | `listening-lesson-header.tsx` — thông tin bài và 3 chặng |
| `session/modes/speaking/speaking-recorder.tsx` | 212 → 194 | `speaking-upload-status.tsx` — trạng thái lưu audio và thử lại |
| `session/shell/session-shell.tsx` | 253 → 153 | `use-session-controller.ts` — state, timer, nháp, nộp bài và overlay |
| `vocab/vocab-list.tsx` | 211 → 179 | `vocab-page-header.tsx` — tiêu đề và lối vào hai bài ôn |
| `library/library-explorer.tsx` | 216 → 144 | `library-filter-bar.tsx` — tìm kiếm, trạng thái, kỹ năng |
| `onboarding/step-schedule.tsx` | 225 → 180 | `onboarding-ielts-options.tsx` — lựa chọn IELTS tuỳ chọn |

Điều chỉnh UI duy nhất theo bằng chứng browser của agent chính: Link sang `/library` ở empty state `/my-work` có thêm `inline-flex min-h-11`, mở rộng vùng chạm của thẻ liên kết quanh Button hiện có.

Các hành vi phiên học giữ nguyên: lỗi lưu nháp đóng hộp thoại và hiện lỗi; chỉ nộp thành công mới gọi `timer.stop()`; lưu và thoát thành công gọi `timer.pause()`. Transcript vẫn chỉ lấy dữ liệu được server cho phép. Không đụng server, API/contracts, DB, env, git hoặc `icon-paths.ts`.

## Kiểm tra

- ESLint trên đúng 14 file sửa/tạo: PASS.
- `npm test -- tests/unit/layout tests/unit/library tests/unit/onboarding tests/unit/listening tests/unit/lib-modes.test.ts tests/unit/invariants/mode-routing.test.ts`: 11 file, 80 test PASS.
- Đối chiếu bản trước khi tách: khối controller phiên học và fetch/retry giữ nguyên từng ký tự; 6 phần JSX được tách giữ markup, chỉ đổi tên biến tương đương và căn lề.
- Không chạy dev server, DB hoặc build. Agent chính phụ trách full lint/typecheck/build và browser trên revision cuối.

## Chưa xác nhận

Browser và kiểm tra toàn dự án sau khi tách do agent chính thực hiện. Không có câu hỏi chưa giải quyết trong phạm vi tách module.
