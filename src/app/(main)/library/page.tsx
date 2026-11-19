import { getApprovedActivities } from "@/server/library/activities";
import { getTopics } from "@/server/library/topics";
import { getCurrentLearner } from "@/server/auth";
import {
  getLearnerPracticeContext,
  pickRecommendedActivity,
} from "@/server/today/pick-activity";
import { isValidTopicKey, UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { PageContainer } from "@/components/layout";
import { LibraryExplorer } from "@/features/library/library-explorer";
import type { Suggestion } from "@/features/library/suggestions-strip";

export const dynamic = "force-dynamic";

interface LibraryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const rawTopic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const trimmedTopic = rawTopic?.trim() || null;
  const initialTopic =
    trimmedTopic &&
    (trimmedTopic === UNCATEGORIZED_TOPIC || isValidTopicKey(trimmedTopic))
      ? trimmedTopic
      : null;

  const learner = await getCurrentLearner();

  const [topics, activities] = await Promise.all([
    getTopics(learner?.id),
    getApprovedActivities(undefined, undefined, learner?.id),
  ]);

  let suggestion: Suggestion | null = null;
  const scopedForSuggestion = initialTopic
    ? activities.filter((a) => (a.topic ?? UNCATEGORIZED_TOPIC) === initialTopic)
    : activities;

  if (learner && scopedForSuggestion.length > 0) {
    const ctx = await getLearnerPracticeContext(learner.id);
    const picked = pickRecommendedActivity(scopedForSuggestion, ctx, 30);
    if (picked) {
      suggestion = {
        activityId: picked.id,
        title: picked.title,
        reason: picked.reason,
        continueSessionId:
          picked.actionType === "continue_draft" ? picked.sessionId : undefined,
        reviseParentId:
          picked.actionType === "start_revision" ? picked.parentId : undefined,
      };
    }
  }

  return (
    <PageContainer size="wide">
      <header className="mb-5">
        <h1 className="m-0 mb-1 text-2xl font-bold tracking-tight text-text">
          Thư viện bài học
        </h1>
        <p className="m-0 text-sm leading-relaxed text-text-secondary">
          Lọc nhanh theo chủ đề, kỹ năng hoặc tìm kiếm trực tiếp để mở bài trong
          1 chạm.
        </p>
      </header>

      <LibraryExplorer
        topics={topics}
        activities={activities}
        initialTopic={initialTopic}
        suggestion={suggestion}
      />
    </PageContainer>
  );
}
