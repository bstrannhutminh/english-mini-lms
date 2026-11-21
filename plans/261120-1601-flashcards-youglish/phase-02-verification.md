# Verification và bàn giao

- [x] Gates lint/typecheck/unit/build cho final source.
- [x] Sync source có kiểm soát tới preview cô lập; giữ preview IPv4 port3000 và PG54329. Track/reuse deterministic server, giữ server của phiên khác, không duplicate.
- [x] Browser native input: open không flip/grade; modal hotkeys/batch/index/close/focus; swipe sau close, next word query và reopen; loading/error/cleanup/responsive.
- [x] Thử YouGlish thật; fixture chỉ dùng để kiểm error/state/POST boundary, không thay proof video thật.
- [x] Test không mutate DB; intercept quick-review POST nếu cần. Giữ riêng browser của user; đóng browser QA và giữ preview cho user xem.
- [x] Update owning guide, report limits, sync allphase và journal preference.

Không thêm test mirror CSS/implementation; UI wiring kiểm bằng browser. Không chạy broadchecks lặp nếu input không đổi.

Bằng chứng: [bàn giao](../reports/ban-giao-261120-1601-flashcards-youglish.md), [QA 20/20 và playback thật](../reports/qa-261120-1601-flashcards-youglish.md), [4 gates cuối](../reports/youglish-261120-1601-artifacts/checks-final.json). Giữ lịch sử attempt lỗi; giới hạn physical-device/production/human approval vẫn được ghi riêng.
