# Xác minh

Authority: acceptance của [plan](plan.md), findings peer, tests/source hiện có.

- [ ] Chọn suite/check theo caller và risk; inspect integration setup trước mọi DB mutation.
- [ ] DB test riêng, backup trước mutation; giữ database preview và không dùng config thật nếu chưa có quyền.
- [ ] Run focused checks rồi lint/typecheck/unit/build cho source mới; giữ raw receipts từng attempt.
- [ ] Browser regression/ảnh các state và responsive liên quan; cập nhật preview có kiểm soát sau checks.
- [ ] Đối chiếu readiness riêng DB/provider/Auth/Storage/audio/device; trạng thái chưa chạy/chưa xác nhận không phải PASS.
- [ ] Dọn đúng process/fixture do lượt này tạo, giữ local đang được người dùng xem.

Không repeat suite đã đạt khi input không đổi. Không gọi provider/đọc credential để bypass hook. Không chạy `npm run smoke` trực tiếp khi PG54329 đã có owner; inspect tooling và chọn phương án không trùng process/cổng.
