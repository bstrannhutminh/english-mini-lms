"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PlanStep, PlanStepStatus } from "@/contracts/today";

export interface SessionPlanProps {
  steps: PlanStep[];
  targetMinutes: 30 | 45;
}

const STEP_ICON: Record<PlanStep["key"], IconName> = {
  warmup: "sparkles",
  main: "play",
  revise: "pen",
  wrapup: "bar-chart",
};

const STATUS_STYLE: Record<
  PlanStepStatus,
  { badge: string; card: string; circle: string; label: string }
> = {
  done: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    card: "border-border-subtle bg-surface-muted/60",
    circle: "bg-emerald-600 text-white",
    label: "Xong",
  },
  current: {
    badge: "bg-teal-50 text-primary-dark border-teal-200",
    card: "border-primary/40 bg-teal-50/40",
    circle: "bg-primary text-white",
    label: "Đang tới",
  },
  upcoming: {
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    card: "border-border bg-surface",
    circle: "bg-slate-100 text-slate-500",
    label: "Kế tiếp",
  },
};

/**
 * Thanh chu trình học 4 bước gọn gàng (Ôn từ → Bài chính → Sửa bài → Tiến độ):
 * hiển thị trực quan tiến trình trong ngày mà không trùng nút CTA với bài chính.
 */
export function SessionPlan({ steps, targetMinutes }: SessionPlanProps) {
  const doneCount = steps.filter((s) => s.status === "done").length;

  return (
    <section
      aria-label={`Chu trình phiên ${targetMinutes} phút`}
      className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5"
    >
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-text">
          <Icon name="compass" className="h-4 w-4 text-primary" />
          Chu trình hôm nay ({targetMinutes} phút)
        </h2>
        <span className="text-xs font-medium tabular-nums text-text-muted">
          Hoàn thành {doneCount}/{steps.length} bước
        </span>
      </div>

      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, idx) => {
          const st = STATUS_STYLE[step.status];
          const inner = (
            <div
              className={cn(
                "flex h-full min-h-14 flex-col justify-between gap-2 rounded-xl border p-3 transition",
                st.card,
                step.href && "hover:border-primary/60 hover:shadow-xs"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    st.circle
                  )}
                >
                  {step.status === "done" ? (
                    <Icon name="check" className="h-3.5 w-3.5" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    st.badge
                  )}
                >
                  {st.label}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text">
                    <Icon
                      name={STEP_ICON[step.key]}
                      className="h-3.5 w-3.5 text-text-muted"
                    />
                    {step.title}
                  </span>
                  <span className="text-xs tabular-nums text-text-muted">
                    ~{step.estimatedMinutes}&apos;
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            </div>
          );

          return (
            <li key={step.key}>
              {step.href ? (
                <Link href={step.href} className="block h-full no-underline">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
