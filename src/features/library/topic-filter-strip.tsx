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
export function TopicFilterStrip({ topics, selectedTopic, totalCount, onSelectTopic }: TopicFilterStripProps) {
  if (topics.length === 0)
    return null;
  return (<section aria-label="Chủ đề bài học" className="space-y-2">

    <p className="text-base font-medium text-text">Chủ đề</p>

    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">

      {[{ key: null, name: "Mọi chủ đề", count: totalCount }, ...topics.map((item) => ({ key: item.topic ?? UNCATEGORIZED_TOPIC, name: getTopicMeta(item.topic).name, count: item.activityCount }))].map((item) => <button key={item.key ?? "all"} type="button" onClick={() => onSelectTopic(item.key === selectedTopic && item.key !== null ? null : item.key)} aria-pressed={selectedTopic === item.key} className={cn("inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-left text-base transition", selectedTopic === item.key ? "border-primary bg-surface-muted font-medium text-primary-dark" : "border-border bg-surface text-text-secondary hover:border-primary")}>
        <span>
          {item.name}
        </span>
        <span className="tabular-nums">
          {item.count}
        </span>
      </button>)}

    </div>

  </section>);
}
