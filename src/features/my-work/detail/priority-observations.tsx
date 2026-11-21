"use client";

import { ObservationCard } from "./observation-card";
import { topPriorityObservations } from "../revision-chain";
import type { MyWorkFeedback } from "../types";

/** Số góp ý ưu tiên hiển thị đầu trang (AI đã xếp observations theo ưu tiên). */
export const TOP_PRIORITY_COUNT = 3;

interface PriorityObservationsProps {
  feedback: MyWorkFeedback;
  /** Nguồn cho nút "Lưu cụm từ". */
  sourceRef?: string;
  flaggedIndexes: Record<number, boolean>;
  onFlagged: (index: number) => void;
  originalLabel?: string;
}

/**
 * "N điểm cần sửa trước" (§3.5) — Top-3 góp ý ưu tiên, đánh số để người học
 * sửa lần lượt trước khi đọc phần còn lại của feedback.
 */
export function PriorityObservations({
  feedback,
  sourceRef,
  flaggedIndexes,
  onFlagged,
  originalLabel,
}: PriorityObservationsProps) {
  const top = topPriorityObservations(feedback.observations, TOP_PRIORITY_COUNT);
  if (top.length === 0) return null;

  return (
    <section aria-labelledby="priority-observations-title">
      <h2 id="priority-observations-title" className="text-xl font-semibold tracking-tight text-text">
        {top.length} điểm cần sửa trước
      </h2>
      <p className="mt-1 text-base text-text-secondary">
        Đi lần lượt từng điểm, rồi thử viết lại bằng lời của bạn.
      </p>

      <div className="stagger mt-4 space-y-4">
        {top.map((obs, i) => (
          <ObservationCard
            key={i}
            obs={obs}
            index={i}
            feedbackId={feedback.id}
            sourceRef={sourceRef}
            locallyFlagged={Boolean(flaggedIndexes[i])}
            onFlagged={onFlagged}
            originalLabel={originalLabel}
          />
        ))}
      </div>
    </section>
  );
}
