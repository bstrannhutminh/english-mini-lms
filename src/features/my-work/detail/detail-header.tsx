"use client";

import Link from "next/link";
import { Badge, Button, Icon, ProgressRing, SkillTile } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import { cn } from "@/lib/utils";
import { formatSubmittedAt } from "@/lib/format-submitted-at";
import { formatScore, summarizePracticeEstimate } from "./practice-estimate";
import { revisionAction } from "./revision-action";
import type { ActivityMeta, LatestRevisionRef, MyWorkFeedback, SubmissionDetail } from "../types";

interface DetailHeaderProps {
  activity: ActivityMeta;
  submission: SubmissionDetail;
  feedback: MyWorkFeedback | null;
  /** Bản trước (nếu là bản sửa) — hiện link nhảy xuống phần so sánh. */
  parentRevision: number | null;
  /** Bản sửa đã có của bài này → nút chính mở bản đó, sửa lại thành lựa chọn phụ. */
  latestRevision?: LatestRevisionRef | null;
  onStartRevision: () => void;
  isCreatingRevision: boolean;
  /** true → mobile dùng thanh dính đáy, nút trong thẻ chỉ hiện từ lg. */
  stickyCtaOnMobile: boolean;
  /** Mở phần "Bài đã nộp" trước khi nhảy tới neo. */
  onShowSubmission: () => void;
}

const SECONDARY_LINK =
  "pressable inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-base font-medium text-primary-dark hover:bg-primary-soft";

/**
 * Đầu trang chi tiết: điều hướng + THẺ TÓM TẮT (làm thế nào / làm gì tiếp):
 * kỹ năng, tiêu đề, bản nộp, vòng điểm ước tính luyện tập, việc tiếp theo, CTA.
 */
export function DetailHeader({
  activity,
  submission,
  feedback,
  parentRevision,
  latestRevision = null,
  onStartRevision,
  isCreatingRevision,
  stickyCtaOnMobile,
  onShowSubmission,
}: DetailHeaderProps) {
  const meta = modeMeta(activity.mode);
  const action = revisionAction(activity.mode, submission.revision);
  const estimate = summarizePracticeEstimate(feedback?.scores);

  return (
    <div className="space-y-2">
      <nav aria-label="Điều hướng" className="flex items-center justify-between gap-3">
        <Link href="/my-work" className="inline-flex min-h-11 items-center gap-1.5 text-base text-text-secondary hover:text-text">
          <Icon name="arrow-left" className="h-4 w-4" />
          Bài của tôi
        </Link>
        <Link href="/today" className="inline-flex min-h-11 items-center gap-1.5 text-base text-text-secondary hover:text-primary-dark">
          Bài tiếp theo
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </nav>

      <header className={cn("hero-wash rounded-2xl border border-border p-5 shadow-card sm:p-7", `hero-wash-${meta.skill}`)}>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8">
          <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
            <SkillTile mode={activity.mode} size="lg" className="hidden sm:inline-flex" />
            <SkillTile mode={activity.mode} size="md" className="sm:hidden" />
            <div className="min-w-0 flex-1">
              <p className="eyebrow">
                {meta.label}
                {meta.isIelts ? " · IELTS luyện tập" : ""}
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl">
                {activity.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <Badge tone={meta.tone}>
                  {activity.slot || activity.id} · Bản {submission.revision}
                </Badge>
                {submission.assisted ? (
                  <Badge tone="warning" title="Bài có dùng gợi ý/đáp án trước khi nộp">Có hỗ trợ</Badge>
                ) : (
                  <Badge tone="success" title="Bài làm không dùng gợi ý">Tự làm độc lập</Badge>
                )}
                <span className="text-sm text-text-muted">Nộp lúc {formatSubmittedAt(submission.submittedAt)}</span>
              </div>
            </div>
          </div>

          {estimate ? (
            <div className="flex items-center gap-4 border-t border-border pt-4 sm:flex-col sm:gap-2 sm:border-0 sm:pt-0 sm:text-center">
              <ProgressRing
                value={estimate.average}
                max={estimate.max}
                size={92}
                strokeWidth={8}
                label={`Điểm ước tính luyện tập ${formatScore(estimate.average)} trên ${estimate.max}`}
              >
                <span className="flex flex-col items-center leading-none">
                  <span className="text-2xl font-semibold tabular-nums tracking-tight text-text">{formatScore(estimate.average)}</span>
                  <span className="mt-1 text-sm text-text-muted">/{estimate.max}</span>
                </span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="text-base font-semibold text-text">Ước tính luyện tập</p>
                <p className="text-sm text-text-muted">
                  {estimate.count > 1 ? `Trung bình ${estimate.count} tiêu chí` : "Theo 1 tiêu chí"} · chỉ để tham khảo
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {feedback?.next_action ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-teal-200 bg-surface/80 px-4 py-3.5">
            <Icon name="target" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h2 className="eyebrow text-primary-dark">Việc cần làm ở bản tiếp theo</h2>
              <p className="mt-0.5 text-base leading-relaxed text-text">{feedback.next_action}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          {latestRevision ? (
            <>
              <Link
                href={`/my-work/${latestRevision.id}`}
                className={cn(
                  "pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-white no-underline shadow-card hover:bg-primary-dark",
                  stickyCtaOnMobile && "hidden lg:inline-flex"
                )}
              >
                <Icon name="layers" className="h-4 w-4" />
                Mở Bản {latestRevision.revision} và góp ý
              </Link>
              <button type="button" onClick={onStartRevision} disabled={isCreatingRevision} className={cn(SECONDARY_LINK, "cursor-pointer disabled:opacity-60")}>
                <Icon name={action.icon} className="h-4 w-4" />
                {isCreatingRevision ? "Đang mở phiên…" : "Sửa thêm một bản từ bài này"}
              </button>
            </>
          ) : (
            <Button
              size="lg"
              variant={feedback ? "primary" : "outline"}
              onClick={onStartRevision}
              loading={isCreatingRevision}
              className={stickyCtaOnMobile ? "hidden lg:inline-flex" : undefined}
            >
              {isCreatingRevision ? null : <Icon name={action.icon} className="h-4 w-4" />}
              {isCreatingRevision ? "Đang mở phiên…" : action.label}
            </Button>
          )}
          {/* Một link phụ: bản sửa → so sánh với bản trước; còn lại → mở bài đã nộp
              (chưa có góp ý thì bài đã nộp đang mở sẵn ngay bên dưới). */}
          {parentRevision !== null ? (
            <a href="#so-sanh" className={SECONDARY_LINK}>
              <Icon name="layers" className="h-4 w-4" />
              So sánh với Bản {parentRevision}
            </a>
          ) : feedback ? (
            <a href="#bai-da-nop" onClick={onShowSubmission} className={SECONDARY_LINK}>
              <Icon name="file-text" className="h-4 w-4" />
              Xem bài đã nộp
            </a>
          ) : null}
        </div>
      </header>
    </div>
  );
}
