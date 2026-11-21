"use client";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export const ONBOARDING_STEPS = [
  { key: "goals", label: "Mục tiêu", description: "Những điều bạn muốn làm được" },
  { key: "schedule", label: "Nhịp học", description: "Thời gian và tài liệu của bạn" },
  { key: "skills", label: "Kỹ năng", description: "Chọn mức gần với mình nhất" },
  { key: "preview", label: "Xem lại", description: "Sẵn sàng cho buổi học đầu tiên" },
] as const;

interface OnboardingHeaderProps {
  isReturning: boolean;
  skipping: boolean;
  saving: boolean;
  onSkipOrBack: () => void;
}

export function OnboardingHeader({ isReturning, skipping, saving, onSkipOrBack }: OnboardingHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="min-w-0 text-base font-semibold tracking-tight text-text">Không gian học của bạn</p>
        <button type="button" onClick={onSkipOrBack} disabled={skipping || saving}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-lg px-2 text-base font-medium text-text-secondary hover:bg-surface-muted disabled:opacity-60">
          {isReturning ? "Về Hôm nay" : skipping ? "Đang mở…" : "Bỏ qua"}
        </button>
      </div>
    </header>
  );
}

/** The current step stays compact on a phone and becomes a quiet progress rail on desktop. */
export function OnboardingProgress({ step, disabled, onSelectStep }: {
  step: number;
  disabled: boolean;
  onSelectStep: (idx: number) => void;
}) {
  return (
    <nav aria-label="Các bước thiết lập" className="min-w-0 lg:sticky lg:top-8">
      <p className="mb-3 text-base font-medium text-text-secondary lg:mb-6">Bước {step + 1} / {ONBOARDING_STEPS.length}</p>
      <ol className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-4">
        {ONBOARDING_STEPS.map((item, index) => (
          <li key={item.key}>
            <button type="button" onClick={() => onSelectStep(index)} disabled={disabled}
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "flex min-h-14 w-full cursor-pointer flex-col items-center gap-2 rounded-lg py-2 text-base transition-colors disabled:opacity-60 lg:flex-row lg:items-start lg:gap-3 lg:text-left",
                index === step ? "font-semibold text-primary-dark" : "text-text-secondary hover:text-primary-dark"
              )}>
              <span aria-hidden="true" className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base",
                index === step ? "border-primary bg-primary text-white" : "border-border-strong bg-surface"
              )}>{index + 1}</span>
              <span className="min-w-0">
                <span className="block leading-snug">{item.label}</span>
                <span className="mt-1 hidden text-base font-normal leading-relaxed text-text-muted lg:block">{item.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-8 hidden max-w-prose border-t border-border pt-5 text-base leading-relaxed text-text-secondary lg:block">
        <Icon name="book-open" className="mb-3 h-5 w-5 text-primary-dark" />Một vài lựa chọn để bắt đầu theo nhịp của bạn.
      </p>
    </nav>
  );
}
