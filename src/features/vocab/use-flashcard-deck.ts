"use client";

/**
 * useFlashcardDeck — state machine của màn ôn flashcard: tải bộ thẻ
 * (đến hạn / ôn tự do), gom batch quẹt, undo, kết thúc sớm, gửi batch SRS
 * (idempotent qua clientReviewId). Cử chỉ ở use-card-gesture.ts, phím tắt
 * ở use-deck-keyboard.ts; UI thuần nằm ở flashcard*.tsx.
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchFlashcardDeck,
  submitQuickReviews,
  type FlashcardDeckItem,
} from "./api";
import { useCardGesture } from "./use-card-gesture";
import { useDeckKeyboard } from "./use-deck-keyboard";
import { speakPhrase } from "./speech";

export type DeckFilterMode = "due" | "all";
export type CardResult = "know" | "dont_know";
export type SaveStatus = "idle" | "saving" | "saved" | "failed";

export interface ReviewAction {
  vocab_id: string;
  result: CardResult;
  clientReviewId: string;
}

export interface HistoryItem {
  item: FlashcardDeckItem;
  result: CardResult;
}

export function useFlashcardDeck() {
  // Chế độ: "due" (từ đến hạn) hoặc "all" (tất cả / ôn tự do)
  const [filterMode, setFilterMode] = useState<DeckFilterMode>("due");
  const [items, setItems] = useState<FlashcardDeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Chỉ số thẻ hiện tại + trạng thái lật
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Batch kết quả quẹt + lịch sử (cho undo & tổng kết)
  const [batch, setBatch] = useState<ReviewAction[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isFinished, setIsFinished] = useState(false);

  // Hướng bay của thẻ sau quyết định (hiệu ứng fly-out)
  const [flyDirection, setFlyDirection] = useState<"left" | "right" | null>(null);

  const busy = saving || saveStatus === "saving" || flyDirection !== null;

  const handleFilterModeChange = (mode: DeckFilterMode) => {
    if (mode !== filterMode) {
      setLoading(true);
      setError(null);
      setFilterMode(mode);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((c) => c + 1);
  };

  // Tải bộ thẻ khi đổi mode / retry
  useEffect(() => {
    let active = true;
    fetchFlashcardDeck({ freePractice: filterMode === "all" })
      .then((data) => {
        if (!active) return;
        setItems(data.items || []);
        setCurrentIndex(0);
        setIsFlipped(false);
        setBatch([]);
        setHistory([]);
        setIsFinished(false);
        setSaveStatus("idle");
        setFlyDirection(null);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Lỗi tải flashcards:", err);
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filterMode, reloadKey]);

  // Cảnh báo beforeunload nếu đã quẹt mà chưa lưu kết quả xong
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (batch.length > 0 && saveStatus !== "saved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [batch.length, saveStatus]);

  // Gửi kết quả batch tới server
  const submitBatchReviews = useCallback(
    async (reviewsToSubmit: ReviewAction[]) => {
      if (reviewsToSubmit.length === 0) {
        setSaveStatus("saved");
        setIsFinished(true);
        return;
      }

      setSaving(true);
      setSaveStatus("saving");
      try {
        await submitQuickReviews(reviewsToSubmit);
        setSaveStatus("saved");
        setIsFinished(true);
      } catch (err) {
        console.error("Lỗi nộp kết quả flashcard:", err);
        setSaveStatus("failed");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // Quyết định thẻ: know (thuộc) hoặc dont_know (chưa thuộc)
  const handleCardDecision = useCallback(
    (decision: CardResult) => {
      if (currentIndex >= items.length || isFinished || busy) return;

      const currentItem = items[currentIndex];
      setFlyDirection(decision === "know" ? "right" : "left");

      const newAction: ReviewAction = {
        vocab_id: currentItem.id,
        result: decision,
        clientReviewId: crypto.randomUUID(),
      };
      const updatedBatch = [...batch, newAction];
      setBatch(updatedBatch);
      setHistory((prev) => [...prev, { item: currentItem, result: decision }]);

      // Đợi hiệu ứng bay hoàn tất (240ms) rồi chuyển thẻ
      setTimeout(() => {
        setFlyDirection(null);
        setIsFlipped(false);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= items.length) {
          submitBatchReviews(updatedBatch);
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 240);
    },
    [currentIndex, items, isFinished, busy, batch, submitBatchReviews]
  );

  // Hoàn tác (Undo) thẻ vừa quẹt
  const handleUndo = useCallback(() => {
    if (history.length === 0 || currentIndex === 0 || busy || isFinished) {
      return;
    }

    setHistory((prev) => prev.slice(0, -1));
    setBatch((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsFlipped(false);
    setFlyDirection(null);
  }, [history.length, currentIndex, busy, isFinished]);

  // Ôn lại các từ chưa thuộc trong phiên vừa rồi
  const handleReviewIncorrectOnly = useCallback(() => {
    const unmasteredItems = history
      .filter((h) => h.result === "dont_know")
      .map((h) => h.item);
    if (unmasteredItems.length === 0) return;

    setItems(unmasteredItems);
    setCurrentIndex(0);
    setIsFlipped(false);
    setBatch([]);
    setHistory([]);
    setIsFinished(false);
    setSaveStatus("idle");
    setFlyDirection(null);
  }, [history]);

  const flipCard = useCallback(() => {
    if (!busy) setIsFlipped((prev) => !prev);
  }, [busy]);

  // Cử chỉ kéo-thả: kéo ngang → quyết định, chạm ngắn → lật
  const { dragOffset, isDragging, cardHandlers } = useCardGesture({
    disabled: busy || isFinished,
    onTapFlip: () => setIsFlipped((prev) => !prev),
    onSwipeRight: () => handleCardDecision("know"),
    onSwipeLeft: () => handleCardDecision("dont_know"),
  });

  // Phím tắt desktop
  useDeckKeyboard({
    disabled: busy || isFinished,
    onDontKnow: () => handleCardDecision("dont_know"),
    onKnow: () => handleCardDecision("know"),
    onFlip: flipCard,
    onUndo: handleUndo,
  });

  return {
    // state
    filterMode,
    items,
    loading,
    error,
    currentIndex,
    isFlipped,
    batch,
    history,
    saving,
    saveStatus,
    isFinished,
    dragOffset,
    isDragging,
    flyDirection,
    busy,
    currentCard: items[currentIndex] as FlashcardDeckItem | undefined,
    // actions
    handleFilterModeChange,
    handleRetry,
    speakPhrase,
    submitBatchReviews,
    handleCardDecision,
    handleUndo,
    handleReviewIncorrectOnly,
    flipCard,
    cardHandlers,
  };
}
