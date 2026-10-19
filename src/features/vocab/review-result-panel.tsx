"use client";

import type { SubmitReviewResponse } from "@/contracts/vocabulary";
import { YouGlishButton } from "./youglish-button";

interface ReviewResultPanelProps {
  result: SubmitReviewResponse;
  phrase: string;
  isLast: boolean;
  onNext: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  correct: "✅ Dùng từ chính xác!",
  partial: "🟡 Tạm được — tiếp tục luyện",
  incorrect: "⚠️ Cần hoàn thiện thêm",
};

/** Panel nhận xét của Gemini sau khi nộp câu micro-challenge. */
export function ReviewResultPanel({
  result,
  phrase,
  isLast,
  onNext,
}: ReviewResultPanelProps) {
  const { evaluation } = result;
  const passed = evaluation.resultStatus === "correct";

  return (
    <div className="space-y-4 pt-2">
      <div
        className={`rounded-xl p-4 border text-xs sm:text-sm space-y-2 ${
          passed
            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
            : "bg-amber-50 border-amber-200 text-amber-950"
        }`}
      >
        <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider">
          <span>{STATUS_LABEL[evaluation.resultStatus ?? ""] ?? "Kết quả"}</span>
          <span className="text-[11px] font-normal normal-case">
            Lần ôn tới: sau <strong>{result.intervalDays} ngày</strong>
          </span>
        </div>

        <div className="border-t border-black/10 pt-2 space-y-1">
          <span className="font-semibold block text-xs">Nhận xét của AI:</span>
          <p className="text-xs leading-relaxed">{evaluation.aiAssessment}</p>
        </div>

        {evaluation.feedbackNotes && (
          <div className="bg-white/80 p-2.5 rounded-lg border border-black/10 text-xs">
            <span className="font-semibold text-slate-700 block mb-0.5">
              Phân tích collocation:
            </span>
            <p className="italic text-slate-800">{evaluation.feedbackNotes}</p>
          </div>
        )}

        {evaluation.exampleCorrection && (
          <div className="bg-white/80 p-2.5 rounded-lg border border-black/10 text-xs">
            <span className="font-semibold text-slate-700 block mb-0.5">
              Gợi ý diễn đạt tự nhiên hơn:
            </span>
            <p className="italic text-slate-800">
              &quot;{evaluation.exampleCorrection}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Nghe người bản xứ nói từ vừa ôn (YouGlish) — mở modal, không nhúng sẵn */}
      <YouGlishButton
        query={phrase}
        className="w-full inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
      />

      <button
        onClick={onNext}
        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2"
      >
        <span>{isLast ? "Xem tổng kết phiên ôn 🏁" : "Từ tiếp theo →"}</span>
      </button>
    </div>
  );
}
