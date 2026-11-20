"use client";

import { Icon } from "@/components/ui";
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
}

/**
 * Top-3 góp ý ưu tiên đứng ĐẦU trang chi tiết (§3.5) + CTA "Sửa ngay" —
 * người học thấy ngay việc cần làm trước khi đọc toàn bộ feedback.
 */
export function PriorityObservations({
  feedback,
  sourceRef,
  flaggedIndexes,
  onFlagged,
}: PriorityObservationsProps) {
  const top = topPriorityObservations(feedback.observations, TOP_PRIORITY_COUNT);
  if (top.length === 0) return null;

  return (
    <section
      aria-label="Các điểm cần sửa ưu tiên"
      className="mb-8"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-base font-bold text-teal-900">
            <Icon name="alert-triangle" className="h-4 w-4" />
            {top.length} điểm cần sửa trước
          </h2>
          <p className="mt-0.5 text-base text-teal-800">
            Tập trung từng điểm, rồi thử lại bằng lời của bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {top.map((obs, i) => (
          <ObservationCard
            key={i}
            obs={obs}
            index={i}
            feedbackId={feedback.id}
            sourceRef={sourceRef}
            locallyFlagged={Boolean(flaggedIndexes[i])}
            onFlagged={onFlagged}
            compact
          />
        ))}
      </div>
    </section>
  );
}
