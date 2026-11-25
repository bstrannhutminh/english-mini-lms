"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout";
import { EmptyState, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { DetailHeader } from "./detail-header";
import { PendingState } from "./pending-state";
import { FailedState } from "./failed-state";
import { SubmissionPanel } from "./submission-panel";
import { CompareView } from "./compare-view";
import { FeedbackPanel } from "./feedback-panel";
import { StickyRevisionBar } from "./sticky-revision-bar";
import { originalEvidenceLabel, revisionAction } from "./revision-action";
import { useRevisionSession } from "./use-revision-session";
import type {
  ActivityMeta,
  AssessmentInfo,
  MyWorkFeedback,
  LatestRevisionRef,
  ParentRevision,
  SubmissionDetail,
} from "../types";

export interface FeedbackDetailViewProps {
  submission: SubmissionDetail;
  activity: ActivityMeta;
  assessment: AssessmentInfo | null;
  feedback: MyWorkFeedback | null;
  parent: ParentRevision | null;
  /** Đã có bản sửa làm từ bài này → CTA chính là mở bản đó thay vì sửa lại. */
  latestRevision?: LatestRevisionRef | null;
}

/**
 * /my-work/[submissionId] — vòng Góp ý → Sửa lại (§3.5), đọc từ trên xuống:
 * thẻ tóm tắt (điểm ước tính luyện tập + việc tiếp theo + CTA) → trạng thái
 * chấm → điểm theo tiêu chí → N điểm cần sửa trước → điểm sáng → bài đã nộp
 * → so sánh với bản trước. Mobile: CTA "Sửa ngay" dính đáy trên thanh tab.
 */
export function FeedbackDetailView({ submission, activity, assessment, feedback, parent, latestRevision = null }: FeedbackDetailViewProps) {
  const [flaggedIndexes, setFlaggedIndexes] = useState<Record<number, boolean>>({});
  // Chưa có góp ý → mở sẵn bài đã nộp; có góp ý → thu gọn để góp ý đứng trước.
  const [submissionOpen, setSubmissionOpen] = useState(!feedback);
  const { startRevision, isCreating, error: revisionError } = useRevisionSession(activity.id, submission.id);

  const markFlagged = (idx: number) => setFlaggedIndexes((prev) => ({ ...prev, [idx]: true }));

  const isPending = assessment?.status === "queued" || assessment?.status === "processing";
  const isFailed = assessment?.status === "failed";
  // Thanh dính đáy chỉ xuất hiện khi đã có góp ý để sửa theo (1 hành động chính/màn).
  const showStickyBar = Boolean(feedback);
  const action = revisionAction(activity.mode, submission.revision);
  const sourceRef = `${activity.title} · bài nộp ${submission.id} · bản ${submission.revision}${feedback?.id ? ` · góp ý ${feedback.id}` : ""}`;

  return (
    <>
    <PageContainer className={cn("space-y-6", showStickyBar && "pb-28 sm:pb-28 lg:pb-10")}>
      <DetailHeader
        activity={activity}
        submission={submission}
        feedback={feedback}
        parentRevision={parent ? parent.submission.revision : null}
        latestRevision={latestRevision}
        onStartRevision={startRevision}
        isCreatingRevision={isCreating}
        stickyCtaOnMobile={showStickyBar}
        onShowSubmission={() => setSubmissionOpen(true)}
      />

      {revisionError ? (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
          <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
          <span>{revisionError} — vui lòng thử lại.</span>
        </p>
      ) : null}

      {/* Trạng thái chấm: chờ (poll tự động) hoặc lỗi (nút chấm lại) */}
      {assessment && isPending ? <PendingState status={assessment.status} assessmentId={assessment.id} /> : null}
      {assessment && isFailed ? (
        <FailedState assessmentId={assessment.id} resultRef={assessment.resultRef} />
      ) : null}

      {feedback ? (
        <FeedbackPanel
          feedback={feedback}
          sourceRef={sourceRef}
          flaggedIndexes={flaggedIndexes}
          onFlagged={markFlagged}
          originalLabel={originalEvidenceLabel(activity.mode)}
        />
      ) : !isPending && !isFailed && assessment?.status !== "feedback_ready" ? (
        <EmptyState
          icon="clock"
          title="Chưa có nhận xét cho bài này"
          description="Bài nộp đã được lưu. Góp ý chi tiết sẽ hiển thị tại đây ngay khi AI chấm xong."
          className="rounded-2xl border border-dashed border-border-strong"
        />
      ) : null}

      <details
        id="bai-da-nop"
        open={submissionOpen}
        onToggle={(event) => setSubmissionOpen(event.currentTarget.open)}
        className="group scroll-mt-20 rounded-2xl border border-border bg-surface lg:scroll-mt-6"
      >
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 text-lg font-semibold text-text sm:px-6 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon name="file-text" className="h-5 w-5 shrink-0 text-text-muted" />
            Bài đã nộp · Bản {submission.revision}
          </span>
          <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-border px-5 py-5 sm:px-6">
          <SubmissionPanel
            submission={submission}
            activityMode={activity.mode}
            aiTranscript={feedback?.transcript ?? null}
          />
        </div>
      </details>

      {parent ? <CompareView current={submission} currentFeedback={feedback} parent={parent} /> : null}

    </PageContainer>

      {/* Ngoài PageContainer: không bị ảnh hưởng bởi animation vào trang */}
      {showStickyBar ? (
        <StickyRevisionBar
          label={action.label}
          icon={action.icon}
          onStartRevision={startRevision}
          isCreating={isCreating}
          latestRevision={latestRevision}
        />
      ) : null}
    </>
  );
}
