"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui";
import type { ActivityListItemContract, TopicSummary } from "@/contracts/library";
import { UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { ActivityCard } from "./activity-card";
import { SuggestionsStrip, type Suggestion } from "./suggestions-strip";
import { TopicFilterStrip } from "./topic-filter-strip";
import { LibraryFilterBar } from "./library-filter-bar";
import { filterLibraryActivities, type LibraryFilterState, type LibrarySkillFilter } from "./filter-activities";
import { EMPTY_LIBRARY_FILTERS, parseLibraryFilterUrl, serializeLibraryFilterUrl } from "./library-filter-url";
interface LibraryExplorerProps {
  topics: TopicSummary[];
  activities: ActivityListItemContract[];
  initialTopic: string | null;
  suggestion: Suggestion | null;
}
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
  return (<div className="space-y-5">

    <LibraryFilterBar query={query} status={status} skill={skill} totalCount={countSkill("all")} countSkill={countSkill} hasActiveFilter={hasActiveFilter} onQueryChange={(query) => updateFilters({ query })} onStatusChange={(status) => updateFilters({ status })} onSkillChange={(skill) => updateFilters({ skill })} onReset={resetFilters} />

    <TopicFilterStrip topics={scopedTopics} selectedTopic={topic} totalCount={topicScope.length} onSelectTopic={(topic) => updateFilters({ topic })} />

    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
      <h2 className="text-lg font-semibold text-text">Bài học{topic ? " trong chủ đề" : " đã duyệt"}</h2>
      <p role="status" className="text-base tabular-nums text-text-secondary">{visible.length} bài phù hợp</p>
    </div>

    {scopedSuggestion && <SuggestionsStrip suggestion={scopedSuggestion} />}

    {visible.length === 0 ? (<EmptyState icon="search" title="Không tìm thấy bài phù hợp" description={activities.length === 0 ? "Thư viện chưa có bài nào được duyệt." : query.trim() ? `Không tìm thấy “${query.trim()}” với bộ lọc hiện tại. Thử từ khóa khác hoặc xóa bộ lọc.` : "Thử kỹ năng, trạng thái hoặc chủ đề khác."} action={hasActiveFilter ? <button type="button" onClick={resetFilters} className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white hover:bg-primary-dark">Xóa bộ lọc</button> : undefined} />) : <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {visible.map((activity, index) => <ActivityCard key={activity.id} activity={activity} suggested={scopedSuggestion?.activityId === activity.id} tourTarget={index === 0} />)}
    </div>}

  </div>);
}
