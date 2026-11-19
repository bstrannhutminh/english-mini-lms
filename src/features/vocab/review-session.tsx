"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EmptyState, useToast } from "@/components/ui";
import type { ReviewVocabItem, SubmitReviewResponse } from "@/contracts/vocabulary";
import type { ReviewOutcome } from "@/server/vocabulary/schedule";
import { fetchReviewItems, submitWrittenReview } from "./api";
import { ReviewCard, type ResponseMode } from "./review-card";
import { ReviewResultPanel } from "./review-result-panel";
import { ReviewSummary, type CompletedReview } from "./review-summary";

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

  const handleSubmitReview = async () => {
    if (!currentItem || !userText.trim()) return;

    setSubmitting(true);
    try {
      const json = await submitWrittenReview({
        vocab_id: currentItem.id,
        scenario: currentItem.challengePrompt ?? currentItem.phrase,
        user_response: userText.trim(),
        modality: responseMode === "voice" ? "audio" : "text",
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
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-sm text-slate-500 font-medium">
          Đang kiểm tra từ vựng đến hạn ôn tập...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <EmptyState
          icon="alert-triangle"
          title="Không tải được từ đến hạn ôn"
          description={loadError}
          action={
            <button
              onClick={handleRetry}
              className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              Thử lại 🔄
            </button>
          }
        />
      </div>
    );
  }

  // Không có từ nào đến hạn
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✨
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Tuyệt vời! Bạn không còn từ nào đến hạn ôn hôm nay
            </h2>
            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
              Các từ vựng trong Sổ từ đã được xếp lịch Spaced Repetition
              (1 → 3 → 7 → 14 → 30 ngày). Hãy quay lại vào ngày mai hoặc thêm
              từ mới từ bài đọc y khoa.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/today"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              Về trang Hôm nay
            </Link>
            <Link
              href="/vocab"
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-xs transition"
            >
              Mở Sổ từ vựng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Đã hoàn thành tất cả từ trong phiên ôn
  if (currentIndex >= items.length) {
    return <ReviewSummary completed={completedList} total={items.length} />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Header thanh tiến trình */}
      <div className="flex items-center justify-between">
        <Link
          href="/today"
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
        >
          ← Quay lại Hôm nay
        </Link>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          Từ {currentIndex + 1} / {items.length}
        </span>
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
    </div>
  );
}
