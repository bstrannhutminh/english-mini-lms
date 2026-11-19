"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import {
  submissionListResponseSchema,
  type SubmissionListItem,
} from "@/contracts/submission";
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
  { value: "feedback_ready", label: "Có feedback" },
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
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchList = useCallback(
    () =>
      apiFetch("/api/v1/submissions", undefined, submissionListResponseSchema),
    []
  );

  // Fetch khi mount — setState chỉ trong callback promise (rule react-hooks).
  useEffect(() => {
    let cancelled = false;
    fetchList()
      .then((data) => {
        if (!cancelled) {
          setSubmissions(data.submissions);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchList]);

  // "Thử lại" — setState trong event handler được phép.
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchList()
      .then((data) => {
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        setLoading(false);
      });
  };

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
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-4 lg:max-w-5xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-text">
          <Icon name="file-text" className="h-6 w-6 text-teal-700" />
          Bài của tôi
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Xem lại tất cả bài tập đã nộp, trạng thái chấm của AI và lịch sử sửa bài.
        </p>
      </header>

      {/* Bộ lọc: kỹ năng (gộp IELTS vào skill gốc) + trạng thái chấm */}
      <div className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-xs">
        <Tabs
          variant="pills"
          aria-label="Lọc theo kỹ năng"
          tabs={modeTabs}
          value={modeFilter}
          onValueChange={(v) => setModeFilter(v as ModeFilter)}
          className="overflow-x-auto"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 text-xs text-text-secondary">
          <span className="font-medium">Trạng thái chấm:</span>
          {STATUS_TABS.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setStatusFilter(st.value)}
              className={`min-h-9 cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition ${
                statusFilter === st.value
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
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
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
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
              <Link href="/library">
                <Button>Khám phá Thư viện bài học</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <SubmissionCard
              key={item.id}
              item={item}
              revision={getRevisionInfo(item, submissions)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
