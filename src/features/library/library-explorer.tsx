"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui";
import type {
  ActivityListItemContract,
  TopicSummary,
} from "@/contracts/library";
import { ActivityCard } from "./activity-card";
import { SuggestionsStrip, type Suggestion } from "./suggestions-strip";
import { TopicFilterStrip } from "./topic-filter-strip";
import { LibraryFilterBar } from "./library-filter-bar";
import {
  filterLibraryActivities,
  type LibrarySkillFilter,
  type LibraryStatusFilter,
} from "./filter-activities";

interface LibraryExplorerProps {
  topics: TopicSummary[];
  activities: ActivityListItemContract[];
  initialTopic: string | null;
  suggestion: Suggestion | null;
}

/**
 * Thư viện khám phá trực diện: thẻ Chủ đề có tiến độ (bấm để lọc nhanh)
 * + ô tìm kiếm + lọc kỹ năng/IELTS/trạng thái + lưới bài học hiện ngay bên dưới.
 */
export function LibraryExplorer({
  topics,
  activities,
  initialTopic,
  suggestion,
}: LibraryExplorerProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic);
  const [skill, setSkill] = useState<LibrarySkillFilter>("all");
  const [status, setStatus] = useState<LibraryStatusFilter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () =>
      filterLibraryActivities(activities, {
        topic: selectedTopic,
        skill,
        status,
        query,
      }),
    [activities, selectedTopic, skill, status, query]
  );

  const topicScoped = useMemo(
    () =>
      filterLibraryActivities(activities, {
        topic: selectedTopic,
        skill: "all",
        status: "all",
        query: "",
      }),
    [activities, selectedTopic]
  );

  const countSkill = (target: LibrarySkillFilter) =>
    filterLibraryActivities(topicScoped, {
      topic: null,
      skill: target,
      status: "all",
      query: "",
    }).length;

  const hasActiveFilter =
    selectedTopic !== null ||
    skill !== "all" ||
    status !== "all" ||
    query.trim() !== "";

  function resetFilters() {
    setSelectedTopic(null);
    setSkill("all");
    setStatus("all");
    setQuery("");
  }

  return (
    <div className="space-y-5">
      <TopicFilterStrip
        topics={topics}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
      />

      {suggestion && !query.trim() && (
        <SuggestionsStrip suggestion={suggestion} />
      )}

      <LibraryFilterBar
        query={query}
        status={status}
        skill={skill}
        totalCount={topicScoped.length}
        countSkill={countSkill}
        hasActiveFilter={hasActiveFilter}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onSkillChange={setSkill}
        onReset={resetFilters}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon="search"
          title="Không tìm thấy bài học phù hợp"
          description={
            activities.length === 0
              ? "Thư viện chưa có bài nào ở trạng thái Đã duyệt."
              : "Thử đổi từ khoá, chọn chủ đề khác hoặc xoá bộ lọc hiện tại."
          }
          action={
            hasActiveFilter ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Hiện tất cả bài học
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 xl:grid-cols-3">
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
