"use client";

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
    <PageContainer size="wide" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Tiến độ
        </h1>
        <p className="page-description">
          Theo dõi bằng chứng thực tế: thời lượng tập trung, lỗi lặp và các bản
          sửa bài cải thiện.
        </p>
      </div>

      {!summary.hasSufficientData && <InsufficientDataBanner />}

      <ProgressStatCards summary={summary} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <SkillBreakdownCard summary={summary} />
        <RecurringErrorsCard summary={summary} />
      </div>

      <RevisionComparisonsCard summary={summary} />
    </PageContainer>
  );
}
