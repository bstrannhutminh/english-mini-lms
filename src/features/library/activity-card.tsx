import Link from "next/link";
import { Badge, Card, Icon } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { ActivityListItemContract } from "@/contracts/library";

const PURPOSE_LABELS: Record<string, string> = {
  baseline: "Khảo sát đầu vào",
  practice: "Luyện tập",
  assessment: "Đánh giá",
};

/**
 * Thẻ bài học trong danh sách Thư viện.
 * Nhãn/màu/icon của mode lấy từ MODE_META (nguồn duy nhất) — không tự khai map.
 * Component trình bày thuần: dùng được trong server lẫn client (lọc theo mode).
 */
export function ActivityCard({
  activity,
  suggested = false,
  tourTarget = false,
}: {
  activity: ActivityListItemContract;
  /** Đánh dấu bài được SuggestionsStrip gợi ý. */
  suggested?: boolean;
  /** Gắn data-tour="library-card" cho guided tour (thẻ đầu danh sách). */
  tourTarget?: boolean;
}) {
  const meta = modeMeta(activity.mode);
  const submissionCount = activity.submissionCount ?? 0;

  return (
    <Link
      href={`/library/${activity.id}`}
      data-tour={tourTarget ? "library-card" : undefined}
      className="block rounded-2xl no-underline"
    >
      <Card interactive padded className="flex h-full flex-col gap-2.5">
        {/* Hàng badge: slot · kỹ năng (+ IELTS), trạng thái học, thời lượng */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={meta.tone}>
              <Icon name={meta.icon} className="h-3.5 w-3.5" />
              {activity.slot || activity.id} · {meta.shortLabel}
            </Badge>
            {meta.isIelts ? <Badge tone="neutral">IELTS</Badge> : null}
            {activity.difficulty === "trial" ? (
              <Badge tone="neutral">Thử nghiệm</Badge>
            ) : null}
            {suggested ? <Badge tone="warning">Gợi ý</Badge> : null}
            {activity.learningStatus === "in_progress" ? (
              <Badge tone="warning">Đang học dở</Badge>
            ) : submissionCount > 0 ? (
              <Badge tone="success">Đã nộp {submissionCount} lần</Badge>
            ) : (
              <Badge tone="neutral">Chưa học</Badge>
            )}
          </div>
          {activity.durationMinutes ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-muted">
              <Icon name="clock" className="h-3.5 w-3.5" />
              {activity.durationMinutes} phút
            </span>
          ) : null}
        </div>

        {/* Tiêu đề + mục tiêu cô đọng */}
        <h3 className="m-0 text-[1.0625rem] font-semibold leading-snug text-text">
          {activity.title}
        </h3>
        {activity.objective ? (
          <p className="m-0 text-sm leading-relaxed text-text-secondary">
            {activity.objective}
          </p>
        ) : null}

        {/* Footer: hình thức đầu ra + mục đích + điều hướng */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-subtle pt-2.5 text-xs text-text-muted">
          <span className="inline-flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <Icon
                name={activity.output === "audio" ? "mic" : "pen-tool"}
                className="h-3.5 w-3.5"
              />
              {activity.output === "audio"
                ? "Ghi âm giọng nói"
                : "Soạn thảo văn bản"}
            </span>
            {activity.purpose ? (
              <span>· {PURPOSE_LABELS[activity.purpose] ?? "Luyện tập"}</span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
            Xem chi tiết
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
