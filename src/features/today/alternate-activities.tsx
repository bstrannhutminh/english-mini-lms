"use client";

/**
 * AlternateActivities — danh sách bài thay thế khi bấm "Đổi bài khác".
 * Chọn một bài → nó trở thành hoạt động hiện tại của RecommendedCard.
 */
import { Badge, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { modeMeta } from "@/lib/modes";
import type { AlternateActivity } from "@/contracts/today";

export interface AlternateActivitiesProps {
  activities: AlternateActivity[];
  /** Id bài đang được chọn — highlight khung. */
  currentId?: string;
  onSelect: (activity: AlternateActivity) => void;
  onClose: () => void;
}

export function AlternateActivities({
  activities,
  currentId,
  onSelect,
  onClose,
}: AlternateActivitiesProps) {
  if (activities.length === 0) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-bold text-slate-900">
          Các bài học khả dụng khác
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          Đóng ✕
        </button>
      </div>

      <div className="space-y-2">
        {activities.map((alt) => {
          const meta = modeMeta(alt.mode);
          const isCurrent = alt.id === currentId;

          return (
            <div
              key={alt.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border p-3.5 transition",
                isCurrent
                  ? "border-teal-500 bg-teal-50/40"
                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/80"
              )}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge tone={meta.tone} className="px-2 py-0.5 text-[10px] font-semibold">
                    <Icon name={meta.icon} className="h-3 w-3" />
                    <span>{meta.shortLabel}</span>
                  </Badge>
                  <span className="truncate text-xs font-bold text-slate-800">
                    {alt.title}
                  </span>
                </div>
                {alt.objective && (
                  <p className="line-clamp-1 text-xs text-slate-500">
                    {alt.objective}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelect(alt)}
                className="min-h-11 shrink-0 cursor-pointer rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-teal-700 transition hover:bg-teal-50 hover:text-teal-800"
              >
                Chọn bài này
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
