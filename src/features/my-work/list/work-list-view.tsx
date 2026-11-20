"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SubmissionListItem } from "@/contracts/submission";
import { modeSkill, SKILL_INFO, type Skill } from "@/lib/modes";
import {
  Button,
  EmptyState,
  Icon,
  Skeleton,
  Tabs,
} from "@/components/ui";
import { getRevisionInfo } from "../revision-chain";
import { SubmissionCard } from "./submission-card";
import { useSubmissionList } from "./use-submission-list";

type ModeFilter = "all" | Skill;
type StatusFilter =
  | "all"
  | "feedback_ready"
  | "processing"
  | "not_assessed"
  | "needs_input"
  | "failed";

const MODE_TABS = [
  { value: "all" as ModeFilter, label: "Tất cả kỹ năng" },
  { value: "writing" as ModeFilter, label: SKILL_INFO.writing.shortLabel },
  { value: "reading" as ModeFilter, label: SKILL_INFO.reading.shortLabel },
  { value: "speaking" as ModeFilter, label: SKILL_INFO.speaking.shortLabel },
  { value: "listening" as ModeFilter, label: SKILL_INFO.listening.shortLabel },
];

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "feedback_ready", label: "Có góp ý" },
  { value: "processing", label: "Đang chấm" },
  { value: "not_assessed", label: "Chưa chấm" },
  { value: "needs_input", label: "Đã gắn cờ" },
  { value: "failed", label: "Lỗi chấm" },
];

function matchesStatus(item: SubmissionListItem, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "processing") {
    return item.assessmentStatus === "queued" || item.assessmentStatus === "processing";
  }
  return item.assessmentStatus === filter;
}

/** /my-work — danh sách bài nộp: bản đầu – trạng thái – chuỗi bản sửa. */
export function WorkListView() {
  const { submissions, loading, error, handleRetry } = useSubmissionList();
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

  const modeTabs = MODE_TABS.map((t) => ({
    value: t.value,
    label: t.label,
    count:
      t.value === "all"
        ? submissions.length
        : submissions.filter((s) => modeSkill(s.activityMode) === t.value).length,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-text">
          <Icon name="file-text" className="h-6 w-6 text-teal-700" />
          Bài của tôi
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          Xem lại tất cả bài tập đã nộp, trạng thái chấm của AI và lịch sử sửa bài.
        </p>
      </header>

      {/* Bộ lọc: kỹ năng (gộp IELTS vào skill gốc) + trạng thái chấm */}
      <div className="mb-6 space-y-3 border-b border-border pb-5">
        <Tabs
          variant="underline"
          aria-label="Lọc theo kỹ năng"
          tabs={modeTabs}
          value={modeFilter}
          onValueChange={(v) => setModeFilter(v as ModeFilter)}
          className="max-w-full overflow-x-auto"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 text-base text-text-secondary">
          <span className="font-medium">Trạng thái chấm:</span>
          {STATUS_TABS.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setStatusFilter(st.value)}
              aria-pressed={statusFilter === st.value}
              className={`min-h-11 cursor-pointer rounded-lg px-3 py-1 text-base font-medium transition ${
                statusFilter === st.value
                  ? "border border-primary bg-primary-soft text-primary-dark"
                  : "border border-border bg-surface text-text-secondary hover:bg-surface-muted"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-label="Đang tải danh sách bài làm">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
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
          title={
            submissions.length === 0
              ? "Bạn chưa có bài nộp nào"
              : "Không tìm thấy bài nộp phù hợp bộ lọc"
          }
          description={
            submissions.length === 0
              ? "Hãy vào Thư viện để bắt đầu bài tập đầu tiên và nhận phản hồi chi tiết từ AI."
              : "Hãy thử đổi bộ lọc kỹ năng hoặc trạng thái chấm để xem các bài khác."
          }
          action={
            submissions.length === 0 ? (
              <Link href="/library" className="inline-flex min-h-11">
                <Button>Khám phá Thư viện bài học</Button>
              </Link>
            ) : <Button variant="outline" onClick={() => { setModeFilter("all"); setStatusFilter("all"); }}>Xoá bộ lọc</Button>
          }
        />
      ) : (
        <>
        <p role="status" className="mb-4 text-base text-text-secondary">{filtered.length} bài nộp phù hợp</p>
        <div className="space-y-3">
          {filtered.map((item) => (
            <SubmissionCard
              key={item.id}
              item={item}
              revision={getRevisionInfo(item, submissions)}
            />
          ))}
        </div>
        </>
      )}
    </div>
  );
}
