# Tích hợp UI

Files root sở hữu: `src/features/vocab/flashcard.tsx`, `flashcard-deck.tsx`; guide sau verification ở `docs/huong-dan-lms-2026-11-19.md`.

- [x] Thêm action YouGlish tùy chọn vào thẻ, shared Button44px và pointer/focus guards.
- [x] Deck chụp query hiện tại, cancel TTS, render shared modal qua portal và đưa modal state vào interactionBlocked.
- [x] Rà caller, loading/fly/pending/closed states và backcompat; không sửa API/DB.

Rollback: chỉ hoàn tác2file source do lượt này sửa; giữ mọi work trước. Không đổi review batch hoặc lưu DB để mở/đóng video.
