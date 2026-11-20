"use client";

/**
 * useFlashcardDeck — state machine của màn ôn flashcard: tải bộ thẻ
 * (đến hạn / ôn tự do), gom batch quẹt, undo, kết thúc sớm, gửi batch SRS
 * (idempotent qua clientReviewId). Cử chỉ ở use-card-gesture.ts, phím tắt
 * ở use-deck-keyboard.ts; UI thuần nằm ở flashcard*.tsx.
 */
import { useState, useEffect, useCallback } from "react";
import type { FlashcardDeckItem } from "./api";
import { useCardGesture } from "./use-card-gesture";
import { useDeckKeyboard } from "./use-deck-keyboard";
import { speakPhrase } from "./speech";

export type DeckFilterMode = "due" | "all";
import { useDeckReviews, type CardResult, type ReviewAction } from "./use-deck-reviews";
import { clearDeckSnapshot, readDeckSnapshot, saveDeckSnapshot } from "./deck-review-storage";
import { loadFlashcardData } from "./load-flashcard-data";
export type { CardResult, SaveStatus, ReviewAction, HistoryItem } from "./use-deck-reviews";
export function useFlashcardDeck(interactionBlocked = false) {
  const [filterMode, setFilterMode] = useState<DeckFilterMode>(() => readDeckSnapshot()?.mode ?? "due");
  const [items, setItems] = useState<FlashcardDeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const reviews = useDeckReviews();
  const { batch, setBatch, history, setHistory, saving, saveStatus, setSaveStatus,
    isFinished, submitBatchReviews, resetReviews } = reviews;

  const [flyDirection, setFlyDirection] = useState<"left" | "right" | null>(null);

  const busy = saving || saveStatus === "saving" || flyDirection !== null || interactionBlocked || error !== null;

  const handleFilterModeChange = (mode: DeckFilterMode) => {
    if (mode !== filterMode && !busy) {
      resetReviews();
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

  useEffect(() => {
    let active = true;
    const pendingSnapshot = readDeckSnapshot();
    loadFlashcardData(filterMode, pendingSnapshot)
      .then((data) => {
        if (!active) return;
        const snapshot = data.snapshot;
        const loadedItems = snapshot?.items ?? data.items;
        setItems(loadedItems);
        setCurrentIndex(snapshot?.batch.length ?? 0);
        setIsFlipped(false);
        if (snapshot) {
          setBatch(snapshot.batch);
          setHistory(snapshot.batch.map((entry) => ({ item: loadedItems.find((item) => item.id === entry.vocab_id)!, result: entry.result })));
          setSaveStatus(snapshot.batch.length >= loadedItems.length ? "failed" : "idle");
        } else resetReviews();
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
  }, [filterMode, reloadKey, setBatch, setHistory, setSaveStatus, resetReviews]);

  useEffect(() => {
    if (loading || error) return;
    if (batch.length > 0 && saveStatus !== "saved" && !loading) {
      saveDeckSnapshot({ mode: filterMode, items, batch });
    } else if (batch.length === 0) {
      clearDeckSnapshot();
    }
  }, [batch, saveStatus, loading, error, filterMode, items]);

  const handleCardDecision = useCallback(
    (decision: CardResult) => {
      if (currentIndex >= items.length || isFinished || busy || loading) return;

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
    [currentIndex, items, isFinished, busy, loading, batch, submitBatchReviews, setBatch, setHistory]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0 || currentIndex === 0 || busy || isFinished) {
      return;
    }

    setHistory((prev) => prev.slice(0, -1));
    setBatch((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsFlipped(false);
    setFlyDirection(null);
  }, [history.length, currentIndex, busy, isFinished, setHistory, setBatch]);

  const handleReviewIncorrectOnly = useCallback(() => {
    const unmasteredItems = history
      .filter((h) => h.result === "dont_know")
      .map((h) => h.item);
    if (unmasteredItems.length === 0) return;

    setItems(unmasteredItems);
    setCurrentIndex(0);
    setIsFlipped(false);
    resetReviews();
    setFlyDirection(null);
  }, [history, resetReviews]);

  const flipCard = useCallback(() => {
    if (!busy) setIsFlipped((prev) => !prev);
  }, [busy]);

  // Cử chỉ kéo-thả: kéo ngang → quyết định, chạm ngắn → lật
  const { dragOffset, isDragging, cardHandlers } = useCardGesture({
    disabled: busy || isFinished || loading,
    onTapFlip: () => setIsFlipped((prev) => !prev),
    onSwipeRight: () => handleCardDecision("know"),
    onSwipeLeft: () => handleCardDecision("dont_know"),
  });

  useDeckKeyboard({
    disabled: busy || isFinished || loading,
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
    resetReviews,
    handleCardDecision,
    handleUndo,
    handleReviewIncorrectOnly,
    flipCard,
    cardHandlers,
  };
}
