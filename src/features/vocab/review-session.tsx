"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, EmptyState, Icon, Skeleton, useToast } from "@/components/ui";
import { PageContainer } from "@/components/layout";
import type { ReviewVocabItem, SubmitReviewResponse } from "@/contracts/vocabulary";
import type { ReviewOutcome } from "@/server/vocabulary/schedule";
import { fetchReviewItems, submitWrittenReview } from "./api";
import { ReviewCard, type ResponseMode } from "./review-card";
import { ReviewResultPanel } from "./review-result-panel";
import { ReviewSummary, type CompletedReview } from "./review-summary";
import { ReviewNothingDue } from "./review-nothing-due";

/**
 * ReviewSession — ôn viết câu (micro-challenge, Gemini chấm).
 * Tải tối đa 5 từ đến hạn, nộp từng câu, hiển thị nhận xét AI rồi tổng kết.
 * Lỗi mạng/server → toast tiếng Việt (không còn alert()).
 */
export function ReviewSession() {
  const toast = useToast();
  const [items, setItems] = useState<ReviewVocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responseMode, setResponseMode] = useState<ResponseMode>("text");
  const [userText, setUserText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewResult, setReviewResult] = useState<SubmitReviewResponse | null>(null);
  const [completedList, setCompletedList] = useState<CompletedReview[]>([]);

  useEffect(() => {
    let active = true;
    fetchReviewItems(5)
      .then((json) => {
        if (active) setItems(json.items || []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Lỗi tải từ vựng đến hạn:", err);
        setLoadError(
          err instanceof Error ? err.message : "Không tải được từ đến hạn."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  // setState trong event handler (không phải effect body) — quy tắc react-hooks.
  const handleRetry = () => {
    setLoading(true);
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  const currentItem = items[currentIndex];

  // clientReviewId ổn định theo (thứ tự, từ) trong phiên: retry/double-click
  // cùng một lần trả lời dùng lại đúng id đó → server idempotent, không
  // advance mastery hai lần. Sang từ mới là lần trả lời mới → id mới.
  const attemptIdsRef = useRef(new Map<string, string>());
  const attemptIdFor = (key: string) => {
    let id = attemptIdsRef.current.get(key);
    if (!id) {
      id = crypto.randomUUID();
      attemptIdsRef.current.set(key, id);
    }
    return id;
  };

  const handleSubmitReview = async () => {
    if (!currentItem || !userText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const json = await submitWrittenReview({
        vocab_id: currentItem.id,
        scenario: currentItem.challengePrompt ?? currentItem.phrase,
        user_response: userText.trim(),
        modality: "text",
        clientReviewId: attemptIdFor(`${currentIndex}:${currentItem.id}`),
      });
      setReviewResult(json);
      setCompletedList((prev) => [
        ...prev,
        {
          phrase: currentItem.phrase,
          status: (json.evaluation.resultStatus ?? "incorrect") as ReviewOutcome,
          intervalDays: json.intervalDays,
        },
      ]);
    } catch (err) {
      console.error("Lỗi gửi bài ôn:", err);
      toast.error(
        "Không gửi được bài ôn",
        err instanceof Error ? err.message : "Lỗi kết nối máy chủ."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextWord = () => {
    setReviewResult(null);
    setUserText("");
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <PageContainer size="narrow" className="space-y-4">
        <p role="status" className="sr-only">Đang kiểm tra từ vựng đến hạn ôn tập...</p>
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer size="narrow">
        <EmptyState
          icon="alert-triangle"
          title="Không tải được từ đến hạn ôn"
          description={loadError}
          className="rounded-2xl border border-border bg-surface"
          action={<Button onClick={handleRetry}><Icon name="refresh" className="h-4 w-4" />Thử lại</Button>}
        />
      </PageContainer>
    );
  }

  // Không có từ nào đến hạn
  if (items.length === 0) {
    return <ReviewNothingDue />;
  }

  // Đã hoàn thành tất cả từ trong phiên ôn
  if (currentIndex >= items.length) {
    return <ReviewSummary completed={completedList} total={items.length} />;
  }

  return (
    <PageContainer size="narrow" className="space-y-4">
      {/* Header thanh tiến trình */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/today"
            className="pressable -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-base font-medium text-text-secondary no-underline hover:text-primary-dark"
          >
            <Icon name="arrow-left" className="h-4 w-4" />Quay lại Hôm nay
          </Link>
          <span className="text-sm font-medium tabular-nums text-text-secondary">
            Từ {currentIndex + 1} / {items.length}
          </span>
        </div>
        <progress aria-label="Tiến trình ôn từ" value={currentIndex + (reviewResult ? 1 : 0)} max={items.length} className="studio-progress h-2 rounded-full" />
      </div>

      {reviewResult ? (
        <ReviewResultPanel
          result={reviewResult}
          phrase={currentItem.phrase}
          isLast={currentIndex + 1 >= items.length}
          onNext={handleNextWord}
        />
      ) : (
        <ReviewCard
          item={currentItem}
          responseMode={responseMode}
          userText={userText}
          submitting={submitting}
          onModeChange={setResponseMode}
          onTextChange={setUserText}
          onSubmit={handleSubmitReview}
        />
      )}
    </PageContainer>
  );
}
