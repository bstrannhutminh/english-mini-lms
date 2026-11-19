"use client";

/**
 * SessionPlan — khối 2 của hub Hôm nay (spec §3.3): kế hoạch phiên 30'/45'
 * gồm 4 bước Ôn từ → Bài chính → Sửa/vận dụng → Kết thúc (buildDailyPlan).
 * Mỗi bước là deep-link (bỏ qua được); bước "Bài chính" đang tới render nút
 * Bắt đầu gọi thẳng flow tạo phiên — giữ invariant "≤ 2 chạm vào bài".
 */
import Link from "next/link";
import { Badge, Button, Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PlanStep, PlanStepStatus } from "@/contracts/today";

export interface SessionPlanProps {
  steps: PlanStep[];
  targetMinutes: 30 | 45;
  /** Có bài gợi ý để bắt đầu trực tiếp → bước "main" hiện nút Bắt đầu. */
  onStartMain?: () => void;
  starting?: boolean;
}

const STEP_ICON: Record<PlanStep["key"], IconName> = {
  warmup: "sparkles",
  main: "play",
  revise: "pen",
  wrapup: "bar-chart",
};

const STATUS_META: Record<
  PlanStepStatus,
  { chip: string; chipClass: string; rowClass: string }
> = {
  done: {
    chip: "Đã xong",
    chipClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rowClass: "border-slate-100 bg-slate-50/50",
  },
  current: {
    chip: "Tiếp theo",
    chipClass: "border-teal-200 bg-teal-50 text-teal-700",
    rowClass: "border-teal-200/80 bg-teal-50/40",
  },
  upcoming: {
    chip: "Chờ",
    chipClass: "border-slate-200 bg-slate-50 text-slate-500",
    rowClass: "border-slate-100",
  },
};

export function SessionPlan({
  steps,
  targetMinutes,
  onStartMain,
  starting = false,
}: SessionPlanProps) {
  return (
    <section
      aria-label={`Kế hoạch phiên ${targetMinutes} phút`}
      className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon name="compass" className="h-4 w-4 text-teal-600" />
          Kế hoạch phiên {targetMinutes} phút
        </h2>
        <span className="text-[11px] font-medium text-slate-400">
          Bấm vào từng bước để đi thẳng tới
        </span>
      </div>

      <ol className="space-y-2">
        {steps.map((step, idx) => {
          const meta = STATUS_META[step.status];
          const isMainCurrent = step.key === "main" && step.status === "current";

          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition",
                meta.rowClass
              )}
            >
              {/* Chỉ báo thứ tự / trạng thái */}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  step.status === "done"
                    ? "bg-emerald-100 text-emerald-700"
                    : step.status === "current"
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-400"
                )}
                aria-hidden="true"
              >
                {step.status === "done" ? (
                  <Icon name="check" className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </span>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Icon
                    name={STEP_ICON[step.key]}
                    className="h-3.5 w-3.5 text-slate-400"
                  />
                  <span className="text-sm font-semibold text-slate-900">
                    {step.title}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-400">
                    ~{step.estimatedMinutes}&prime;
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      meta.chipClass
                    )}
                  >
                    {meta.chip}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>

              {/* Hành động của bước: deep-link; riêng "Bài chính" có thể start trực tiếp */}
              {isMainCurrent && onStartMain ? (
                <Button
                  size="md"
                  onClick={onStartMain}
                  loading={starting}
                  className="shrink-0"
                  data-tour="today-start"
                >
                  Bắt đầu
                </Button>
              ) : step.href ? (
                <Link
                  href={step.href}
                  aria-label={`Mở bước ${step.title}`}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-teal-700"
                >
                  <Icon name="chevron-right" className="h-5 w-5" />
                </Link>
              ) : (
                <Badge tone="neutral" className="shrink-0">
                  Chưa mở
                </Badge>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
