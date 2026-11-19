"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export const ONBOARDING_STEPS = [
  { key: "goals", label: "Mục tiêu" },
  { key: "schedule", label: "Nhịp học" },
  { key: "skills", label: "4 kỹ năng" },
  { key: "preview", label: "Lộ trình" },
] as const;

interface OnboardingHeaderProps {
  step: number;
  isReturning: boolean;
  skipping: boolean;
  saving: boolean;
  onSelectStep: (idx: number) => void;
  onSkipOrBack: () => void;
}

/** Thanh đầu Focus Mode + thanh tiến độ + 4 tab bước cho Onboarding Wizard. */
export function OnboardingHeader({
  step,
  isReturning,
  skipping,
  saving,
  onSelectStep,
  onSkipOrBack,
}: OnboardingHeaderProps) {
  const progressPct = Math.round(((step + 1) / ONBOARDING_STEPS.length) * 100);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-bold tracking-wider text-white shadow-xs">
              MD
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-text">
                Thiết lập lộ trình
              </p>
              <p className="text-xs text-text-muted">
                Bước {step + 1}/{ONBOARDING_STEPS.length} ·{" "}
                {ONBOARDING_STEPS[step].label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkipOrBack}
            disabled={skipping || saving}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl px-3 text-sm font-medium text-text-secondary transition hover:bg-slate-100 hover:text-text disabled:opacity-60"
          >
            {isReturning
              ? "Về Hôm nay"
              : skipping
                ? "Đang mở..."
                : "Bỏ qua, vào học ngay"}
          </button>
        </div>

        <div className="h-1 w-full bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-5">
        <ol className="grid grid-cols-4 gap-2" aria-label="Các bước thiết lập">
          {ONBOARDING_STEPS.map((item, idx) => {
            const done = idx < step;
            const current = idx === step;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onSelectStep(idx)}
                  className={cn(
                    "flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition",
                    current
                      ? "border-primary bg-teal-50 text-primary-dark"
                      : done
                        ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
                        : "border-border bg-surface text-text-muted hover:text-text"
                  )}
                >
                  {done ? (
                    <Icon
                      name="check"
                      className="h-3.5 w-3.5 text-emerald-600"
                    />
                  ) : (
                    <span>{idx + 1}.</span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
