# Cải tiến sản phẩm từ review

Phụ thuộc [phase1](phase-01-review-and-scope.md). Danh sách file và từng acceptance sẽ bổ sung từ findings trước khi viết code.

- [ ] Chốt các sửa behavior/UI/architecture cần cho vòng học hiện có, cùng caller/contracts bị ảnh hưởng.
- [ ] Sửa theo nguyên nhân và pattern hiện tại; không thêm dữ liệu giả hay dependencies.
- [ ] Xác minh focused checks sau mỗi slice; giữ lỗi/retry và các invariant.
- [ ] Đưa diff và bằng chứng mới cho terminal review rà lại; giải quyết concern có bằng chứng trong scope.

Rollback: chỉ hoàn tác slice do lượt này tạo khi có bằng chứng cần rollback; không reset dirty tree. DB/schema thật ngoài phase này.
