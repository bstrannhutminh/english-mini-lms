"use client";

/**
 * TodayView — hub "Hôm nay" gọn, tập trung (≤ 2 chạm vào bài):
 *   TodayHero (chào + chọn 30'/45') → lỗi (nếu có) → ContinueBlock (phiên dở)
 *   → RecommendedCard (1 CTA chính nổi bật + đổi bài) → SessionPlan (4 bước gọn)
 *   → DueVocabTeaser (khi có từ đến hạn) → BaselineBanner (khi trước đó đã bỏ qua).
 */
import { useState } from "react";
import Link from "next/link";
import { EmptyState, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout";
import type {
  AlternateActivity,
  RecommendedActivity,
  TodayRecommendationContract,
} from "@/contracts/today";
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

export default function TodayView({
  initialTargetMinutes,
  displayName,
}: TodayViewProps) {
  const { data, loading, error, targetMinutes, selectTargetMinutes, retry } =
    useTodayRecommendation(initialTargetMinutes);
  const { startSession, starting } = useStartSession(targetMinutes);

  const [selection, setSelection] = useState<{
    dataRef: TodayRecommendationContract;
    activity: RecommendedActivity;
  } | null>(null);
  const [showAlternates, setShowAlternates] = useState(false);

  const currentActivity =
    selection && selection.dataRef === data
      ? selection.activity
      : (data?.recommendedActivity ?? null);

  const handleSelectAlternate = (alt: AlternateActivity) => {
    if (!data) return;
    setSelection({
      dataRef: data,
      activity: { ...alt, actionType: "new_session" },
    });
    setShowAlternates(false);
  };

  const recommendationCard = currentActivity && (
    <RecommendedCard
      activity={currentActivity}
      reason={data?.reason ?? ""}
      targetMinutes={targetMinutes}
      starting={starting}
      onStart={startSession}
      alternateCount={data?.alternateActivities.length ?? 0}
      swapping={showAlternates}
      onSwap={() => setShowAlternates((prev) => !prev)}
    />
  );

  return (
    <PageContainer className="space-y-5">
      <TodayHero
        displayName={displayName}
        streakDays={data?.streakDays ?? null}
        targetMinutes={targetMinutes}
        onSelectMinutes={selectTargetMinutes}
      />

      {error && !loading && <TodayErrorCard message={error} onRetry={retry} />}

      {/* Ưu tiên cao nhất: tiếp tục phiên đang dở bằng 1 chạm */}
      {data?.inProgressSession && (
        <ContinueBlock session={data.inProgressSession} />
      )}

      {/* Khối chính trên nếp gấp: 1 bài gợi ý duy nhất với lý do rõ ràng */}
      {loading ? (
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : currentActivity ? (
        data?.inProgressSession ? (
          <details className="rounded-2xl border border-border bg-surface p-4">
            <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-text-secondary">
              Muốn chọn bài khác?
            </summary>
            {recommendationCard}
          </details>
        ) : recommendationCard
      ) : (
        data && (
          <EmptyState
            icon="book-open"
            title="Chưa có bài học nào sẵn sàng trong Thư viện"
            description="Hệ thống chỉ gợi ý các bài đã được duyệt. Bạn có thể xem Thư viện hoặc thêm bài mới trong Quản trị."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/library"
                  className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary-dark"
                >
                  Mở Thư viện bài học
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm font-semibold text-text-secondary no-underline transition hover:bg-slate-200/70"
                >
                  Trang Quản trị
                </Link>
              </div>
            }
          />
        )
      )}

      {showAlternates && data && (
        <AlternateActivities
          activities={data.alternateActivities}
          currentId={currentActivity?.id}
          onSelect={handleSelectAlternate}
          onClose={() => setShowAlternates(false)}
        />
      )}

      {/* Chu trình 4 bước gọn trong ngày */}
      {data && data.dailyPlan.length > 0 && (
        <SessionPlan steps={data.dailyPlan} targetMinutes={targetMinutes} />
      )}

      {/* Từ vựng đến hạn (chỉ hiện khi > 0) */}
      {data && <DueVocabTeaser count={data.dueVocabCount} />}

      {/* Nhắc thiết lập lộ trình (chỉ khi trước đó người học đã chọn Bỏ qua) */}
      {data && data.baselineStatus !== "completed" && <BaselineBanner />}
    </PageContainer>
  );
}
