---
title: Tích hợp YouGlish vào thẻ quẹt từ vựng
date: 2026-11-20
summary: "Nút YouGlish giữ trạng thái ôn; 20/20 browser, 396 unit tests và video thật đạt."
---

# Tích hợp YouGlish vào thẻ quẹt từ vựng

## Đã làm

Thêm action YouGlish trên hai mặt flashcard, chụp query từ thẻ hiện tại trong Deck và dùng modal/widget đã có. Mở dừng TTS; interactionBlocked khóa grade/gesture/Undo/filter. Đóng giữ mặt/index/batch và gỡ iframe. API, DB và SRS không đổi. Hướng dẫn dùng đã cập nhật; giữ một master/một worktree và các thay đổi của lượt khác.

## Lỗi và quyết định

Browser bắt lỗi focus về BODY vì trigger bị disabled trước khi Modal chụp activeElement. Giữ trigger enabled dưới native dialog inert; hook busy vẫn khóa thao tác nền. Attempt5 kiểm chứng 20/20 PASS sau sửa, không xóa lịch sử thất bại.

Preview sau SSD disconnect thiếu env mẫu; khôi phục bằng metadata local đã có. Tailwind scan artifacts gây CSS lỗi ở preview; chỉ giới hạn source scan của bản preview, giữ CSS chính. Kiểm tra cuối trên source copy riêng tránh làm hỏng cache dev. npm harness ban đầu dùng chung /dev/null cho user/global nên lỗi trước ESLint; tách hai empty configs rồi chạy lại.

## Bằng chứng và giới hạn

Lint/typecheck/unit/build cuối exit0; 50 file/396 tests PASS. Còn một lint warning no-img-element trong Markdown của lượt khác. 585 source/config inputs khớp trước/sau; snapshot/dependency copy và build child đã cleanup, giữ preview/PG/server của phiên khác.

YouGlish thật trả empty404 cho hai thuật ngữ y khoa; focused check dùng thẻ fixture hello và mạng provider thật. Native Play phát TED, currentTime 216.61→222.52 giây; đóng còn0iframe, không mutation DB. Chưa test điện thoại vật lý, nghe bằng tai, human visual approval hoặc production.

Bàn giao: plans/reports/ban-giao-261120-1601-flashcards-youglish.md. Preview: http://127.0.0.1:3000/vocab/flashcards. AgentWiki publish skipped.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
