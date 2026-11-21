"use client";
import { Icon, SkillTile } from "@/components/ui";
import { cn } from "@/lib/utils";
import { modeMeta } from "@/lib/modes";
import type { AlternateActivity } from "@/contracts/today";

export interface AlternateActivitiesProps {
  activities: AlternateActivity[];
  currentId?: string;
  onSelect: (activity: AlternateActivity) => void;
  onClose: () => void;
}

/** Danh sách bài thay thế khi bấm "Đổi bài" — mỗi dòng là một lựa chọn 1 chạm. */
export function AlternateActivities({ activities, currentId, onSelect, onClose }: AlternateActivitiesProps) {
  if (activities.length === 0) return null;
  return (
    <section aria-label="Các bài thay thế" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-text">Chọn bài khác</h2>
        <button type="button" onClick={onClose} className="pressable inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-base text-text-secondary hover:bg-surface-subtle">
          Đóng<Icon name="x" className="h-4 w-4" />
        </button>
      </div>
      <ul className="max-h-[60dvh] space-y-2 overflow-y-auto pr-1">
        {activities.map((activity) => {
          const meta = modeMeta(activity.mode);
          const selected = activity.id === currentId;
          return (
            <li key={activity.id}>
              <button type="button" aria-pressed={selected} onClick={() => onSelect(activity)}
                className={cn("pressable flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left",
                  selected ? "border-primary bg-primary-soft" : "border-border hover:border-teal-200 hover:bg-surface-muted")}>
                <SkillTile mode={activity.mode} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-base font-medium text-text">{activity.title}</span>
                  <span className="text-sm text-text-muted">{meta.shortLabel}{meta.isIelts ? " · IELTS" : ""} · {activity.durationMinutes} phút</span>
                </span>
                <Icon name="chevron-right" className="h-5 w-5 shrink-0 text-text-muted" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
