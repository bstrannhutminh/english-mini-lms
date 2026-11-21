import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Thanh 3 chặng dùng chung (phòng thu bài nói, tiến trình bài nghe):
 * chặng đã qua có dấu tích, chặng hiện tại tô teal, chặng sau mờ.
 */
export function StepProgress({
  steps,
  current,
  className,
}: {
  steps: readonly string[];
  /** Chặng hiện tại, bắt đầu từ 1. */
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-start", className)}>
      {steps.map((label, index) => {
        const num = index + 1;
        const done = current > num;
        const active = current === num;
        return (
          <li key={label} aria-current={active ? "step" : undefined} className="relative flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
            {index > 0 && (
              <span aria-hidden="true" className={cn("absolute right-1/2 top-3.5 mr-4 h-0.5 w-[calc(100%-2rem)] rounded-full", done || active ? "bg-primary" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                done ? "bg-primary text-white" : active ? "bg-primary-soft text-primary-dark ring-2 ring-primary" : "bg-surface-subtle text-text-muted",
              )}
            >
              {done ? <Icon name="check" className="h-3.5 w-3.5" /> : num}
            </span>
            <span className={cn("px-1 text-sm leading-tight", active ? "font-semibold text-primary-dark" : done ? "text-text-secondary" : "text-text-muted")}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
