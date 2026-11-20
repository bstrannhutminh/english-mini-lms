"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PlanStep, PlanStepStatus } from "@/contracts/today";
export interface SessionPlanProps {
  steps: PlanStep[];
  targetMinutes: 30 | 45;
}
const STATUS_LABEL: Record<PlanStepStatus, string> = { done: "Đã xong", current: "Bước hiện tại", upcoming: "Kế tiếp" };
export function SessionPlan({ steps, targetMinutes }: SessionPlanProps) {
  const doneCount = steps.filter((step) => step.status === "done").length;
  return (<section aria-label={`Chu trình phiên ${targetMinutes} phút`} className="rounded-xl border border-border bg-surface p-5 sm:p-6">

    <h2 className="text-lg font-semibold text-text">Buổi học {targetMinutes} phút</h2>

    <p className="mt-1 text-base text-text-secondary">{doneCount}/{steps.length} bước đã hoàn thành</p>

    <ol className="mt-4 divide-y divide-border-subtle">

      {steps.map((step, index) => {
        const content = <div className="flex min-h-11 items-start gap-3 py-4">
          <span aria-hidden="true" className={cn("mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base font-medium", step.status === "current" ? "bg-primary text-white" : "bg-surface-muted text-text-secondary")}>
            {step.status === "done" ? <Icon name="check" className="h-4 w-4" /> : index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap justify-between gap-x-2">
              <span className="text-base font-medium text-text">
                {step.title}
              </span>
              <span className="text-base tabular-nums text-text-secondary">{step.estimatedMinutes} phút</span>
            </div>
            <p className="mt-1 text-base leading-relaxed text-text-secondary">
              {step.description}
            </p>
            <span className="sr-only">
              {STATUS_LABEL[step.status]}
            </span>
          </div>
        </div>;
        return <li key={step.key} aria-current={step.status === "current" ? "step" : undefined}>
          {step.href ? <Link href={step.href} className="block rounded-lg no-underline transition hover:bg-surface-muted">
            {content}
          </Link> : content}
        </li>;
      })}

    </ol>

  </section>);
}
