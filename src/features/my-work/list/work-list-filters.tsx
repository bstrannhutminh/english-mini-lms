import { SKILL_INFO, type Skill } from "@/lib/modes";
import { cn } from "@/lib/utils";

export type ModeFilter = "all" | Skill;
export type StatusFilter =
  | "all"
  | "feedback_ready"
  | "processing"
  | "not_assessed"
  | "needs_input"
  | "failed";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count: number;
}

export const MODE_FILTERS: { value: ModeFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  ...(["writing", "reading", "speaking", "listening"] as const).map((skill) => ({
    value: skill,
    label: SKILL_INFO[skill].shortLabel,
  })),
];

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Mọi trạng thái" },
  { value: "feedback_ready", label: "Có góp ý" },
  { value: "processing", label: "Đang chấm" },
  { value: "not_assessed", label: "Chưa chấm" },
  { value: "needs_input", label: "Đã gắn cờ" },
  { value: "failed", label: "Lỗi chấm" },
];

interface WorkListFiltersProps {
  modeOptions: FilterOption<ModeFilter>[];
  statusOptions: FilterOption<StatusFilter>[];
  mode: ModeFilter;
  status: StatusFilter;
  onModeChange: (mode: ModeFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
}

/** Dải cuộn ngang tràn mép trên mobile (một hàng, không xuống dòng). */
const STRIP = "scroll-strip -mx-5 flex px-5 sm:mx-0 sm:px-0";

/**
 * Bộ lọc /my-work: tab kỹ năng (IELTS gộp vào kỹ năng gốc) + chip trạng thái
 * chấm — mỗi nhóm đúng MỘT hàng, cuộn ngang trên mobile. Vùng chạm ≥44px.
 */
export function WorkListFilters({ modeOptions, statusOptions, mode, status, onModeChange, onStatusChange }: WorkListFiltersProps) {
  return (
    <div className="space-y-2">
      <div role="group" aria-label="Lọc theo kỹ năng" className={cn(STRIP, "gap-1 border-b border-border")}>
        {modeOptions.map((option) => {
          const selected = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              aria-pressed={selected}
              className={cn(
                "-mb-px inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-base font-medium transition-colors",
                selected ? "border-primary text-primary-dark" : "border-transparent text-text-secondary hover:text-text"
              )}
            >
              <span>{option.label}</span>
              <span className={cn("rounded-full px-1.5 text-xs font-semibold leading-5 tabular-nums", selected ? "bg-primary-soft text-primary-dark" : "bg-surface-subtle text-text-muted")}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>

      {statusOptions.length > 2 ? (
        <div role="group" aria-label="Lọc theo trạng thái chấm" className={cn(STRIP, "gap-2")}>
          {statusOptions.map((option) => {
            const selected = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                aria-pressed={selected}
                className="group inline-flex min-h-11 shrink-0 cursor-pointer items-center"
              >
                <span
                  className={cn(
                    "pressable inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-base font-medium",
                    selected
                      ? "border-primary bg-primary-soft text-primary-dark"
                      : "border-border bg-surface text-text-secondary group-hover:border-border-strong group-hover:text-text"
                  )}
                >
                  {option.label}
                  {option.value !== "all" ? <span className="text-sm tabular-nums opacity-70">{option.count}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
