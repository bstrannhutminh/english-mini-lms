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

  const sourceRef = `${activity.title} · bài nộp ${submission.id} · bản ${submission.revision}${feedback?.id ? ` · góp ý ${feedback.id}` : ""}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
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
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-base text-red-800">
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
        <>
          {feedback.next_action && (
            <div className="mb-6 border-l-2 border-primary px-4 py-2 text-base leading-relaxed text-text">
              <h2 className="mb-1 font-semibold text-primary-dark">Việc cần làm ở bản tiếp theo</h2>
              {feedback.next_action}
            </div>
          )}
          <PriorityObservations
            feedback={feedback}
            sourceRef={sourceRef}
            flaggedIndexes={flaggedIndexes}
            onFlagged={markFlagged}
          />
        </>
      ) : null}

      {activeTab === "compare" && parent && <CompareView current={submission} currentFeedback={feedback} parent={parent} />}
      <div className={`grid grid-cols-1 items-start gap-6 ${activeTab === "compare" && parent ? "" : "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-8"}`}>
        {(activeTab !== "compare" || !parent) && (
          <div className="min-w-0">
            <SubmissionPanel submission={submission} activityMode={activity.mode} />
          </div>
        )}

        <div className="min-w-0">
          {feedback ? (
            <FeedbackPanel
              feedback={feedback}
              sourceRef={sourceRef}
              flaggedIndexes={flaggedIndexes}
              onFlagged={markFlagged}
            />
          ) : assessment?.status === "feedback_ready" ? null : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-surface px-5 py-8 text-center text-base text-text-muted">
              Chưa có nhận xét — bài nộp sẽ hiển thị góp ý chi tiết ngay khi AI
              chấm xong.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
