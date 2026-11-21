"use client";

import type { SessionParentData } from "../types";
import {
  RevisionFixList,
  RevisionReferenceCard,
  RevisionSection,
} from "../../shared/revision-reference-card";

/**
 * Shape thật của feedback mà getSubmissionWithFeedback ghép lại
 * (assessment.service.ts): observations/strengths/next_action/limitations/
 * scores + pronunciation từ rubricSnapshot. Thu hẹp tối thiểu cho phần
 * đối chiếu — không import kiểu server vào client runtime.
 */
interface SpeakingParentFeedback {
  observations?: Array<{ suggestion: string }> | null;
  pronunciation?: { status?: string; notes: string } | null;
}

/**
 * Khung so sánh Bản nói trước (luồng revision): các điểm cần cải thiện, nhận
 * xét phát âm, audio cũ (signed URL ngắn hạn) và ghi chú/transcript bản trước.
 */
export function SpeakingParentReference({
  parentData,
  open,
  onToggle,
}: {
  parentData: SessionParentData;
  open: boolean;
  onToggle: () => void;
}) {
  const feedback = parentData.feedback as SpeakingParentFeedback | null;
  const { id, revision, audioUrl, body } = parentData.submission;

  return (
    <RevisionReferenceCard
      revision={revision}
      open={open}
      onToggle={onToggle}
      fullFeedbackHref={`/my-work/${id}`}
    >
      {feedback?.observations && feedback.observations.length > 0 && (
        <RevisionSection label="Điểm cần cải thiện lần này">
          <RevisionFixList items={feedback.observations} />
        </RevisionSection>
      )}

      {feedback?.pronunciation?.notes && (
        <RevisionSection label="Nhận xét phát âm trước đó">
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base leading-relaxed text-emerald-900">
            {feedback.pronunciation.notes}
          </p>
        </RevisionSection>
      )}

      {audioUrl && (
        <RevisionSection label="Bản ghi âm trước đó">
          <audio controls preload="none" src={audioUrl} className="h-11 w-full" />
        </RevisionSection>
      )}

      {body && (
        <RevisionSection label="Nội dung bản trước">
          <p className="max-w-[65ch] whitespace-pre-wrap rounded-xl bg-surface-muted p-4 text-base leading-relaxed text-text-secondary">
            {body}
          </p>
        </RevisionSection>
      )}
    </RevisionReferenceCard>
  );
}
