"use client";

import type { WritingFeedback } from "@/server/providers/gemini/types";
import type { CaptureHelpers, SessionParentData } from "../types";
import {
  RevisionFixList,
  RevisionReferenceCard,
  RevisionSection,
} from "../../shared/revision-reference-card";
import { parseReadingPayload } from "./state";

/**
 * Khung đối chiếu Bản 1 + các điểm cần sửa (luồng revision qua parentId).
 * Body bản cha là payload JSON {mainIdea, translation, keyTerms} — parse để
 * hiển thị bản dịch cũ; bôi đen mở được Smart Capture.
 */
export function ReadingParentReference({
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
  const parent = parseReadingPayload(parentData.submission.body);
  const parentText =
    parent.translation ||
    parent.mainIdea ||
    parentData.submission.body ||
    "";
  const { id, revision } = parentData.submission;

  return (
    <RevisionReferenceCard
      revision={revision}
      open={open}
      onToggle={onToggle}
      fullFeedbackHref={`/my-work/${id}`}
    >
      {feedback?.observations && feedback.observations.length > 0 && (
        <RevisionSection label="Điểm cần tập trung sửa từ bản trước">
          <RevisionFixList items={feedback.observations} />
        </RevisionSection>
      )}

      <RevisionSection label={`Bản dịch ở bản ${revision}`}>
        <div
          {...capture.selectHandlers(parentText, `${sourceRef} · bài nộp ${id} · bản ${revision}`, "text")}
          className="max-w-[65ch] whitespace-pre-wrap rounded-xl bg-surface-muted p-4 text-base leading-relaxed text-text-secondary"
        >
          {parentText}
        </div>
      </RevisionSection>
    </RevisionReferenceCard>
  );
}
