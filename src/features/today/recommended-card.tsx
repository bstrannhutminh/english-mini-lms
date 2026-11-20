"use client";
import Link from "next/link";
import { Badge, Button, Icon } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { RecommendedActivity } from "@/contracts/today";
import type { StartableActivity } from "./use-start-session";
export interface RecommendedCardProps {
  activity: RecommendedActivity;
  reason: string;
  targetMinutes: 30 | 45;
  starting: boolean;
  onStart: (activity: StartableActivity) => void;
  alternateCount: number;
  swapping: boolean;
  onSwap: () => void;
}
export function RecommendedCard({ activity, reason, targetMinutes, starting, onStart, alternateCount, swapping, onSwap }: RecommendedCardProps) {
  const meta = modeMeta(activity.mode);
  const isContinuing = activity.actionType === "continue_draft";
  const isRevision = activity.actionType === "start_revision";
  return (<section aria-labelledby="today-mission-title" className="rounded-xl border border-border bg-surface p-5 sm:p-7">

    <div className="mb-4 flex flex-wrap items-center gap-2 text-base text-text-secondary">

      <Badge tone={meta.tone}>
        <Icon name={meta.icon} className="h-4 w-4" />
        {meta.label}
      </Badge>

      {meta.isIelts && <Badge tone="neutral">IELTS</Badge>}

      <span>{activity.slot ? `${activity.slot} · ` : ""}{activity.durationMinutes} phút</span>

    </div>

    <p className="mb-2 text-base font-medium text-primary-dark">
      {isContinuing ? "Bài đang dở" : isRevision ? "Thử lại từ góp ý" : "Bài tiếp theo"}
    </p>

    <h2 id="today-mission-title" className="break-words text-2xl font-semibold leading-snug tracking-tight text-text sm:text-3xl">
      {activity.title}
    </h2>

    {activity.objective && <p className="mt-3 line-clamp-2 text-base leading-relaxed text-text-secondary">
      {activity.objective}
    </p>}

    <Button size="lg" onClick={() => onStart(activity)} loading={starting} fullWidth className="mt-5" data-tour="today-start">

      {!starting && <Icon name={isContinuing ? "pen-tool" : "play"} className="h-5 w-5" />}

      <span>
        {starting ? "Đang mở bài…" : isContinuing ? "Tiếp tục bài đang dở" : isRevision ? `Làm bản sửa · ${targetMinutes} phút` : `Bắt đầu · ${targetMinutes} phút`}
      </span>

    </Button>

    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3">

      <Link href={`/library/${activity.id}`} className="inline-flex min-h-11 items-center gap-1 text-base font-medium text-text-secondary hover:text-primary-dark">Xem đầy đủ đề bài<Icon name="arrow-right" className="h-4 w-4" /></Link>

      {alternateCount > 0 && <button type="button" onClick={onSwap} disabled={starting} aria-expanded={swapping} aria-controls="today-alternates" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-base text-text-secondary hover:bg-surface-muted disabled:opacity-60">
        <Icon name="refresh" className="h-4 w-4" />
        {swapping ? "Đóng danh sách" : "Đổi bài"}
      </button>}

    </div>

    {reason && <details className="mt-2 border-t border-border-subtle">
      <summary className="min-h-11 cursor-pointer py-3 text-base text-text-secondary">Vì sao gợi ý bài này?</summary>
      <p className="pb-2 text-base leading-relaxed text-text-secondary">
        {reason}
      </p>
    </details>}

  </section>);
}
