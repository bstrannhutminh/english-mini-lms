"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ListeningReviewItem } from "@/lib/listening-answer-checking";

/**
 * Xem lại đáp án & giải thích sau khi nộp (observation chỉ tồn tại cho câu sai
 * — `buildListeningReview` ở lib quyết định đúng/sai và trích đáp án đúng).
 */
export function ListeningReview({
  assisted,
  review,
  fallbackTimestamp,
  onSeek,
}: {
  assisted: boolean;
  review: ListeningReviewItem[];
  /** startSeconds của đoạn — dùng khi câu sai không có mốc giây riêng. */
  fallbackTimestamp: number;
  onSeek: (seconds: number) => void;
}) {
  const correctCount = review.filter((q) => q.isCorrect).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Thẻ tổng kết */}
      <section className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
        <div className="min-w-0">
          <p className="eyebrow">Kết quả</p>
          <h2 className="text-lg font-semibold text-text">Kết quả nghe hiểu</h2>
          <p className="mt-0.5 text-sm leading-5 text-text-secondary">
            {assisted
              ? "Đã hoàn thành (có xem gợi ý/transcript)"
              : "Đã hoàn thành tự làm độc lập"}
          </p>
        </div>
        <p className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-lg font-semibold tabular-nums text-emerald-800">
          {correctCount}/{review.length} đúng
        </p>
      </section>

      {/* Chi tiết từng câu */}
      {review.map((q, idx) => {
        const seekTarget = q.timestamp ?? fallbackTimestamp;
        return (
          <article
            key={q.id}
            className={cn(
              "rounded-2xl border bg-surface p-4 sm:p-5",
              q.isCorrect ? "border-emerald-200" : "border-red-200"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  q.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}
              >
                <Icon name={q.isCorrect ? "check" : "x"} className="h-4 w-4" />
                <span className="sr-only">{q.isCorrect ? "Đúng" : "Sai"}</span>
              </span>
              <div className="min-w-0">
                <p className="eyebrow">Câu {idx + 1}</p>
                <h3 className="break-words text-base font-semibold leading-relaxed text-text">{q.prompt}</h3>
              </div>
            </div>

            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-base">
              <div className="flex gap-2">
                <dt className="text-text-secondary">Lựa chọn của bạn:</dt>
                <dd className={cn("font-semibold", q.isCorrect ? "text-emerald-700" : "text-red-700")}>
                  {q.userOption ? q.userOption.toUpperCase() : "Chưa trả lời"}
                </dd>
              </div>
              {!q.isCorrect && (
                <div className="flex gap-2">
                  <dt className="text-text-secondary">Đáp án đúng:</dt>
                  <dd className="font-semibold text-emerald-700">
                    {q.correctOption ? q.correctOption.toUpperCase() : "—"}
                  </dd>
                </div>
              )}
            </dl>

            {/* Giải thích & nút nghe lại mốc giây gây nhầm */}
            <div className="mt-3 break-words rounded-xl bg-surface-muted p-4 text-base leading-relaxed text-text-secondary">
              <p className="eyebrow mb-1">Phân tích &amp; đoạn gây nhầm</p>
              <p className="text-text">{q.explanation}</p>
              <button
                type="button"
                onClick={() => onSeek(seekTarget)}
                className="pressable mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 text-base font-medium text-primary-dark hover:bg-primary-soft"
              >
                <Icon name="clock" className="h-4 w-4" />
                Nghe lại từ mốc {seekTarget}s
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
