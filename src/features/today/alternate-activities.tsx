"use client";
import { Badge, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { modeMeta } from "@/lib/modes";
import type { AlternateActivity } from "@/contracts/today";
export interface AlternateActivitiesProps {
  activities: AlternateActivity[];
  currentId?: string;
  onSelect: (activity: AlternateActivity) => void;
  onClose: () => void;
}
export function AlternateActivities({ activities, currentId, onSelect, onClose }: AlternateActivitiesProps) {
  if (activities.length === 0)
    return null;
  return <section aria-label="Các bài thay thế" className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-semibold text-text">Chọn bài khác</h2>
      <button type="button" onClick={onClose} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-base text-text-secondary hover:bg-surface-muted">Đóng<Icon name="x" className="h-4 w-4" /></button>
    </div>
    <div className="space-y-2">
      {activities.map((activity) => {
        const meta = modeMeta(activity.mode); return <button key={activity.id} type="button" aria-pressed={activity.id === currentId} onClick={() => onSelect(activity)} className={cn("flex min-h-11 w-full cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition", activity.id === currentId ? "border-primary bg-surface-muted" : "border-border hover:border-primary")}>
          <Badge tone={meta.tone}>
            {meta.shortLabel}
          </Badge>
          <span className="break-words text-base font-medium text-text">
            {activity.title}
          </span>
          {activity.objective && <span className="line-clamp-2 text-base leading-relaxed text-text-secondary">
            {activity.objective}
          </span>}
          <span className="text-base text-primary-dark">Chọn bài · {activity.durationMinutes} phút</span>
        </button>;
      })}
    </div>
  </section>;
}
