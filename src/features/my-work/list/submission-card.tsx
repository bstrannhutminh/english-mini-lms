import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { SubmissionListItem } from "@/contracts/submission";
import { AssessmentStatusBadge } from "./assessment-status-badge";
import type { RevisionInfo } from "../revision-chain";

interface SubmissionCardProps {
  item: SubmissionListItem;
  revision: RevisionInfo;
}

function formatSubmittedAt(value: string): string {
  const d = new Date(value);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} · ${d.toLocaleDateString("vi-VN")}`;
}

/** Thẻ 1 bài nộp trong danh sách — link tới trang chi tiết /my-work/[id]. */
export function SubmissionCard({ item, revision }: SubmissionCardProps) {
  const meta = modeMeta(item.activityMode);

  return (
    <Link
      href={`/my-work/${item.id}`}
      className="group block rounded-xl border border-border bg-surface p-5 no-underline transition hover:border-primary hover:bg-primary-soft/30"
    >
      {/* Hàng meta: mode chip + IELTS + Bản n/m + assisted + trạng thái chấm */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-base font-bold ${meta.badgeClass}`}
          >
            <Icon name={meta.icon} className="h-3.5 w-3.5" />
            {item.activitySlot ? `${item.activitySlot} · ` : ""}
            {meta.shortLabel}
          </span>
          {meta.isIelts ? <Badge tone="neutral">IELTS</Badge> : null}

          <Badge tone="neutral">
            Bản {revision.position}
            {revision.chainLength > 1 ? `/${revision.chainLength}` : ""}
          </Badge>
          {revision.childId ? (
            <Badge tone="info" title="Đã có bản sửa mới hơn">
              đã sửa → Bản {revision.position + 1}
            </Badge>
          ) : null}
          {revision.parentId ? (
            <Badge tone="neutral" title="Bản sửa từ bản trước">
              ← sửa từ Bản {revision.position - 1}
            </Badge>
          ) : null}

          {item.assisted ? (
            <Badge tone="warning" title="Bài có dùng gợi ý/đáp án trước khi nộp">
              Có hỗ trợ
            </Badge>
          ) : (
            <Badge tone="success" title="Bài làm không dùng gợi ý">
              Độc lập
            </Badge>
          )}
        </div>

        <AssessmentStatusBadge status={item.assessmentStatus} />
      </div>

      <h2 className="mb-3 break-words text-lg font-semibold leading-snug text-text transition group-hover:text-primary-dark">
        {item.activityTitle}
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-base text-text-secondary">
        <span>Nộp lúc {formatSubmittedAt(item.submittedAt)}</span>
        <span className="flex items-center gap-1 font-semibold text-teal-700 transition-transform group-hover:translate-x-0.5">
          Xem bài làm & nhận xét
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
