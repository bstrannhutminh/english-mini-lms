"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog, EmptyState } from "@/components/ui";
import { useFlashcardDeck } from "./use-flashcard-deck";
import { Flashcard } from "./flashcard";
import { DeckTopBar } from "./deck-top-bar";
import { DeckControls } from "./deck-controls";
import { DeckSaveFailed, DeckSummary } from "./deck-summary";

/**
 * FlashcardDeck — màn ôn nhanh bằng thẻ vuốt (giữ cử chỉ kéo-thả + phím tắt).
 * State/gesture nằm ở useFlashcardDeck; window.confirm cũ → ConfirmDialog.
 */
export function FlashcardDeck() {
  const router = useRouter();
  const deck = useFlashcardDeck();
  // null | "finish" (lưu & xem tổng kết) | "abandon" (thoát không lưu)
  const [confirm, setConfirm] = useState<null | "finish" | "abandon">(null);

  // Kết thúc phiên sớm: chưa quẹt thẻ nào → về thẳng Sổ từ;
  // đã quẹt → hỏi xác nhận trước khi lưu & tổng kết.
  const handleFinishEarly = () => {
    if (deck.batch.length === 0) {
      router.push("/vocab");
      return;
    }
    setConfirm("finish");
  };

  // ── MÀN LỖI KHI LƯU THẤT BẠI ─────────────────────────────
  if (deck.saveStatus === "failed") {
    return (
      <>
        <DeckSaveFailed
          batchCount={deck.batch.length}
          saving={deck.saving}
          onRetry={() => deck.submitBatchReviews(deck.batch)}
          onAbandon={() => setConfirm("abandon")}
        />
        <ConfirmDialog
          open={confirm === "abandon"}
          tone="danger"
          title="Bỏ kết quả đợt ôn này?"
          description={`Tiến trình ${deck.batch.length} từ vừa ôn sẽ không được lưu vào Spaced Repetition.`}
          confirmLabel="Thoát không lưu"
          cancelLabel="Ở lại"
          onConfirm={() => {
            setConfirm(null);
            router.push("/vocab");
          }}
          onCancel={() => setConfirm(null)}
        />
      </>
    );
  }

  // ── MÀN TỔNG KẾT SAU KHI HẾT BỘ BÀI ──────────────────────
  if (deck.isFinished) {
    return (
      <DeckSummary
        history={deck.history}
        onReviewIncorrectOnly={deck.handleReviewIncorrectOnly}
        onSpeak={deck.speakPhrase}
      />
    );
  }

  // ── MÀN TẢI / LỖI / TRỐNG ────────────────────────────────
  if (deck.loading) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin text-4xl mb-3">🃏</div>
        <p className="text-sm font-semibold text-slate-600">
          Đang chuẩn bị bộ thẻ từ vựng Spaced Repetition...
        </p>
      </div>
    );
  }

  if (deck.error) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12 min-h-[calc(100vh-120px)] flex flex-col justify-center items-center">
        <EmptyState
          icon="alert-triangle"
          title="Không thể tải thẻ ôn"
          description={deck.error}
          action={
            <button
              onClick={deck.handleRetry}
              className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              Thử lại 🔄
            </button>
          }
        />
      </div>
    );
  }

  if (deck.items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] text-center">
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-100">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-xl font-black text-slate-900 mb-1">
            Không có từ nào đến hạn!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Bạn đã ôn hết các từ đến lịch hôm nay. Bạn có thể chọn chế độ{" "}
            <strong>Ôn tự do</strong> để lướt lại toàn bộ kho từ đã lưu.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => deck.handleFilterModeChange("all")}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>🃏</span> Bắt đầu Ôn tự do (Tất cả từ)
            </button>

            <Link
              href="/vocab"
              className="block w-full py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl transition text-center text-xs"
            >
              Quay lại Sổ từ vựng 📚
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── MÀN CHÍNH LƯỚT BỘ THẺ ────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-md px-3 sm:px-4 py-2 flex flex-col justify-between h-[calc(100dvh-75px)] sm:h-[calc(100vh-80px)] select-none overflow-hidden">
      <DeckTopBar
        currentIndex={deck.currentIndex}
        total={deck.items.length}
        filterMode={deck.filterMode}
        onModeChange={deck.handleFilterModeChange}
        onFinishEarly={handleFinishEarly}
      />

      {deck.currentCard && (
        <Flashcard
          item={deck.currentCard}
          isFlipped={deck.isFlipped}
          dragOffset={deck.dragOffset}
          isDragging={deck.isDragging}
          flyDirection={deck.flyDirection}
          hasNext={deck.currentIndex + 1 < deck.items.length}
          onSpeak={deck.speakPhrase}
          handlers={deck.cardHandlers}
        />
      )}

      <DeckControls
        canUndo={deck.history.length > 0 && deck.currentIndex > 0}
        disabled={deck.busy}
        onDontKnow={() => deck.handleCardDecision("dont_know")}
        onUndo={deck.handleUndo}
        onFlip={deck.flipCard}
        onKnow={() => deck.handleCardDecision("know")}
      />

      <ConfirmDialog
        open={confirm === "finish"}
        title="Lưu kết quả và xem tổng kết?"
        description={`Bạn đã ôn ${deck.batch.length} từ trong đợt này.`}
        confirmLabel="Lưu & tổng kết"
        cancelLabel="Ôn tiếp"
        loading={deck.saving}
        onConfirm={() => {
          setConfirm(null);
          deck.submitBatchReviews(deck.batch);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
