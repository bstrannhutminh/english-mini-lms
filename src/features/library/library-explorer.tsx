"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { Button, EmptyState, Icon } from "@/components/ui";
import type { ActivityListItemContract, TopicSummary } from "@/contracts/library";
import { UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { ActivityGrid } from "./activity-grid";
import { SuggestionsStrip, type Suggestion } from "./suggestions-strip";
import { TopicFilterStrip } from "./topic-filter-strip";
import { LibraryFilterBar } from "./library-filter-bar";
import { LibraryStatusSelect } from "./library-status-select";
import { filterLibraryActivities, type LibraryFilterState, type LibrarySkillFilter } from "./filter-activities";
import { EMPTY_LIBRARY_FILTERS, parseLibraryFilterUrl, serializeLibraryFilterUrl } from "./library-filter-url";

interface LibraryExplorerProps {
  topics: TopicSummary[];
  activities: ActivityListItemContract[];
  initialTopic: string | null;
  suggestion: Suggestion | null;
}

/**
 * Khung khám phá Thư viện: khối lọc gọn (tìm kiếm, kỹ năng, chủ đề, trạng thái —
 * tất cả đồng bộ lên URL), dải gợi ý mảnh và lưới thẻ bài học.
 */
export function LibraryExplorer({ topics, activities, initialTopic, suggestion }: LibraryExplorerProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = searchParams ?? new URLSearchParams(initialTopic ? { topic: initialTopic } : undefined);
  const filters = parseLibraryFilterUrl(params);
  const { topic, skill, status, query } = filters;
  const visible = filterLibraryActivities(activities, { topic, skill, status, query });
  const countSkill = (target: LibrarySkillFilter) => filterLibraryActivities(activities, { ...filters, skill: target }).length;
  const topicScope = filterLibraryActivities(activities, { ...filters, topic: null });
  const scopedTopics = topics.map((item) => {
    const items = topicScope.filter((activity) => (activity.topic ?? UNCATEGORIZED_TOPIC) === (item.topic ?? UNCATEGORIZED_TOPIC));
    return { ...item, activityCount: items.length, learnedCount: items.filter((activity) => activity.learningStatus === "completed" || (!activity.learningStatus && (activity.submissionCount ?? 0) > 0)).length };
  });
  if (topic && !scopedTopics.some((item) => (item.topic ?? UNCATEGORIZED_TOPIC) === topic))
    scopedTopics.push({ topic, activityCount: 0, learnedCount: 0 });
  const scopedSuggestion = suggestion && visible.some((activity) => activity.id === suggestion.activityId) ? suggestion : null;
  const hasActiveFilter = topic !== null || skill !== "all" || status !== "all" || query !== "";
  function updateFilters(patch: Partial<LibraryFilterState>) {
    const next = serializeLibraryFilterUrl(new URLSearchParams(window.location.search), { ...filters, ...patch });
    window.history.pushState(null, "", `${pathname}${next ? `?${next}` : ""}${window.location.hash}`);
  }
  function resetFilters() { updateFilters(EMPTY_LIBRARY_FILTERS); }
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-3">
        <LibraryFilterBar query={query} status={status} skill={skill} totalCount={countSkill("all")} countSkill={countSkill}
          onQueryChange={(query) => updateFilters({ query })} onStatusChange={(status) => updateFilters({ status })} onSkillChange={(skill) => updateFilters({ skill })} />
        <TopicFilterStrip topics={scopedTopics} selectedTopic={topic} totalCount={topicScope.length} onSelectTopic={(topic) => updateFilters({ topic })} />
      </div>

      {scopedSuggestion && <SuggestionsStrip suggestion={scopedSuggestion} />}

      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <p role="status" className="text-base text-text-secondary">
            <span className="font-semibold tabular-nums text-text">{visible.length}</span> bài<span className={hasActiveFilter ? "hidden sm:inline" : undefined}> phù hợp</span>
          </p>
          {hasActiveFilter && (
            <button type="button" onClick={resetFilters}
              className="pressable inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-base font-medium text-primary-dark hover:bg-primary-soft">
              <Icon name="x" className="h-4 w-4" />Xóa bộ lọc
            </button>
          )}
        </div>
        <LibraryStatusSelect id="library-status-mobile" value={status} onChange={(status) => updateFilters({ status })} className="sm:hidden" />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="search" title="Không tìm thấy bài phù hợp" className="rounded-2xl border border-dashed border-border bg-surface"
          description={activities.length === 0 ? "Thư viện chưa có bài nào được duyệt." : query.trim() ? `Không tìm thấy “${query.trim()}” với bộ lọc hiện tại. Thử từ khóa khác hoặc xóa bộ lọc.` : "Thử kỹ năng, trạng thái hoặc chủ đề khác."}
          action={hasActiveFilter ? <Button onClick={resetFilters}>Xóa bộ lọc</Button> : undefined} />
      ) : (
        <ActivityGrid activities={visible} grouped={skill === "all"} suggestedId={scopedSuggestion?.activityId} />
      )}
    </div>
  );
}
