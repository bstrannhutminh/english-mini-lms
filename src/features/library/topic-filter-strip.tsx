"use client";

import { Icon } from "@/components/ui";
import { getTopicMeta, UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { cn } from "@/lib/utils";
import type { TopicSummary } from "@/contracts/library";

interface TopicFilterStripProps {
  topics: TopicSummary[];
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
}

/** Dải thẻ chủ đề đầu Thư viện — bấm 1 lần để lọc chủ đề, bấm lại để xem tất cả. */
export function TopicFilterStrip({
  topics,
  selectedTopic,
  onSelectTopic,
}: TopicFilterStripProps) {
  if (topics.length === 0) return null;

  return (
    <section aria-label="Chủ đề bài học">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((t) => {
          const meta = getTopicMeta(t.topic);
          const key = t.topic ?? UNCATEGORIZED_TOPIC;
          const active = selectedTopic === key;
          const pct =
            t.activityCount > 0
              ? Math.round((t.learnedCount / t.activityCount) * 100)
              : 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTopic(active ? null : key)}
              aria-pressed={active}
              className={cn(
                "flex cursor-pointer flex-col gap-2.5 rounded-2xl border p-4 text-left transition",
                active
                  ? "border-primary bg-teal-50/70 shadow-xs"
                  : "border-border bg-surface shadow-card hover:border-primary/40"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    active
                      ? "bg-primary text-white"
                      : "bg-teal-50 text-primary-dark"
                  )}
                >
                  <Icon name={meta.iconName} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text">
                    {meta.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    Đã học {t.learnedCount}/{t.activityCount} bài
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
