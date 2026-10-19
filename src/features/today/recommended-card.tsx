"use client";

/**
 * RecommendedCard — bài chính được gợi ý hôm nay: luôn kèm LÝ DO rule-based
 * (invariant), chip kỹ năng từ MODE_META, mục tiêu học, CTA Bắt đầu/Tiếp tục
 * (1 chạm vào bài) + link "Xem đề bài" + "Đổi bài khác".
 */
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

export function RecommendedCard({
  activity,
  reason,
  targetMinutes,
  starting,
  onStart,
  alternateCount,
  swapping,
  onSwap,
}: RecommendedCardProps) {
  const meta = modeMeta(activity.mode);
  const isContinuing = activity.actionType === "continue_draft";

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-7">
      {/* Header: nhãn + lý do gợi ý (rule-based, giải thích được) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-teal-200/70 bg-teal-50 px-2.5 py-1 text-xs font-bold tracking-wider text-teal-700 uppercase">
            <Icon name="compass" className="h-3.5 w-3.5 text-teal-600" />
            <span>Gợi ý hôm nay</span>
          </span>
          <span className="text-xs font-medium text-slate-600">{reason}</span>
        </div>

        {alternateCount > 0 && (
          <button
            type="button"
            onClick={onSwap}
            className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-teal-700"
          >
            <Icon name="refresh" className="h-3.5 w-3.5" />
            <span>{swapping ? "Đóng danh sách" : "Đổi bài khác"}</span>
          </button>
        )}
      </div>

      {/* Chi tiết hoạt động */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={meta.tone} className="font-semibold">
            <Icon name={meta.icon} className="h-3.5 w-3.5" />
            <span>{meta.label}</span>
          </Badge>
          {meta.isIelts && <Badge tone="neutral">IELTS</Badge>}
          {activity.durationMinutes ? (
            <span className="text-xs tabular-nums text-slate-500">
              • Chuẩn {activity.durationMinutes} phút
            </span>
          ) : null}
        </div>

        <h2 className="text-lg leading-snug font-bold tracking-tight text-slate-900 sm:text-xl">
          {activity.title}
        </h2>

        {activity.objective && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <span className="font-semibold text-slate-800">Mục tiêu học: </span>
            {activity.objective}
          </div>
        )}
      </div>

      {/* Hành động chính — 1 chạm vào bài */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          size="lg"
          onClick={() => onStart(activity)}
          loading={starting}
          fullWidth
          className="flex-1"
          data-tour="today-start"
        >
          {!starting && (
            <Icon
              name={isContinuing ? "pen-tool" : "play"}
              className="h-4 w-4"
            />
          )}
          <span>
            {starting
              ? "Đang khởi tạo phiên..."
              : isContinuing
                ? `Tiếp tục bài đang dở (${targetMinutes} phút)`
                : `Bắt đầu luyện tập (${targetMinutes} phút)`}
          </span>
        </Button>

        <Link
          href={`/library/${activity.id}`}
          className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 px-5 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          Xem đề bài
        </Link>
      </div>
    </section>
  );
}
