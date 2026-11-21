"use client";
import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { AlternateActivity, RecommendedActivity, TodayRecommendationContract } from "@/contracts/today";
import { useTodayRecommendation } from "./use-today-recommendation";
import { useStartSession } from "./use-start-session";
import { TodayHero } from "./today-hero";
import { ContinueBlock } from "./continue-block";
import { BaselineBanner } from "./baseline-banner";
import { SessionPlan } from "./session-plan";
import { DueVocabTeaser } from "./due-vocab-teaser";
import { RecommendedCard } from "./recommended-card";
import { AlternateActivities } from "./alternate-activities";
import { TodayErrorCard } from "./today-error-card";
import { TodayLessonSkeleton } from "./today-skeleton";
import { WeekRhythm } from "./week-rhythm";

export interface TodayViewProps {
  initialTargetMinutes: 30 | 45;
  /** Dữ liệu server render sẵn — có thì không fetch lại, không nháy skeleton. */
  initialData?: TodayRecommendationContract | null;
  displayName?: string;
  greeting?: string;
  dateLabel?: string;
}

/**
 * Hub "Hôm nay": một bài học chính + một nút bắt đầu; lộ trình buổi học,
 * nhịp tuần và từ đến hạn là phần hỗ trợ (cột phải trên desktop).
 */
export default function TodayView({ initialTargetMinutes, initialData = null, displayName, greeting, dateLabel }: TodayViewProps) {
  const { data, loading, error, targetMinutes, selectTargetMinutes, retry } = useTodayRecommendation(initialTargetMinutes, initialData);
  const { startSession, starting } = useStartSession(targetMinutes);
  const [selection, setSelection] = useState<{
    dataRef: TodayRecommendationContract;
    activity: RecommendedActivity;
  } | null>(null);
  const [showAlternates, setShowAlternates] = useState(false);
  const currentActivity = selection && selection.dataRef === data ? selection.activity : (data?.recommendedActivity ?? null);
  // Đang đổi thời lượng: giữ nội dung cũ, làm mờ nhẹ tới khi có dữ liệu mới.
  const refreshing = loading && data !== null;

  function handleSelectAlternate(alt: AlternateActivity) {
    if (!data) return;
    setSelection({ dataRef: data, activity: { ...alt, actionType: "new_session" } });
    setShowAlternates(false);
  }

  const recommendationCard = currentActivity && (
    <RecommendedCard activity={currentActivity} reason={currentActivity.reason || data?.reason || ""}
      targetMinutes={targetMinutes} starting={starting || refreshing} onStart={startSession}
      alternateCount={data?.alternateActivities.length ?? 0} swapping={showAlternates}
      onSwap={() => setShowAlternates((prev) => !prev)} />
  );

  return (
    <PageContainer className="space-y-6 lg:space-y-8">
      <TodayHero displayName={displayName || data?.learnerName} greeting={greeting} dateLabel={dateLabel} targetMinutes={targetMinutes}
        selectingDisabled={starting} onSelectMinutes={(minutes) => {
          if (!starting) {
            setShowAlternates(false);
            selectTargetMinutes(minutes);
          }
        }} />

      <div aria-busy={loading}
        className={cn("grid items-start gap-6 transition-opacity duration-200 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8", refreshing && "pointer-events-none opacity-60")}>
        <div className="stagger min-w-0 space-y-6">
          {error && !loading && <TodayErrorCard message={error} onRetry={retry} />}
          {loading && !data ? (
            <TodayLessonSkeleton />
          ) : data?.inProgressSession ? (
            <ContinueBlock session={data.inProgressSession} />
          ) : currentActivity ? recommendationCard : data && (
            <EmptyState icon="book-open" title="Chưa có bài học sẵn sàng"
              description="Thư viện chỉ gợi ý bài đã được duyệt. Hãy mở Thư viện để xem nguồn học hiện có."
              action={<Link href="/library" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white no-underline hover:bg-primary-dark">Mở Thư viện</Link>} />
          )}

          <div id="today-alternates" hidden={!showAlternates}>
            {showAlternates && data && <AlternateActivities activities={data.alternateActivities}
              currentId={currentActivity?.id} onSelect={handleSelectAlternate} onClose={() => setShowAlternates(false)} />}
          </div>

          {data && data.dailyPlan.length > 0 && <SessionPlan steps={data.dailyPlan} targetMinutes={targetMinutes} />}

          {data?.inProgressSession && currentActivity && (
            <details className="rounded-2xl border border-border bg-surface px-5">
              <summary className="min-h-12 cursor-pointer py-3 text-base font-medium text-text-secondary">Gợi ý cho buổi học khác</summary>
              <div className="pb-5">{recommendationCard}</div>
            </details>
          )}
        </div>

        {data && (
          <aside className="stagger min-w-0 space-y-6">
            <WeekRhythm days={data.weekActivity} streakDays={data.streakDays} weekMinutes={data.weekMinutes} />
            <DueVocabTeaser count={data.dueVocabCount} />
            {data.baselineStatus !== "completed" && <BaselineBanner />}
          </aside>
        )}
      </div>
    </PageContainer>
  );
}
