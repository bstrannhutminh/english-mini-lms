import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import { getTopicMeta } from "@/lib/topics";
import type { ActivityListItemContract } from "@/contracts/library";
const DIFFICULTY_LABELS = { trial: "Thử nghiệm", beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
export function ActivityCard({ activity, suggested = false, tourTarget = false }: {
  activity: ActivityListItemContract;
  suggested?: boolean;
  tourTarget?: boolean;
}) {
  const meta = modeMeta(activity.mode);
  const submissionCount = activity.submissionCount ?? 0;
  return (<Link href={`/library/${activity.id}`} data-tour={tourTarget ? "library-card" : undefined} className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 no-underline transition hover:border-primary focus-visible:border-primary">

    <div className="mb-3 flex flex-wrap items-center gap-2 text-base text-text-secondary">
      <Badge tone={meta.tone}>
        <Icon name={meta.icon} className="h-4 w-4" />
        {meta.shortLabel}
      </Badge>
      {meta.isIelts && <Badge tone="neutral">IELTS</Badge>}
      <span>
        {activity.slot || activity.id}
      </span>
      {activity.durationMinutes && <span className="ml-auto tabular-nums">{activity.durationMinutes} phút</span>}
    </div>

    <h3 className="break-words text-xl font-semibold leading-snug text-text">
      {activity.title}
    </h3>

    {activity.objective && <p className="mt-2 text-base leading-relaxed text-text-secondary">
      {activity.objective}
    </p>}

    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-base text-text-secondary">
      <span>
        {getTopicMeta(activity.topic).name}
      </span>
      {activity.difficulty && <span>
        {DIFFICULTY_LABELS[activity.difficulty]}
      </span>}
    </div>

    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3 text-base">
      <span className="mt-3 text-text-secondary">
        {activity.learningStatus === "in_progress" ? "Đang học dở" : submissionCount > 0 || activity.learningStatus === "completed" ? `Đã nộp${submissionCount > 0 ? ` ${submissionCount} lần` : ""}` : "Chưa học"}
        {suggested ? " · Được gợi ý" : ""}
      </span>
      <span className="mt-3 inline-flex items-center gap-1 font-medium text-primary-dark">Xem bài<Icon name="arrow-right" className="h-4 w-4" /></span>
    </div>

  </Link>);
}
