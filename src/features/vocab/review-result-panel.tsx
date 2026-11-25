"use client";

import type { SubmitReviewResponse } from "@/contracts/vocabulary";
import { Button, Icon, type IconName } from "@/components/ui";
import { YouGlishButton } from "./youglish-button";

interface ReviewResultPanelProps {
  result: SubmitReviewResponse;
  phrase: string;
  isLast: boolean;
  onNext: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  correct: "Dùng từ chính xác!",
  partial: "Tạm được — tiếp tục luyện",
  incorrect: "Cần hoàn thiện thêm",
};

const STATUS_ICON: Record<string, IconName> = {
  correct: "check-circle",
  partial: "info",
  incorrect: "alert-triangle",
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
    <div className="space-y-4">
      <div
        className={`space-y-3 rounded-2xl border p-5 text-base shadow-card sm:p-6 ${
          passed
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : "border-amber-200 bg-amber-50 text-amber-950"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-2 text-lg font-semibold">
            <Icon name={STATUS_ICON[evaluation.resultStatus ?? ""] ?? "info"} className="h-5 w-5 shrink-0" />
            {STATUS_LABEL[evaluation.resultStatus ?? ""] ?? "Kết quả"}
          </span>
          <span className="text-base">
            Lần ôn tới: sau <strong>{result.intervalDays} ngày</strong>
          </span>
        </div>

        <div className="space-y-1 border-t border-black/10 pt-3">
          <span className="block text-base font-semibold">Nhận xét của AI:</span>
          <p className="break-words text-base leading-relaxed">{evaluation.aiAssessment}</p>
        </div>

        {evaluation.feedbackNotes && (
          <div className="rounded-xl border border-black/10 bg-white/80 p-3 text-base">
            <span className="mb-0.5 block font-semibold text-text-secondary">
              Phân tích collocation:
            </span>
            <p className="break-words leading-relaxed text-text">{evaluation.feedbackNotes}</p>
          </div>
        )}

        {evaluation.exampleCorrection && (
          <div className="rounded-xl border border-black/10 bg-white/80 p-3 text-base">
            <span className="mb-0.5 block font-semibold text-text-secondary">
              Gợi ý diễn đạt tự nhiên hơn:
            </span>
            <p className="break-words leading-relaxed text-text">
              &quot;{evaluation.exampleCorrection}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Nghe người bản xứ nói từ vừa ôn (YouGlish) — mở modal, không nhúng sẵn */}
      <YouGlishButton
        query={phrase}
        className="pressable inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-4 text-base font-medium text-text-secondary hover:bg-surface-subtle hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
      />

      <Button size="lg" fullWidth onClick={onNext} className="min-h-13 font-semibold">
        {isLast ? "Xem tổng kết phiên ôn" : "Từ tiếp theo"}<Icon name={isLast ? "flag" : "arrow-right"} className="h-4 w-4" />
      </Button>
    </div>
  );
}
