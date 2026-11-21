import Link from "next/link";
import { Icon, SkillTile } from "@/components/ui";
import { modeMeta } from "@/lib/modes";
import type { SubmissionListItem } from "@/contracts/submission";
import { formatSubmittedAt } from "@/lib/format-submitted-at";
import { AssessmentStatusBadge } from "./assessment-status-badge";
import type { RevisionInfo } from "../revision-chain";

interface SubmissionCardProps {
  item: SubmissionListItem;
  revision: RevisionInfo;
}

/**
 * Một bài nộp trong danh sách — cả thẻ là MỘT link tới trang góp ý.
 * Dòng meta: slot · Bản n · độc lập/có hỗ trợ · thời gian; hàng cuối: trạng
 * thái chấm + gợi ý chuỗi bản sửa (mọi dữ kiện lấy từ dữ liệu, không suy diễn).
 */
export function SubmissionCard({ item, revision }: SubmissionCardProps) {
  const meta = modeMeta(item.activityMode);
  const versionLabel = `Bản ${revision.position}${revision.chainLength > 1 ? `/${revision.chainLength}` : ""}`;
  const submittedAt = formatSubmittedAt(item.submittedAt);
  const chainHint = revision.childId
    ? `Đã có Bản ${revision.position + 1} mới hơn`
    : revision.parentId
      ? `Sửa từ Bản ${revision.position - 1}`
      : null;

  return (
    <Link
      href={`/my-work/${item.id}`}
      className="card-lift pressable group flex items-start gap-3.5 rounded-2xl border border-border bg-surface p-4 sm:gap-4 sm:p-5"
    >
      <SkillTile mode={item.activityMode} size="md" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">
          {meta.shortLabel}
          {meta.isIelts ? " · IELTS luyện tập" : ""}
        </p>
        <h2 className="mt-0.5 break-words text-lg font-semibold leading-snug text-text group-hover:text-primary-dark">
          {item.activityTitle}
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {item.activitySlot ? `${item.activitySlot} · ` : ""}
          {versionLabel} · {item.assisted ? "Có hỗ trợ" : "Tự làm độc lập"}
          {/* ≥sm: thời gian nằm cùng dòng meta; mobile: xuống hàng trạng thái để không gãy dòng */}
          <span className="hidden sm:inline">
            {" · "}
            <time dateTime={item.submittedAt}>{submittedAt}</time>
          </span>
        </p>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 sm:justify-start">
          <AssessmentStatusBadge status={item.assessmentStatus} />
          <time dateTime={item.submittedAt} className="text-sm text-text-muted sm:hidden">{submittedAt}</time>
          {chainHint ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
              <Icon name="layers" className="h-4 w-4" />
              {chainHint}
            </span>
          ) : null}
        </div>
      </div>
      <Icon name="chevron-right" className="mt-3 hidden h-5 w-5 shrink-0 sm:block text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-dark" />
    </Link>
  );
}
