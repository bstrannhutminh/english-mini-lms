"use client";

import Link from "next/link";
import { Badge, Button, Icon, Tabs } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { ActivityMeta, SubmissionDetail } from "../types";

interface DetailHeaderProps {
  activity: ActivityMeta;
  submission: SubmissionDetail;
  hasParent: boolean;
  activeTab: "current" | "compare";
  onTabChange: (tab: "current" | "compare") => void;
  onStartRevision: () => void;
  isCreatingRevision: boolean;
}

function formatSubmittedAt(value: string | Date): string {
  const d = new Date(value);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} ngày ${d.toLocaleDateString("vi-VN")}`;
}

/** Đầu trang chi tiết: điều hướng, chip meta, tiêu đề, CTA Sửa ngay + tab So sánh. */
export function DetailHeader({
  activity,
  submission,
  hasParent,
  activeTab,
  onTabChange,
  onStartRevision,
  isCreatingRevision,
}: DetailHeaderProps) {
  const meta = modeMeta(activity.mode);
  // Động từ CTA theo kỹ năng: Nói lại / Làm lại / Sửa ngay (viết)
  const actionVerb =
    meta.skill === "speaking" ? "Nói lại" : meta.skill === "writing" ? "Sửa ngay" : "Làm lại";
  const actionIcon = meta.skill === "speaking" ? "mic" : "pen";

  return (
    <>
      <nav
        aria-label="Điều hướng"
        className="mb-3.5 flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/my-work"
            className="inline-flex min-h-11 items-center gap-1 text-text-secondary no-underline hover:text-text"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Bài của tôi
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            ·
          </span>
          <Link
            href="/library"
            className="inline-flex min-h-11 items-center text-text-secondary no-underline hover:text-text"
          >
            Thư viện
          </Link>
        </div>
        <Link href="/today" className="no-underline">
          <Button variant="outline" size="sm">
            Bài tiếp theo
            <Icon name="arrow-right" className="h-4 w-4" />
          </Button>
        </Link>
      </nav>

      <header className="mb-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-bold ${meta.badgeClass}`}
            >
              <Icon name={meta.icon} className="h-3.5 w-3.5" />
              {activity.slot || activity.id} · Bản {submission.revision}
            </span>
            {meta.isIelts ? <Badge tone="neutral">IELTS</Badge> : null}
            {submission.assisted ? (
              <Badge tone="warning" title="Bài có dùng gợi ý/đáp án trước khi nộp">
                Có hỗ trợ
              </Badge>
            ) : (
              <Badge tone="success" title="Bài làm không dùng gợi ý">
                Tự làm độc lập
              </Badge>
            )}
          </div>
          <span className="text-xs text-text-muted">
            Nộp lúc {formatSubmittedAt(submission.submittedAt)}
          </span>
        </div>

        <h1 className="mb-3 text-xl font-bold leading-snug text-text">
          {activity.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={onStartRevision} loading={isCreatingRevision}>
            <Icon name={actionIcon} className="h-4 w-4" />
            {isCreatingRevision
              ? "Đang mở phiên…"
              : `${actionVerb} (Bản ${submission.revision + 1})`}
          </Button>

          {hasParent ? (
            <Tabs
              variant="pills"
              aria-label="Chọn chế độ xem bản"
              value={activeTab}
              onValueChange={(v) => onTabChange(v as "current" | "compare")}
              tabs={[
                { value: "current", label: `Bản ${submission.revision}` },
                {
                  value: "compare",
                  label: `So sánh Bản ${submission.revision - 1} & ${submission.revision}`,
                },
              ]}
            />
          ) : null}
        </div>
      </header>
    </>
  );
}
