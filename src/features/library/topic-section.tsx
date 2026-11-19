"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState, Icon, Tabs } from "@/components/ui";
import { modeSkill, SKILL_INFO, type Skill } from "@/lib/modes";
import type { ActivityListItemContract } from "@/contracts/library";
import type { TopicMeta } from "@/lib/topics";
import { ActivityCard } from "./activity-card";
import { SuggestionsStrip, type Suggestion } from "./suggestions-strip";

const SKILL_FILTERS: Array<{ value: Skill; label: string }> = [
  { value: "writing", label: SKILL_INFO.writing.shortLabel },
  { value: "reading", label: SKILL_INFO.reading.shortLabel },
  { value: "speaking", label: SKILL_INFO.speaking.shortLabel },
  { value: "listening", label: SKILL_INFO.listening.shortLabel },
];

/** "all" hoặc một trong 4 skill — lọc theo skill gốc (ielts-* gộp vào skill). */
type SkillFilter = "all" | Skill;

function skillOf(mode: string): SkillFilter {
  return modeSkill(mode) ?? "all";
}

/**
 * Màn một chủ đề của Thư viện (chủ đề → bài): link quay lại, tiêu đề,
 * dải Gợi ý, bộ lọc kỹ năng và lưới ActivityCard.
 * Client component vì giữ trạng thái bộ lọc (không cần API riêng).
 */
export function TopicSection({
  topicMeta,
  activities,
  suggestion,
}: {
  topicMeta: TopicMeta;
  activities: ActivityListItemContract[];
  /** Gợi ý rule-based trong chủ đề này (null = không hiển thị dải). */
  suggestion: Suggestion | null;
}) {
  const [filter, setFilter] = useState<SkillFilter>("all");

  const visible =
    filter === "all"
      ? activities
      : activities.filter((a) => skillOf(a.mode) === filter);

  const countFor = (f: SkillFilter) =>
    f === "all"
      ? activities.length
      : activities.filter((a) => skillOf(a.mode) === f).length;

  return (
    <div>
      {/* Quay lại lưới chủ đề */}
      <Link
        href="/library"
        className="mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Tất cả chủ đề
      </Link>

      <h2 className="m-0 mb-3 text-lg font-bold text-text">
        <span aria-hidden className="mr-1">
          {topicMeta.icon}
        </span>
        {topicMeta.name}
      </h2>

      {suggestion ? <SuggestionsStrip suggestion={suggestion} /> : null}

      {/* Bộ lọc kỹ năng — Tabs "pills" có sẵn count + phím ← → */}
      <Tabs
        variant="pills"
        aria-label="Lọc bài theo kỹ năng"
        value={filter}
        onValueChange={(v) => setFilter(v as SkillFilter)}
        className="mb-4 max-w-full overflow-x-auto"
        tabs={[
          { value: "all", label: "Tất cả", count: countFor("all") },
          ...SKILL_FILTERS.map((f) => ({
            value: f.value,
            label: f.label,
            count: countFor(f.value),
          })),
        ]}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon="search"
          title="Chưa có bài học nào trong mục này"
          description={
            activities.length === 0
              ? "Nội dung đang được biên soạn hoặc chưa chuyển sang trạng thái đã duyệt. Quay lại sau nhé."
              : "Không có bài thuộc kỹ năng này. Thử chọn kỹ năng khác nhé."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {visible.map((act, index) => (
            <ActivityCard
              key={act.id}
              activity={act}
              suggested={suggestion?.activityId === act.id}
              tourTarget={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
