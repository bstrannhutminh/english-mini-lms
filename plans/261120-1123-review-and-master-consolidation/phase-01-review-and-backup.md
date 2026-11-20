# Review và chuẩn bị

- [x] Inspect branches/worktrees/ancestry/remote heads và bảo toàn phạm vi dirty.
- [x] Đọc README, development rules, Git/review skills và các receipt trước.
- [x] Rà nguồn/tính năng/UI/UX/kiến trúc theo checklist, ghi limitations của independent re-review bị khóa.
- [x] Run lint/typecheck/unit/build, quét staged literals và kiểm staged scope.
- [x] Backup Git history, working delta và manifest; chỉ snapshot file hợp lệ, không đọc/đưa config riêng vào commit.

Risk: source artifacts/generated data không thuộc commit; local1DevTool state cần ignore. DB không thay đổi trong lượt này. Preview/PG được giữ cho người dùng xem.
