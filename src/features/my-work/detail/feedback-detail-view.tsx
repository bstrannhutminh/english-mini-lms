"use client";

import { useState } from "react";
import { DetailHeader } from "./detail-header";
import { PendingState } from "./pending-state";
import { FailedState } from "./failed-state";
import { PriorityObservations } from "./priority-observations";
import { SubmissionPanel } from "./submission-panel";
import { CompareView } from "./compare-view";
import { FeedbackPanel } from "./feedback-panel";
import { useRevisionSession } from "./use-revision-session";
import type {
  ActivityMeta,
  AssessmentInfo,
  MyWorkFeedback,
  ParentRevision,
  SubmissionDetail,
} from "../types";

export interface FeedbackDetailViewProps {
  submission: SubmissionDetail;
  activity: ActivityMeta;
  assessment: AssessmentInfo | null;
  feedback: MyWorkFeedback | null;
  parent: ParentRevision | null;
}

/**
 * /my-work/[submissionId] — vòng Góp ý → Sửa lại (§3.5):
 * Top-3 ưu tiên đứng đầu → CTA "Sửa ngay" (phiên mới + parentId) →
 * tab So sánh Bản 1/2 → trạng thái chờ chấm tự cập nhật → flag + lưu cụm từ.
 */
export function FeedbackDetailView({
  submission,
  activity,
  assessment,
  feedback,
  parent,
}: FeedbackDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"current" | "compare">("current");
  const [flaggedIndexes, setFlaggedIndexes] = useState<Record<number, boolean>>({});
  const { startRevision, isCreating, error: revisionError } =
    useRevisionSession(activity.id, submission.id);

  const markFlagged = (idx: number) =>
    setFlaggedIndexes((prev) => ({ ...prev, [idx]: true }));

  const sourceRef = `my-work: ${activity.title}`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-4 lg:max-w-6xl">
      <DetailHeader
        activity={activity}
        submission={submission}
        hasParent={Boolean(parent)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStartRevision={startRevision}
        isCreatingRevision={isCreating}
      />

      {revisionError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {revisionError} — vui lòng thử lại.
        </p>
      ) : null}

      {/* Trạng thái chấm: chờ (poll tự động) hoặc lỗi (nút chấm lại) */}
      {assessment && (assessment.status === "queued" || assessment.status === "processing") ? (
        <PendingState status={assessment.status} />
      ) : null}
      {assessment?.status === "failed" ? (
        <FailedState assessmentId={assessment.id} resultRef={assessment.resultRef} />
      ) : null}

      {/* Top-3 góp ý ưu tiên — học trước: thấy ngay việc cần sửa */}
      {feedback ? (
        <PriorityObservations
          feedback={feedback}
          sourceRef={sourceRef}
          flaggedIndexes={flaggedIndexes}
          onFlagged={markFlagged}
          onStartRevision={startRevision}
          isCreatingRevision={isCreating}
          revisionLabel={`Bản ${submission.revision + 1}`}
        />
      ) : null}

      <div className="grid grid-cols-1 items-start gap-x-6 lg:grid-cols-2">
        <div className="min-w-0">
          {activeTab === "compare" && parent ? (
            <CompareView
              current={submission}
              currentFeedback={feedback}
              parent={parent}
            />
          ) : (
            <SubmissionPanel submission={submission} activityMode={activity.mode} />
          )}
        </div>

        <div className="min-w-0">
          {feedback ? (
            <FeedbackPanel
              feedback={feedback}
              sourceRef={sourceRef}
              flaggedIndexes={flaggedIndexes}
              onFlagged={markFlagged}
            />
          ) : assessment?.status === "feedback_ready" ? null : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-surface px-5 py-8 text-center text-sm text-text-muted">
              Chưa có nhận xét — bài nộp sẽ hiển thị góp ý chi tiết ngay khi AI
              chấm xong.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
