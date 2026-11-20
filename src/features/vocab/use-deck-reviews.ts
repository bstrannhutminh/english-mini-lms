"use client";

import { useCallback, useEffect, useState } from "react";
import { submitQuickReviews, type FlashcardDeckItem } from "./api";
import { clearDeckSnapshot } from "./deck-review-storage";

export type CardResult = "know" | "dont_know";
export type SaveStatus = "idle" | "saving" | "saved" | "failed";
export interface ReviewAction { vocab_id: string; result: CardResult; clientReviewId: string; }
export interface HistoryItem { item: FlashcardDeckItem; result: CardResult; }

export function useDeckReviews() {
  const [batch, setBatch] = useState<ReviewAction[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (batch.length === 0 || saveStatus === "saved") return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [batch.length, saveStatus]);

  const submitBatchReviews = useCallback(async (reviews: ReviewAction[]): Promise<boolean> => {
    setSaving(true);
    setSaveStatus("saving");
    try {
      if (reviews.length > 0) await submitQuickReviews(reviews);
      clearDeckSnapshot();
      setSaveStatus("saved");
      setIsFinished(true);
      return true;
    } catch {
      setSaveStatus("failed");
      return false;
    } finally { setSaving(false); }
  }, []);

  const resetReviews = useCallback(() => {
    clearDeckSnapshot();
    setBatch([]); setHistory([]); setIsFinished(false); setSaveStatus("idle");
  }, []);

  return { batch, setBatch, history, setHistory, saving, saveStatus, setSaveStatus,
    isFinished, setIsFinished, submitBatchReviews, resetReviews };
}
