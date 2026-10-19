---
description: Thực hiện một bước vá lỗi trong hướng dẫn sau review (ví dụ /fix-step 2)
---

# /fix-step <số bước>

Thực hiện đúng một bước vá trong `docs/plan/huong-dan-sua-loi-va-trien-khai.md`.

1. Đọc `AGENTS.md`, `.agents/rules/english-mini-lms.md`, `docs/plan/reports/code-review-2026-09-26.md` (nền các lỗi).
2. Mở `docs/plan/huong-dan-sua-loi-va-trien-khai.md`, tìm mục "Vá <số>". Trích lại cho người dùng: mục tiêu, tiêu chí xong.
3. Kiểm tra trạng thái repo (git status, file liên quan). Nếu bước vá trước chưa xong, báo người dùng.
4. Vào Planning mode. Viết Implementation Plan gồm: file sửa, migration nếu có, test bổ sung, cách kiểm tay trên điện thoại. Chờ người dùng duyệt.
5. Implement theo plan. Commit nhỏ theo phần logic, message `fix(fix-N): ...`.
6. Gọi `/verify`.
7. Nếu đụng UI: Browser subagent mở `http://localhost:3000` chạy luồng bị lỗi trước đó, chụp màn hình.
8. Walkthrough: đã vá gì, cách test tay, đối chiếu từng tiêu chí "xong" ✅/❌.
