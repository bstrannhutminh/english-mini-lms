"use client";
import { useState } from "react";
import Link from "next/link";
import { EmptyState, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout";
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
export interface TodayViewProps {
  initialTargetMinutes: 30 | 45;
  displayName?: string;
}
export default function TodayView({ initialTargetMinutes, displayName }: TodayViewProps) {
  const { data, loading, error, targetMinutes, selectTargetMinutes, retry } = useTodayRecommendation(initialTargetMinutes);
  const { startSession, starting } = useStartSession(targetMinutes);
  const [selection, setSelection] = useState<{
    dataRef: TodayRecommendationContract;
    activity: RecommendedActivity;
  } | null>(null);
  const [showAlternates, setShowAlternates] = useState(false);
  const currentActivity = selection && selection.dataRef === data ? selection.activity : (data?.recommendedActivity ?? null);
  function handleSelectAlternate(alt: AlternateActivity) {
    if (!data)
      return;
    setSelection({ dataRef: data, activity: { ...alt, actionType: "new_session" } });
    setShowAlternates(false);
  }
  const recommendationCard = currentActivity && <RecommendedCard activity={currentActivity} reason={currentActivity.reason || data?.reason || ""} targetMinutes={targetMinutes} starting={starting} onStart={startSession} alternateCount={data?.alternateActivities.length ?? 0} swapping={showAlternates} onSwap={() => setShowAlternates((prev) => !prev)} />;
  return (<PageContainer size="wide" className="space-y-6">

    <TodayHero displayName={displayName || data?.learnerName} streakDays={data?.streakDays} targetMinutes={targetMinutes} selectingDisabled={starting} onSelectMinutes={(minutes) => {
      if (!starting) {
        setShowAlternates(false);
        selectTargetMinutes(minutes);
      }
    }} />

    <div className="grid items-start gap-6 lg:grid-cols-12">

      <div className="min-w-0 space-y-4 lg:col-span-8" aria-busy={loading}>

        {error && !loading && <TodayErrorCard message={error} onRetry={retry} />}

        {loading ? (<div role="status" className="space-y-4 rounded-xl border border-border bg-surface p-5 sm:p-7">
          <span className="sr-only">Đang tải bài học…</span>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>) : data?.inProgressSession ? (<>
          <ContinueBlock session={data.inProgressSession} />
          {currentActivity && <details className="rounded-xl border border-border bg-surface px-4">
            <summary className="min-h-11 cursor-pointer py-3 text-base font-medium text-text-secondary">Chọn bài khác</summary>
            <div className="pb-4">
              {recommendationCard}
            </div>
          </details>}
        </>) : currentActivity ? recommendationCard : data && (<EmptyState icon="book-open" title="Chưa có bài học sẵn sàng" description="Thư viện chỉ gợi ý bài đã được duyệt. Hãy mở Thư viện để xem nguồn học hiện có." action={<Link href="/library" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white no-underline hover:bg-primary-dark">Mở Thư viện</Link>} />)}

        <div id="today-alternates" hidden={!showAlternates}>

          {showAlternates && data && <AlternateActivities activities={data.alternateActivities} currentId={currentActivity?.id} onSelect={handleSelectAlternate} onClose={() => setShowAlternates(false)} />}

        </div>

      </div>

      {data && <aside className="min-w-0 space-y-4 lg:col-span-4" aria-label="Lộ trình và ôn tập">
        {data.dailyPlan.length > 0 && <SessionPlan steps={data.dailyPlan} targetMinutes={targetMinutes} />}
        <DueVocabTeaser count={data.dueVocabCount} />
        {data.baselineStatus !== "completed" && <BaselineBanner />}
      </aside>}

    </div>

  </PageContainer>);
}
