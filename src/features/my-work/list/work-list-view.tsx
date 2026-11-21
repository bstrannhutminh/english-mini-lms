"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SubmissionListItem } from "@/contracts/submission";
import { modeSkill } from "@/lib/modes";
import { PageContainer } from "@/components/layout";
import { Button, EmptyState, Icon } from "@/components/ui";
import { getRevisionInfo } from "../revision-chain";
import { SubmissionCard } from "./submission-card";
import { SubmissionListSkeleton } from "./submission-list-skeleton";
import { useSubmissionList } from "./use-submission-list";
import {
  MODE_FILTERS,
  STATUS_FILTERS,
  WorkListFilters,
  type ModeFilter,
  type StatusFilter,
} from "./work-list-filters";

function matchesStatus(item: SubmissionListItem, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "processing") {
    return item.assessmentStatus === "queued" || item.assessmentStatus === "processing";
  }
  return item.assessmentStatus === filter;
}

export interface WorkListViewProps {
  /** Danh sách server render sẵn — có thì không có skeleton/fetch lần đầu. */
  initialData?: SubmissionListItem[];
}

/** /my-work — danh sách bài nộp: kỹ năng – trạng thái chấm – chuỗi bản sửa. */
export function WorkListView({ initialData }: WorkListViewProps) {
  const { submissions, loading, error, handleRetry } = useSubmissionList(initialData);
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(
    () =>
      submissions.filter((s) => {
        if (modeFilter !== "all" && modeSkill(s.activityMode) !== modeFilter) {
          return false;
        }
        return matchesStatus(s, statusFilter);
      }),
    [submissions, modeFilter, statusFilter]
  );

  const modeOptions = MODE_FILTERS.map((option) => ({
    ...option,
    count:
      option.value === "all"
        ? submissions.length
        : submissions.filter((s) => modeSkill(s.activityMode) === option.value).length,
  }));

  // Chỉ hiện chip trạng thái đang có bài (và chip đang chọn) để hàng lọc gọn.
  const statusOptions = STATUS_FILTERS.map((option) => ({
    ...option,
    count: submissions.filter((s) => matchesStatus(s, option.value)).length,
  })).filter((option) => option.value === "all" || option.count > 0 || option.value === statusFilter);

  const isEmpty = submissions.length === 0;

  return (
    <PageContainer className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Bài của tôi</h1>
        <p className="mt-1 text-base leading-relaxed text-text-secondary">
          Mở lại bài đã nộp để đọc góp ý và sửa thành bản tốt hơn.
        </p>
      </header>

      {!isEmpty ? (
        <WorkListFilters
          modeOptions={modeOptions}
          statusOptions={statusOptions}
          mode={modeFilter}
          status={statusFilter}
          onModeChange={setModeFilter}
          onStatusChange={setStatusFilter}
        />
      ) : null}

      {loading ? (
        <SubmissionListSkeleton />
      ) : error ? (
        <EmptyState
          icon="alert-triangle"
          title="Không tải được danh sách bài làm"
          description={error}
          action={
            <Button variant="outline" onClick={handleRetry}>
              <Icon name="refresh" className="h-4 w-4" />
              Thử lại
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="file-text"
          title={isEmpty ? "Bạn chưa có bài nộp nào" : "Không có bài nộp nào khớp bộ lọc"}
          description={
            isEmpty
              ? "Làm bài đầu tiên trong Thư viện để nhận góp ý chi tiết từ AI — bài nộp sẽ xuất hiện tại đây."
              : "Thử đổi kỹ năng hoặc trạng thái chấm để xem các bài khác."
          }
          action={
            isEmpty ? (
              <Link href="/library" className="pressable inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-white shadow-card hover:bg-primary-dark">
                Mở Thư viện bài học
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            ) : (
              <Button variant="outline" onClick={() => { setModeFilter("all"); setStatusFilter("all"); }}>
                Xoá bộ lọc
              </Button>
            )
          }
        />
      ) : (
        <>
          <p role="status" className="text-sm text-text-muted">
            {filtered.length === submissions.length
              ? `${submissions.length} bài nộp · mới nhất trước`
              : `${filtered.length}/${submissions.length} bài nộp khớp bộ lọc`}
          </p>
          <div className="stagger grid items-start gap-3 lg:grid-cols-2 lg:gap-4">
            {filtered.map((item) => (
              <SubmissionCard key={item.id} item={item} revision={getRevisionInfo(item, submissions)} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
