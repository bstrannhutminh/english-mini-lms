import { Icon } from "@/components/ui";
import type { LearningStatus } from "@/contracts/library";

/**
 * Trạng thái học của một bài trong Thư viện (Chưa học / Đang học dở / Đã nộp n lần).
 * Giữ nguyên quy tắc cũ: đang dở ưu tiên, sau đó tới số lần nộp.
 */
export function ActivityStatusChip({ learningStatus, submissionCount }: {
  learningStatus?: LearningStatus;
  submissionCount: number;
}) {
  if (learningStatus === "in_progress") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-900">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />Đang học dở
      </span>
    );
  }
  if (submissionCount > 0 || learningStatus === "completed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800">
        <Icon name="check" className="h-3.5 w-3.5" />Đã nộp{submissionCount > 0 ? ` ${submissionCount} lần` : ""}
      </span>
    );
  }
  return <span className="inline-flex min-h-7 shrink-0 items-center text-sm text-text-muted">Chưa học</span>;
}
