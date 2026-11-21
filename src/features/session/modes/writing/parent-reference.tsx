"use client";

import type { WritingFeedback } from "@/server/providers/gemini/types";
import type { SessionParentData } from "../types";
import type { CaptureHelpers } from "../types";
import {
  RevisionFixList,
  RevisionReferenceCard,
  RevisionSection,
} from "../../shared/revision-reference-card";

/**
 * Khung đối chiếu Bản 1 + các lỗi cần sửa (luồng revision qua parentId).
 * Góp ý ưu tiên đứng trước, bản gốc đứng sau; bôi đen trong bản gốc mở được
 * Smart Capture.
 */
export function WritingParentReference({
  parentData,
  open,
  onToggle,
  capture,
  sourceRef,
}: {
  parentData: SessionParentData;
  open: boolean;
  onToggle: () => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const feedback = parentData.feedback as WritingFeedback | null;
  const bodyText = parentData.submission.body ?? "";
  const { id, revision } = parentData.submission;

  return (
    <RevisionReferenceCard
      revision={revision}
      open={open}
      onToggle={onToggle}
      fullFeedbackHref={`/my-work/${id}`}
    >
      {feedback?.observations && feedback.observations.length > 0 && (
        <RevisionSection label={`Điểm cần tập trung sửa từ bản ${revision}`}>
          <RevisionFixList items={feedback.observations} />
        </RevisionSection>
      )}

      <RevisionSection label={`Bản ${revision} của bạn`}>
        <div
          {...capture.selectHandlers(bodyText, `${sourceRef} · bài nộp ${id} · bản ${revision}`, "text")}
          className="max-w-[65ch] whitespace-pre-wrap rounded-xl bg-surface-muted p-4 text-base leading-relaxed text-text-secondary"
        >
          {parentData.submission.body}
        </div>
      </RevisionSection>
    </RevisionReferenceCard>
  );
}
