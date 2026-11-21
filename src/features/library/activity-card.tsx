import Link from "next/link";
import { Badge, Icon, SkillTile } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import { getTopicMeta } from "@/lib/topics";
import type { ActivityListItemContract } from "@/contracts/library";
import { ActivityStatusChip } from "./activity-status-chip";

const DIFFICULTY_LABELS = { trial: "Thử nghiệm", beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };

/**
 * Thẻ bài học trong lưới Thư viện: ô kỹ năng + nhãn (mức độ · chủ đề), tiêu đề
 * (≤2 dòng), mục tiêu (≤2 dòng), chân thẻ gồm thời lượng và trạng thái học.
 * Cả thẻ là MỘT link tới trang chi tiết.
 */
export function ActivityCard({ activity, suggested = false, tourTarget = false }: {
  activity: ActivityListItemContract;
  suggested?: boolean;
  tourTarget?: boolean;
}) {
  const meta = modeMeta(activity.mode);
  return (
    <Link href={`/library/${activity.id}`} data-tour={tourTarget ? "library-card" : undefined}
      className="group card-lift pressable flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface p-4 no-underline sm:p-5">
      <div className="flex items-center gap-3">
        <SkillTile mode={activity.mode} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-sm font-semibold leading-5 ${meta.iconClass}`}>{meta.shortLabel}</span>
            {meta.isIelts && <Badge tone="neutral" className="px-1.5 py-0 text-xs">IELTS</Badge>}
          </p>
          <p className="truncate text-sm leading-5 text-text-muted">
            {activity.difficulty ? `${DIFFICULTY_LABELS[activity.difficulty]} · ` : ""}{getTopicMeta(activity.topic).name}
          </p>
        </div>
        {suggested && (
          <Badge tone="success" className="shrink-0 self-start border-teal-200 bg-primary-soft text-primary-dark">
            <Icon name="sparkles" className="h-3.5 w-3.5" />Gợi ý
          </Badge>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 break-words text-lg font-semibold leading-snug tracking-tight text-text group-hover:text-primary-dark">
        {activity.title}
      </h3>
      {activity.objective && (
        <p className="mt-1.5 line-clamp-2 text-base leading-relaxed text-text-secondary">{activity.objective}</p>
      )}

      <div className="mt-auto flex items-center gap-3 pt-4">
        <p className="flex min-h-7 min-w-0 flex-1 items-center gap-1.5 text-sm text-text-muted">
          {activity.durationMinutes && <>
            <Icon name="clock" className="h-4 w-4 shrink-0" />
            <span className="tabular-nums">{activity.durationMinutes} phút</span>
          </>}
        </p>
        <ActivityStatusChip learningStatus={activity.learningStatus} submissionCount={activity.submissionCount ?? 0} />
        <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-dark" />
      </div>
    </Link>
  );
}
