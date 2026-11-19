"use client";

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
      {/* Thẻ tổng kết điểm */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-lg font-extrabold text-slate-900">
            Kết quả nghe hiểu
          </div>
          <div className="mt-0.5 text-sm text-slate-600">
            {assisted
              ? "Đã hoàn thành (có xem gợi ý/transcript)"
              : "Đã hoàn thành tự lực 100%"}
          </div>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-lg font-extrabold text-green-700">
          {correctCount}/{review.length} đúng
        </div>
      </div>

      {/* Chi tiết từng câu */}
      {review.map((q, idx) => {
        const seekTarget = q.timestamp ?? fallbackTimestamp;
        return (
          <div
            key={q.id}
            className={`rounded-2xl border bg-white p-4 ${
              q.isCorrect ? "border-green-300" : "border-red-300"
            }`}
          >
            <div className="mb-2 text-[15px] font-bold text-slate-900">
              {q.isCorrect ? "✅" : "❌"} Câu {idx + 1}: {q.prompt}
            </div>

            <div className="mb-2 text-sm">
              <div>
                Lựa chọn của bạn:{" "}
                <strong
                  className={q.isCorrect ? "text-green-700" : "text-red-600"}
                >
                  {q.userOption ? q.userOption.toUpperCase() : "Chưa trả lời"}
                </strong>
              </div>
              {!q.isCorrect && (
                <div className="mt-0.5 text-green-700">
                  Đáp án đúng:{" "}
                  <strong>
                    {q.correctOption ? q.correctOption.toUpperCase() : "—"}
                  </strong>
                </div>
              )}
            </div>

            {/* Giải thích & nút nghe lại mốc giây gây nhầm */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-700">
              <div className="mb-1 font-bold text-slate-600">
                💡 Phân tích & đoạn gây nhầm:
              </div>
              <div>{q.explanation}</div>
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => onSeek(seekTarget)}
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-md bg-indigo-100 px-2 text-xs font-bold text-indigo-800 hover:bg-indigo-200"
                >
                  ⏱️ Nghe lại đoạn mốc {seekTarget}s trên video
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
