import { getApprovedActivities } from "@/server/library/activities";
import { getTopics } from "@/server/library/topics";
import { getCurrentLearner } from "@/server/auth";
import {
  getLearnerPracticeContext,
  pickRecommendedActivity,
} from "@/server/today/pick-activity";
import {
  getTopicMeta,
  isValidTopicKey,
  UNCATEGORIZED_TOPIC,
} from "@/lib/topics";
import { PageContainer } from "@/components/layout";
import { TopicGrid } from "@/features/library/topic-grid";
import { TopicSection } from "@/features/library/topic-section";
import type { Suggestion } from "@/features/library/suggestions-strip";

export const dynamic = "force-dynamic";

interface LibraryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const rawTopic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const topicKey = rawTopic?.trim() ? rawTopic.trim() : null;

  const learner = await getCurrentLearner();

  // Màn đầu: lưới chủ đề. Màn chủ đề: danh sách bài của chủ đề đó.
  const topicIsValid =
    topicKey !== null &&
    (topicKey === UNCATEGORIZED_TOPIC || isValidTopicKey(topicKey));
  const [topics, activities] = await Promise.all([
    topicKey ? Promise.resolve([]) : getTopics(learner?.id),
    topicKey && topicIsValid
      ? getApprovedActivities(undefined, topicKey, learner?.id)
      : Promise.resolve([]),
  ]);

  // Gợi ý: 1 bài đầu của chủ đề, dùng chung luật rule-based với /today
  let suggestion: Suggestion | null = null;
  if (learner && activities.length > 0) {
    const ctx = await getLearnerPracticeContext(learner.id);
    const picked = pickRecommendedActivity(activities, ctx, 30);
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

  const topicMeta = topicKey ? getTopicMeta(topicKey) : null;

  return (
    <PageContainer size="wide">
      {/* Header trang */}
      <div className="mb-4">
        <h1 className="m-0 mb-1 text-[1.375rem] font-bold tracking-tight text-text">
          Thư viện bài học
        </h1>
        <p className="m-0 text-sm leading-relaxed text-text-muted">
          {topicMeta
            ? "Chọn một bài trong chủ đề để xem đề và bắt đầu phiên học."
            : "Chọn một chủ đề để xem các bài học bên trong."}
        </p>
      </div>

      {topicMeta ? (
        <TopicSection
          key={topicKey}
          topicMeta={topicMeta}
          activities={activities}
          suggestion={suggestion}
        />
      ) : (
        <TopicGrid topics={topics} />
      )}
    </PageContainer>
  );
}
