"use client";

import { Badge, Card, Icon } from "@/components/ui";
import { ObservationCard } from "./observation-card";
import { TOP_PRIORITY_COUNT } from "./priority-observations";
import type { MyWorkFeedback } from "../types";

interface FeedbackPanelProps {
  feedback: MyWorkFeedback;
  /** Nguồn gắn cho nút "Lưu cụm từ" (tiêu đề bài học). */
  sourceRef?: string;
  /** Index observation đã gắn cờ cục bộ (state hoist từ view để Top-3 chia sẻ). */
  flaggedIndexes: Record<number, boolean>;
  onFlagged: (index: number) => void;
}

/**
 * Cột nhận xét AI (bên phải desktop): phát âm → điểm luyện tập → điểm sáng →
 * các góp ý CÒN LẠI (Top-3 đã nằm ở khu vực ưu tiên phía trên) → hành động
 * kế tiếp → giới hạn đánh giá.
 */
export function FeedbackPanel({
  feedback,
  sourceRef,
  flaggedIndexes,
  onFlagged,
}: FeedbackPanelProps) {
  const restObservations = feedback.observations.slice(TOP_PRIORITY_COUNT);
  const isUnderReview = feedback.reviewState === "under_review";

  return (
    <div>
      {isUnderReview ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Icon name="flag" className="h-4 w-4 shrink-0" />
          <span>
            Bài nộp này có nhận xét đang được gắn cờ{" "}
            <strong>Under Review</strong> để quản trị viên rà soát lại.
          </span>
        </div>
      ) : null}

      {feedback.pronunciation ? (
        <Card
          className={`mb-4 ${
            feedback.pronunciation.status === "assessed"
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p
              className={`text-sm font-bold ${
                feedback.pronunciation.status === "assessed"
                  ? "text-emerald-900"
                  : "text-red-900"
              }`}
            >
              Đánh giá phát âm
            </p>
            <Badge tone={feedback.pronunciation.status === "assessed" ? "success" : "error"}>
              {feedback.pronunciation.status === "assessed"
                ? "Đã phân tích âm thanh"
                : "Không thể đánh giá âm thanh"}
            </Badge>
          </div>
          <p
            className={`text-sm leading-relaxed ${
              feedback.pronunciation.status === "assessed"
                ? "text-emerald-800"
                : "text-red-800"
            }`}
          >
            {feedback.pronunciation.notes}
          </p>
        </Card>
      ) : null}

      {feedback.scores.length > 0 ? (
        <Card className="mb-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-secondary">
            Điểm ước tính luyện tập
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
            {feedback.scores.map((sc, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface-muted p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text">{sc.dimension}</span>
                  <span
                    className={`text-lg font-extrabold ${
                      sc.value >= 7 ? "text-emerald-600" : "text-blue-600"
                    }`}
                  >
                    {sc.value}/10
                  </span>
                </div>
                {sc.note ? (
                  <p className="mt-1 text-xs text-text-muted">{sc.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {feedback.strengths.length > 0 ? (
        <Card className="mb-4 border-emerald-200 bg-emerald-50">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-emerald-900">
            <Icon name="sparkles" className="h-4 w-4" />
            Điểm sáng đã làm tốt
          </p>
          <ul className="m-0 list-disc pl-5 text-sm leading-relaxed text-emerald-800">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="mb-1">
                {s}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {restObservations.length > 0 ? (
        <div className="mb-4">
          <h2 className="mb-3 text-base font-bold text-text">
            Các góp ý còn lại ({restObservations.length})
          </h2>
          <div className="flex flex-col gap-3">
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
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {feedback.next_action ? (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <p className="mb-1 text-sm font-bold text-blue-900">
            Hành động trọng tâm cho bản sửa
          </p>
          <p className="m-0 text-sm leading-relaxed text-blue-800">
            {feedback.next_action}
          </p>
        </Card>
      ) : null}

      {feedback.limitations ? (
        <div className="rounded-lg border border-border bg-surface-muted px-3.5 py-3 text-xs leading-relaxed text-text-muted">
          <strong>Lưu ý:</strong> {feedback.limitations}
        </div>
      ) : null}
    </div>
  );
}
