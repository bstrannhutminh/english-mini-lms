import Link from "next/link";
import { Badge, Card, Icon, MarkdownText } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { ActivityDetailContract } from "@/contracts/library";
import {
  getTopicMeta,
  UNCATEGORIZED_TOPIC,
  type TopicMeta,
} from "@/lib/topics";
import { StartSessionCta } from "./start-session-cta";

/**
 * Trang chi tiết bài trong Thư viện: badge kỹ năng/chủ đề/thời lượng,
 * mục tiêu, nguồn trích đoạn (reading), đề bài, số câu hỏi (listening),
 * trọng tâm góp ý và CTA Bắt đầu 30'/45'.
 * Server component — chỉ nhận dữ liệu đã lọc approved từ page.tsx.
 */
export function ActivityDetail({
  activity,
  reviseParentId,
}: {
  activity: ActivityDetailContract;
  /** Submission Bản 1 — mở từ gợi ý "làm Bản 2" (?revise=). */
  reviseParentId?: string;
}) {
  const meta = modeMeta(activity.mode);
  const topicMeta: TopicMeta = getTopicMeta(activity.topic);
  const topicHref = `/library?topic=${encodeURIComponent(
    activity.topic ?? UNCATEGORIZED_TOPIC
  )}`;
  const isListening = meta.skill === "listening";

  return (
    <div>
      {/* Quay lại đúng chủ đề của bài */}
      <Link
        href={topicHref}
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Quay lại {topicMeta.icon} {topicMeta.name}
      </Link>

      <Card padded className="p-5">
        {/* Hàng badge: slot · kỹ năng, chủ đề, thời lượng, hình thức, số câu hỏi */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={meta.tone}>
            <Icon name={meta.icon} className="h-3.5 w-3.5" />
            {activity.slot || activity.id} · {meta.shortLabel}
          </Badge>
          {meta.isIelts ? <Badge tone="neutral">IELTS</Badge> : null}
          <Link
            href={topicHref}
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-slate-700 no-underline"
          >
            {topicMeta.icon} {topicMeta.name}
          </Link>
          {activity.durationMinutes ? (
            <Badge tone="neutral">
              <Icon name="clock" className="h-3.5 w-3.5" />
              {activity.durationMinutes} phút
            </Badge>
          ) : null}
          <Badge tone="neutral">
            <Icon
              name={activity.output === "audio" ? "mic" : "pen-tool"}
              className="h-3.5 w-3.5"
            />
            {activity.output === "audio"
              ? "Ghi âm giọng nói"
              : "Bài viết văn bản"}
          </Badge>
          {isListening && activity.questionCount ? (
            <Badge tone="neutral">{activity.questionCount} câu hỏi</Badge>
          ) : null}
        </div>

        {/* Tiêu đề */}
        <h1 className="m-0 mb-3 text-[1.375rem] font-bold leading-snug text-text">
          {activity.title}
        </h1>

        {/* Mục tiêu bài học */}
        {activity.objective ? (
          <div className="mb-4 rounded-xl border-l-4 border-primary bg-surface-muted p-3.5">
            <p className="m-0 mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Icon name="flag" className="h-3.5 w-3.5" />
              Mục tiêu buổi học
            </p>
            <p className="m-0 text-[0.9375rem] leading-relaxed text-text">
              {activity.objective}
            </p>
          </div>
        ) : null}

        {/* Ngữ cảnh nguồn trích đoạn (bài đọc sách) */}
        {activity.sourceContext ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            <p className="m-0 mb-1 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Icon name="book-open" className="h-3.5 w-3.5" />
              Tài liệu nguồn trích đoạn
            </p>
            <p className="m-0 text-sm font-semibold text-emerald-900">
              {activity.sourceContext.sourceTitle}
            </p>
            {activity.sourceContext.page ? (
              <p className="m-0 mt-0.5 text-[0.8125rem] text-emerald-800">
                Số trang tham khảo:{" "}
                <strong>Trang {activity.sourceContext.page}</strong>
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Đề bài / yêu cầu chi tiết (không chứa đáp án) */}
        {activity.promptText ? (
          <div className="mb-4">
            <h2 className="m-0 mb-2 flex items-center gap-1.5 text-base font-semibold text-text">
              <Icon name="file-text" className="h-4 w-4" />
              Đề bài &amp; Hướng dẫn
            </h2>
            <div className="whitespace-pre-line rounded-xl border border-border bg-surface p-4 text-[0.9375rem] leading-relaxed text-text-secondary">
              <MarkdownText text={activity.promptText} />
            </div>
          </div>
        ) : null}

        {/* Trọng tâm góp ý của AI */}
        {activity.feedbackGuide ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-amber-900">
            <strong>Trọng tâm góp ý của AI:</strong> {activity.feedbackGuide}
          </div>
        ) : null}

        {/* CTA tạo phiên — qua POST /api/v1/sessions */}
        <StartSessionCta activityId={activity.id} parentId={reviseParentId} />
      </Card>
    </div>
  );
}
