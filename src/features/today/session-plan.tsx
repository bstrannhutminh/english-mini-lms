"use client";
import Link from "next/link";
import { Icon, ProgressRing } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PlanStep, PlanStepStatus } from "@/contracts/today";

export interface SessionPlanProps { steps: PlanStep[]; targetMinutes: 30 | 45; }
const STATUS_LABEL: Record<PlanStepStatus, string> = {
  done: "Đã hoàn thành", current: "Bước hiện tại", upcoming: "Tiếp theo",
};

/**
 * Lộ trình buổi học: 4 bước nối nhau (dọc trên điện thoại, ngang từ md).
 * Bước hiện tại hiện kèm lý do; mỗi bước có đích là một deep-link.
 */
export function SessionPlan({ steps, targetMinutes }: SessionPlanProps) {
  const doneCount = steps.filter((step) => step.status === "done").length;
  return (
    <section aria-label={`Chu trình phiên ${targetMinutes} phút`} className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-text">Lộ trình {targetMinutes} phút</h2>
          <p className="text-base text-text-secondary">{doneCount}/{steps.length} bước đã hoàn thành hôm nay</p>
        </div>
        <ProgressRing value={doneCount} max={steps.length} size={48} strokeWidth={5} label={`${doneCount} trên ${steps.length} bước`}>
          <span className="text-sm font-semibold tabular-nums text-text">{doneCount}/{steps.length}</span>
        </ProgressRing>
      </div>
      <ol id="today-plan-steps" className="mt-5 grid gap-0 md:grid-cols-4 md:gap-3">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const content = (
            <div className="relative flex min-h-11 gap-3 pb-5 md:flex-col md:gap-3 md:pb-0">
              {!isLast && (
                <span aria-hidden="true" className={cn(
                  "absolute left-4 top-9 bottom-1 w-px md:left-10 md:right-[-0.75rem] md:top-4 md:bottom-auto md:h-px md:w-auto",
                  step.status === "done" ? "bg-primary" : "bg-border"
                )} />
              )}
              <span aria-hidden="true" className={cn(
                "relative z-[1] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                step.status === "current" ? "bg-primary text-white ring-4 ring-primary-soft"
                  : step.status === "done" ? "bg-primary-soft text-primary-dark"
                  : "border border-border-strong bg-surface text-text-secondary"
              )}>
                {step.status === "done" ? <Icon name="check" className="h-4 w-4" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <span className={cn("block break-words text-base", step.status === "current" ? "font-semibold text-text" : "font-medium text-text")}>{step.title}</span>
                <span className="text-sm tabular-nums text-text-muted">{step.estimatedMinutes} phút</span>
                <p className={cn("mt-1 text-base leading-relaxed text-text-secondary", step.status !== "current" && "hidden md:line-clamp-3 md:block md:text-sm")}>{step.description}</p>
                <span className="sr-only">{STATUS_LABEL[step.status]}</span>
              </div>
            </div>
          );
          return (
            <li key={step.key} aria-current={step.status === "current" ? "step" : undefined} className="min-w-0">
              {step.href ? <Link href={step.href} className="block h-full rounded-xl no-underline transition-colors md:-m-2 md:p-2 md:hover:bg-surface-muted">{content}</Link> : content}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
