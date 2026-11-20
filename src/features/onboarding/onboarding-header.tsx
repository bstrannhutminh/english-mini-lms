"use client";
import { cn } from "@/lib/utils";
export const ONBOARDING_STEPS = [{ key: "goals", label: "Mục tiêu" }, { key: "schedule", label: "Nhịp học" }, { key: "skills", label: "Kỹ năng" }, { key: "preview", label: "Xem lại" }] as const;
interface OnboardingHeaderProps {
  step: number;
  isReturning: boolean;
  skipping: boolean;
  saving: boolean;
  onSelectStep: (idx: number) => void;
  onSkipOrBack: () => void;
}
export function OnboardingHeader({ step, isReturning, skipping, saving, onSelectStep, onSkipOrBack }: OnboardingHeaderProps) {
  return (<>
    <header className="sticky top-0 z-20 border-b border-border bg-surface">

      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-base font-semibold text-text">Thiết lập buổi học</p>
          <p className="text-base text-text-secondary">Bước {step + 1} / {ONBOARDING_STEPS.length}</p>
        </div>
        <button type="button" onClick={onSkipOrBack} disabled={skipping || saving} className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-lg px-3 text-base font-medium text-text-secondary hover:bg-surface-muted disabled:opacity-60">
          {isReturning ? "Về Hôm nay" : skipping ? "Đang mở…" : "Bỏ qua"}
        </button>
      </div>

    </header>
    <nav aria-label="Các bước thiết lập" className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
      <ol className="grid grid-cols-4 gap-2">
        {ONBOARDING_STEPS.map((item, index) => <li key={item.key}>
          <button type="button" onClick={() => onSelectStep(index)} disabled={saving || skipping} aria-current={index === step ? "step" : undefined} className={cn("flex min-h-14 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-base transition disabled:opacity-60", index === step ? "border-primary bg-surface-muted font-medium text-primary-dark" : "border-border bg-surface text-text-secondary hover:border-primary")}>
            <span aria-hidden="true">
              {index + 1}
            </span>
            <span>
              {item.label}
            </span>
          </button>
        </li>)}
      </ol>
    </nav>
  </>);
}
