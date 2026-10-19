# Mục lục tài liệu — "sự thật hiện tại" ở đâu?

Cập nhật: 19/10/2026 (sau đợt tái cấu trúc). Khi tài liệu mâu thuẫn, đọc theo thứ tự ưu tiên dưới đây.

## Đọc trước khi code (bắt buộc)

1. `plan/lite-mvp-track.md` — phạm vi bản Lite, stack, invariant.
2. `plan/kien-truc-tai-cau-truc-2026-10-19.md` — kiến trúc hiện tại (features/, contracts/, session plugin, test tách đôi).
3. `plan/product-design.md` — 5 mode, màn hình, Vocabulary Vault.
4. `plan/data-and-tools-contract.md` — tên bảng/API (Lite dùng tập con; shape cụ thể nay nằm ở `src/contracts/`).
5. `../AGENTS.md` + `../.agents/rules/english-mini-lms.md` — luật bắt buộc cho agent.

## Vận hành & hướng dẫn người dùng

- `RUNBOOK.md` — backup/restore, biến môi trường, deploy Vercel, health endpoints, chi phí Gemini.
- `google-drive-setup.md` — cấu hình Drive sync cho admin.
- `plan/huong-dan-tu-build-anh-minh.md`, `plan/huong-dan-tom-gon-gui-anh-minh.md`, `plan/ban-gui-anh-minh.md` — hướng dẫn gửi BS. Minh.
- `plan/huong-dan-xay-dung-voi-antigravity.md` — quy trình từng bước của agent.
- `journals/` — nhật ký từng đợt làm việc.

## Quyết định kiến trúc (ADR)

`adr/0001-session-plugin-registry.md` · `adr/0002-shared-zod-contracts.md` · `adr/0003-env-safe-lazy-init.md` · `adr/0004-proxy-over-middleware.md`

## Báo cáo

- `plan/reports/refactor-report-2026-10-19.md` — báo cáo đợt tái cấu trúc (agent → thay đổi → test → rủi ro).
- `plan/reports/qa-2026-10-19/` — ảnh QA 390px/1280px (khi C1 hoàn tất).
- `plan/reports/` còn lại — rà soát cũ, chỉ tham khảo lịch sử.

## Tham khảo (đích v2 — KHÔNG làm theo ở Lite)

`plan/plan.md`, `plan/phase-0*.md`, `plan/technical-architecture.md`, `plan/operations-and-acceptance.md`, `plan/evidence-and-decisions.md`, `plan/m2-*.md`, `plan/m3-*.md`, `plan/research/`.
