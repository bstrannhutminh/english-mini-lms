---
title: Sửa câu hỏi nghe sang tiếng Anh
date: 2026-11-20
summary: "Đổi 15 câu hỏi và 60 lựa chọn; giữ đáp án, bảo vệ snapshot ôn cũ và kiểm chứng 402 tests."
---

# Sửa câu hỏi nghe sang tiếng Anh

## Nguyên nhân và sửa

Người dùng thấy câu hỏi tiếng Việt ở bài L1. Live SSR và YAML xác nhận UI render nguyên học liệu gốc; DB mẫu questions=null nên đọc file. Dịch prompt/options[].text của năm bộ L1/L2/L4/I-L1/I-L2, tổng15câu/60lựa chọn. IDs, đáp án, metadata, giải thích và timing giữ nguyên theo semantic diff. Sync năm file tới preview, không DBwrite/seed/restart.

## Verification phát hiện thêm

Thay đổi ảnh Vocabulary của phiên khác làm sáu lỗi fixturetype và ba test khôi phục lượt ôn cũ thất bại. Image metadata mặc định null ở response schema bảo vệ dữ liệu cũ; cập nhật hai fixture và thêm test snapshot thiếuảnh, giữ các assertion cũ. Lịch sử lỗi được giữ riêng.

## Kết quả

53test liên quan và toàn bộ51file/402testsPASS; lint/typecheck/build exit0. Còn hai warningimg của các thay đổi đồng thời. BrowserL1 12/12PASS, screenshot1440/375 đãxem, không mutation. Buildsourcecopy/hash/cleanup đã kiểm; preview/PG giữ, không đổi master/worktree. Chưa xác nhận thiết bị thật, production, thao tác nộp hoặc hai bộIELTS trênDBmẫu.

Report: plans/reports/fix-261120-1814-english-questions.md. AgentWiki publish skipped.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
