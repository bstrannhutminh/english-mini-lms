"use client";
import { getTopicMeta, UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { cn } from "@/lib/utils";
import type { TopicSummary } from "@/contracts/library";

interface TopicFilterStripProps {
  topics: TopicSummary[];
  selectedTopic: string | null;
  totalCount: number;
  onSelectTopic: (topic: string | null) => void;
}

/** Chip chủ đề trên MỘT hàng cuộn ngang (tràn mép trên mobile), kèm số bài. */
export function TopicFilterStrip({ topics, selectedTopic, totalCount, onSelectTopic }: TopicFilterStripProps) {
  if (topics.length === 0)
    return null;
  const chips = [
    { key: null, name: "Mọi chủ đề", count: totalCount },
    ...topics.map((item) => ({ key: item.topic ?? UNCATEGORIZED_TOPIC, name: getTopicMeta(item.topic).name, count: item.activityCount })),
  ];
  return (
    <section aria-label="Chủ đề bài học" className="scroll-strip -mx-5 flex gap-2 px-5 sm:mx-0 sm:px-0">
      {chips.map((item) => {
        const selected = selectedTopic === item.key;
        return (
          <button key={item.key ?? "all"} type="button" aria-pressed={selected}
            onClick={() => onSelectTopic(item.key === selectedTopic && item.key !== null ? null : item.key)}
            className={cn("pressable inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 text-base",
              selected ? "border-primary bg-primary-soft font-medium text-primary-dark" : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text")}>
            <span>{item.name}</span>
            <span className={cn("text-sm tabular-nums", selected ? "text-primary-dark" : "text-text-muted")}>{item.count}</span>
          </button>
        );
      })}
    </section>
  );
}
