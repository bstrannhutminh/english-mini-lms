"use client";

/**
 * TodayView — hub "Hôm nay" (spec §3.3). Thứ tự khối:
 *   Hero (+ StartControls 30'/45') → lỗi → ContinueBlock (phiên dở, 1 chạm)
 *   → BaselineBanner → SessionPlan (4 bước) → DueVocabTeaser
 *   → RecommendedCard (gợi ý + lý do) → danh sách đổi bài → QuickLinks.
 * Dữ liệu: GET /api/v1/today qua useTodayRecommendation (contract-locked).
 */
import { useState } from "react";
import Link from "next/link";
import { EmptyState, Spinner } from "@/components/ui";
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
import { QuickLinks } from "./quick-links";
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

  // Bài được chọn khi "Đổi bài khác" — gắn với payload đã chọn nó để khi
  // dữ liệu gợi ý mới về (đổi 30'/45', retry) selection tự hết hiệu lực
  // mà không cần setState trong effect.
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
    // Bài thay thế luôn bắt đầu phiên mới (không có nháp/revision đi kèm).
    setSelection({
      dataRef: data,
      activity: { ...alt, actionType: "new_session" },
    });
    setShowAlternates(false);
  };

  return (
    <PageContainer className="space-y-6">
      <TodayHero
        displayName={displayName}
        streakDays={data?.streakDays ?? null}
        targetMinutes={targetMinutes}
        onSelectMinutes={selectTargetMinutes}
      />

      {error && !loading && <TodayErrorCard message={error} onRetry={retry} />}

      {data?.inProgressSession && (
        <ContinueBlock session={data.inProgressSession} />
      )}

      {data && data.baselineStatus !== "completed" && <BaselineBanner />}

      {data && data.dailyPlan.length > 0 && (
        <SessionPlan
          steps={data.dailyPlan}
          targetMinutes={targetMinutes}
          onStartMain={
            currentActivity ? () => startSession(currentActivity) : undefined
          }
          starting={starting}
        />
      )}

      {data && <DueVocabTeaser count={data.dueVocabCount} />}

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-xs">
          <Spinner size="lg" className="mb-3 inline-block text-teal-600" />
          <p className="text-sm font-medium text-slate-500">
            Đang tính toán bài học tối ưu cho bạn...
          </p>
        </div>
      ) : currentActivity ? (
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
      ) : (
        data && (
          <EmptyState
            icon="book-open"
            title="Chưa có bài học nào được duyệt trong Thư viện"
            description="Hệ thống chỉ gợi ý các bài học đã ở trạng thái Đã duyệt. Hãy vào Thư viện hoặc trang Quản trị để kiểm tra bài học."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/library"
                  className="flex min-h-11 cursor-pointer items-center rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                >
                  Mở Thư viện bài học →
                </Link>
                <Link
                  href="/admin"
                  className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
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

      <QuickLinks />
    </PageContainer>
  );
}
