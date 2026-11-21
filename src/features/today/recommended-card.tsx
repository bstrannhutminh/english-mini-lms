"use client";
import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import type { RecommendedActivity } from "@/contracts/today";
import type { StartableActivity } from "./use-start-session";
import { TodayLessonFrame } from "./today-lesson-frame";

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

const SECONDARY_ACTION =
  "pressable inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-base font-medium text-text-secondary hover:bg-surface-subtle hover:text-primary-dark disabled:opacity-60";

/** Thẻ bài học chính của Hôm nay: một nút bắt đầu, lý do gợi ý và lối đổi bài. */
export function RecommendedCard({ activity, reason, targetMinutes, starting, onStart, alternateCount, swapping, onSwap }: RecommendedCardProps) {
  const isContinuing = activity.actionType === "continue_draft";
  const isRevision = activity.actionType === "start_revision";
  return (
    <TodayLessonFrame titleId="today-mission-title" title={activity.title}
      label={isContinuing ? "Tiếp nối bài đang dở" : isRevision ? "Hôm nay: làm bản sửa" : "Buổi học hôm nay"}
      mode={activity.mode} durationMinutes={activity.durationMinutes} slot={activity.slot} description={activity.objective}>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <Button size="lg" onClick={() => onStart(activity)} loading={starting}
          className="min-h-14 w-full px-6 text-base font-semibold focus-visible:outline-primary sm:w-auto" data-tour="today-start">
          {!starting && <Icon name={isContinuing ? "pen-tool" : "play"} className="h-5 w-5 shrink-0" />}
          {starting ? "Đang mở bài…" : isContinuing ? "Tiếp tục bài đang dở" : isRevision ? `Làm bản sửa · ${targetMinutes} phút` : `Bắt đầu học · ${targetMinutes} phút`}
          {!starting && <Icon name="arrow-right" className="h-5 w-5 shrink-0" />}
        </Button>
        <div className="flex flex-wrap items-center gap-x-1">
          {alternateCount > 0 && (
            <button type="button" onClick={onSwap} disabled={starting} aria-expanded={swapping} aria-controls="today-alternates" className={SECONDARY_ACTION}>
              <Icon name="refresh" className="h-4 w-4" />{swapping ? "Đóng danh sách" : "Đổi bài"}
            </button>
          )}
          <Link href={`/library/${activity.id}`} className={`${SECONDARY_ACTION} no-underline`}>
            <Icon name="file-text" className="h-4 w-4" />Xem đề bài
          </Link>
        </div>
      </div>
      {reason && (
        <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-base leading-relaxed text-text-secondary">
          <Icon name="sparkles" className="mt-1 h-4 w-4 shrink-0 text-primary" />
          <span><span className="font-medium text-text">Vì sao bài này: </span>{reason}</span>
        </p>
      )}
    </TodayLessonFrame>
  );
}
