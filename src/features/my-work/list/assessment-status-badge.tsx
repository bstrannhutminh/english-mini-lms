import { Badge, Icon, Spinner, type BadgeTone, type IconName } from "@/components/ui";

/**
 * Nhãn trạng thái chấm của 1 bài nộp.
 * "not_assessed" là giá trị client suy ra khi chưa có assessment row.
 */
const STATUS_META: Record<
  string,
  { label: string; tone: BadgeTone; icon?: IconName; spinning?: boolean }
> = {
  feedback_ready: { label: "Đã có feedback", tone: "success", icon: "check-circle" },
  not_assessed: { label: "Chưa chấm", tone: "neutral", icon: "clock" },
  queued: { label: "Đang chấm", tone: "warning", spinning: true },
  processing: { label: "Đang chấm", tone: "warning", spinning: true },
  needs_input: { label: "Đã gắn cờ", tone: "info", icon: "flag" },
  failed: { label: "Lỗi chấm", tone: "error", icon: "alert-triangle" },
};

export function AssessmentStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: "neutral" as BadgeTone };
  return (
    <Badge tone={meta.tone}>
      {meta.spinning ? (
        <Spinner size="sm" label={meta.label} className="h-3 w-3" />
      ) : meta.icon ? (
        <Icon name={meta.icon} className="h-3.5 w-3.5" />
      ) : null}
      {meta.label}
    </Badge>
  );
}
