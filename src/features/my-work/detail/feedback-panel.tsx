"use client";

import { Badge, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ObservationCard } from "./observation-card";
import { PracticeScoresCard } from "./practice-scores-card";
import { PriorityObservations, TOP_PRIORITY_COUNT } from "./priority-observations";
import type { MyWorkFeedback } from "../types";

interface FeedbackPanelProps {
  feedback: MyWorkFeedback;
  /** Nguồn gắn cho nút "Lưu cụm từ" (tiêu đề bài học). */
  sourceRef?: string;
  /** Index observation đã gắn cờ cục bộ. */
  flaggedIndexes: Record<number, boolean>;
  onFlagged: (index: number) => void;
  /** Nhãn khối bản gốc theo kỹ năng ("Câu bạn đã viết/nói/dịch"). */
  originalLabel?: string;
}

/**
 * Toàn bộ nhận xét AI theo thứ tự đọc: (cờ rà soát) → phát âm → điểm ước tính
 * luyện tập + giới hạn → N điểm cần sửa trước → góp ý còn lại → điểm sáng.
 */
export function FeedbackPanel({ feedback, sourceRef, flaggedIndexes, onFlagged, originalLabel }: FeedbackPanelProps) {
  const restObservations = feedback.observations.slice(TOP_PRIORITY_COUNT);
  const pronunciation = feedback.pronunciation;
  const assessed = pronunciation?.status === "assessed";

  return (
    <div className="space-y-6">
      {feedback.reviewState === "under_review" ? (
        <p className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base leading-relaxed text-amber-900">
          <Icon name="flag" className="mt-1 h-4 w-4 shrink-0" />
          <span>Nhận xét của bài này đã được gắn cờ và đang chờ quản trị viên rà soát lại.</span>
        </p>
      ) : null}

      {pronunciation ? (
        <section
          aria-labelledby="pronunciation-title"
          className={cn("rounded-2xl border p-5 sm:p-6", assessed ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60")}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="pronunciation-title" className="flex items-center gap-2 text-lg font-semibold text-text">
              <Icon name="mic" className="h-5 w-5 text-skill-speaking" />
              Đánh giá phát âm
            </h2>
            <Badge tone={assessed ? "success" : "warning"}>
              {assessed ? "Đã phân tích âm thanh" : "Không thể đánh giá âm thanh"}
            </Badge>
          </div>
          <p className="mt-2 text-base leading-relaxed text-text-secondary">{pronunciation.notes}</p>
        </section>
      ) : null}

      <PracticeScoresCard scores={feedback.scores} limitations={feedback.limitations} />

      <PriorityObservations
        feedback={feedback}
        sourceRef={sourceRef}
        flaggedIndexes={flaggedIndexes}
        onFlagged={onFlagged}
        originalLabel={originalLabel}
      />

      {restObservations.length > 0 ? (
        <section aria-labelledby="rest-observations-title">
          <h2 id="rest-observations-title" className="text-lg font-semibold text-text">
            Các góp ý còn lại ({restObservations.length})
          </h2>
          <div className="mt-3 space-y-4">
            {restObservations.map((obs, i) => {
              const realIndex = i + TOP_PRIORITY_COUNT;
              return (
                <ObservationCard
                  key={realIndex}
                  obs={obs}
                  index={realIndex}
                  feedbackId={feedback.id}
                  sourceRef={sourceRef}
                  locallyFlagged={Boolean(flaggedIndexes[realIndex])}
                  onFlagged={onFlagged}
                  originalLabel={originalLabel}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {feedback.strengths.length > 0 ? (
        <section aria-labelledby="strengths-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 id="strengths-title" className="flex items-center gap-2 text-lg font-semibold text-text">
            <Icon name="sparkles" className="h-5 w-5 text-emerald-700" />
            Điểm sáng đã làm tốt
          </h2>
          <ul className="mt-3 space-y-2.5">
            {feedback.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2.5 text-base leading-relaxed text-text-secondary">
                <Icon name="check-circle" className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="min-w-0 break-words">{strength}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
