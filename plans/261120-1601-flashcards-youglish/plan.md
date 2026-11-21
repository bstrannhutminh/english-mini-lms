---
title: "YouGlish ngay trên thẻ quẹt từ vựng"
status: completed
created: 2026-11-20
branch: master
priority: P1
---

# Tích hợp YouGlish vào flashcard

## Kết quả và ranh giới

Người dùng yêu cầu tích hợp trực tiếp YouGlish vào thẻ ôn kiểu quẹt. Mỗi thẻ có nút nghe ví dụ của đúng từ/cụm từ đang học; mở video rồi đóng lại tiếp tục cùng thẻ, giữ mặt thẻ và các lượt ôn. Giữ stack, Teal/Inter, widget hiện có và SRS; không đổi API/DB, không thêm dependency hoặc tạo branch/worktree.

Không thêm chấm AI/curriculum hoặc thay cơ chế lưu kết quả. Không đọc config bị chặn, không push/deploy. Source ở masterd3d48b4; ổSSD đã trở lại sau lúc bị tháo, chưa có source edit trong lượt bị ngắt.

## Scout và review kế hoạch

`FlashcardDeck` sở hữu state/guard của phiên ôn; `useFlashcardDeck(interactionBlocked)` đã khóa grade/gesture/hotkey. `Flashcard` render thẻ và có TTS; `YouGlishModal`/`Widget` dùng chung đã có focus/scroll/cleanup/error fallback. Thêm state modal ở Deck thay vì sửa widget hoặc callback của mọi YouGlishButton caller.

Explorer đã đối chiếu nguồn widget.js chính thức liveHTTP200/v4.3: constructor đăng ký events và tựfetch options.query; zones/lang/autoStart truyền đúng. Không cần thay init/fetch. Đã đọc hướng dẫn Next16 use-client; source thay đổi đều là client components.

Controller review: modal ở Deck, query chụp từ currentCard; busy chặn khi loading/saving/fly/confirm. Button dừng pointer propagation và chủ động focus để không flip khi mở và có trigger để restore. Mở video hủy TTS đang đọc; đóng dùng cleanup widget hiện có. Routes/contracts/DB không đổi; callers Flashcard giữ tương thích bằng props tùy chọn.

Touchpoint phụ: `eslint.config.mjs` ignore đúng các local `plans/reports/*-artifacts/**`; source/tests vẫn lint. Lint trước đó chỉ có2warning ở scripts QA cũ trong artifact, được giữ trong ghi nhận; không tắt rule để vượt lỗi source.

Browser đã bắt lỗi focus do trigger bị disabled trước khi Modal chụp activeElement. Sửa theo nguyên nhân: modal native làm thẻ inert, nên giữ các nút của thẻ enabled trong lúc modal mở để trigger vẫn giữ focus; grade/gesture/filter/undo vẫn bị hook busy và dialog chặn. Attempt 5 đã kiểm chứng 20/20 thao tác PASS trên bản sửa; ảnh 320/375/1440px đã được xem trực tiếp. Các attempt lỗi trước được giữ riêng.

Preview dùng IPv4 `127.0.0.1:3000`, PID 1253; PostgreSQL mẫu PID 26892, port 54329. Server IPv6 PID 93826 thuộc phiên khác được giữ nguyên. Bốn component liên quan khớp SHA256 giữa source và preview; chỉ stylesheet của preview giới hạn Tailwind scan để tránh đọc cache/artifacts, không đổi style tokens hoặc CSS source chính. Build cuối chạy trên bản sao riêng, không dùng cache `.next` của hai server.

Đối chiếu source của controller ghi trong [receipt](../reports/youglish-261120-1601-artifacts/controller-review-final.json); đây không phải review độc lập từ linked terminal. Kết quả browser và giới hạn provider nằm trong [báo cáo QA](../reports/qa-261120-1601-flashcards-youglish.md).

## Acceptance

- [x] Nút YouGlish có trên mặt trước/sau thẻ, truy vấn đúng từ hiện tại; query rỗng không mở.
- [x] Click/Enter/Space trên nút không flip/grade hoặc tạo POST ôn; focus về đúng nút khi đóng.
- [x] Mở video khóa grade/gesture/undo/filter, giữ index/flip/pending batch; đóng/reopen không mất kết quả, từ kế tiếp dùng query mới.
- [x] Không mở trong loading/saving/fly; TTS dừng khi mở, iframe bị gỡ khi đóng; error/empty có fallback.
- [x] Browser narrow checks và screenshots responsive, lint/typecheck/unit/build đạt; ghi rõ widget thật so với fixture/physical-device limits.
- [x] Preview local được cập nhật đúng source, giữ process/DB; owning guide và report bàn giao khớp behavior.

## Phases

| Phase | Nội dung | Theo dõi |
|---|---|---|
| 1 | [Tích hợp nút và modal](phase-01-integration.md) | Checklist trong phase |
| 2 | [Kiểm tra và bàn giao](phase-02-verification.md) | Checklist trong phase |

## Bàn giao và bằng chứng cuối

Lint/typecheck/unit/build cuối exit 0 trên 585 input source/config khớp từng file; 50 file/396 unit tests PASS. Lint còn một warning ảnh Markdown ngoài thay đổi YouGlish. Native Play của YouGlish thật đã phát clip TED cho thẻ fixture `hello`; currentTime tăng 216.61 → 222.52 giây. Hai thuật ngữ y khoa mẫu vẫn empty/404. QA không ghi DB.

[Bàn giao](../reports/ban-giao-261120-1601-flashcards-youglish.md), [gates cuối](../reports/youglish-261120-1601-artifacts/checks-final.json), [QA](../reports/qa-261120-1601-flashcards-youglish.md), [journal](../journals/2026-11-20-tch-hp-youglish-vo-th-qut-t-vng.md).

Đã dọn browser/profile và snapshot/process build; giữ preview/PG cho người dùng. Chưa xác nhận điện thoại vật lý, nghe âm thanh bằng tai, human visual approval và production. Các giới hạn này được ghi riêng, không dùng fixture để thay bằng chứng thực tế.
