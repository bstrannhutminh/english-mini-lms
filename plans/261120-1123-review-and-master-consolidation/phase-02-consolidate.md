# Hợp nhất master

- [x] Fast-forward master chỉ khi ancestry/expected tip còn đúng; switch tới cùng tree, giữ working changes.
- [x] Commit source/tests/owning docs và các báo cáo/kế hoạch hợp lệ theo nhóm coherent.
- [x] Verify commit tree, pending files và đầu branch.
- [x] Detach worktrees refactor ở tip hiện tại, giữ dirty/ignored files và không dừng process của người dùng.
- [x] Xóa mọi branch local khác master bằng `-d`, kiểm ancestry trước/sau.
- [x] Chốt phạm vi GitHub theo câu trả lời user; default local nếu không có trả lời, không push/deploy tự động.

Rollback: history bundle và snapshot trong `.git`; nhánh cũ có thể tạo lại ở tip đã ghi. Không force-push master.
