/**
 * ProgressView — trang Tiến độ (spec §3.2): chỉ trình bày bằng chứng thực
 * (phiên, phút thực học, độc lập/có hỗ trợ, lỗi lặp, so sánh bản sửa).
 * Không vẽ xu hướng khi < 3 bài nộp (invariant — banner InsufficientData).
 * Link Cài đặt đã chuyển vào menu "Tôi" (AppNav) nên header chỉ còn tiêu đề.
 */
import { PageContainer } from "@/components/layout";
import type { ProgressSummaryContract } from "@/contracts/progress";
import { ProgressStatCards } from "./progress-stat-cards";
import { InsufficientDataBanner } from "./insufficient-data-banner";
import { SkillBreakdownCard } from "./skill-breakdown-card";
import { RecurringErrorsCard } from "./recurring-errors-card";
import { RevisionComparisonsCard } from "./revision-comparisons-card";

export interface ProgressViewProps {
  initialSummary: ProgressSummaryContract;
}

export default function ProgressView({ initialSummary }: ProgressViewProps) {
  const summary = initialSummary;

  return (
    <PageContainer className="stagger space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Tiến độ</h1>
        <p className="mt-1 max-w-prose text-base leading-relaxed text-text-secondary">
          Bằng chứng thực tế từ việc học của bạn: thời lượng tập trung, điểm cần luyện và các bản sửa.
        </p>
      </header>

      <ProgressStatCards summary={summary} />

      {!summary.hasSufficientData ? (
        <InsufficientDataBanner totalSubmissions={summary.totalSubmissions} />
      ) : null}

      <SkillBreakdownCard summary={summary} />

      <div className="grid items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <RecurringErrorsCard summary={summary} />
        <RevisionComparisonsCard summary={summary} />
      </div>
    </PageContainer>
  );
}
