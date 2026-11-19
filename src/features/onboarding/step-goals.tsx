"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  PRIORITY_CARDS,
  WORK_CONTEXT_CHIPS,
  type OnboardingDraft,
} from "./onboarding-presets";

interface StepGoalsProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

/** Bước 1 Onboarding: Tên hiển thị, mục tiêu ưu tiên và bối cảnh công việc. */
export function StepGoals({ draft, onChange }: StepGoalsProps) {
  function togglePriority(value: string) {
    const exists = draft.priorities.includes(value);
    const next = exists
      ? draft.priorities.filter((item) => item !== value)
      : [...draft.priorities, value];
    onChange({ priorities: next });
  }

  function appendChip(chip: string) {
    const current = draft.workContext.trim();
    if (current.toLowerCase().includes(chip.toLowerCase())) return;
    onChange({
      workContext: current ? `${current}. ${chip}.` : `${chip}.`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Chào mừng bạn đến với English Mini LMS
        </h2>
        <p className="mt-1.5 text-base leading-relaxed text-text-secondary">
          Chỉ mất khoảng 1 phút để cá nhân hoá bài gợi ý hằng ngày. Bạn có thể
          chỉnh lại bất cứ lúc nào trong phần Hồ sơ.
        </p>
      </div>

      {/* Tên hiển thị */}
      <div className="space-y-2">
        <label
          htmlFor="onboarding-display-name"
          className="block text-sm font-semibold text-text"
        >
          Ứng dụng nên gọi bạn là gì?
        </label>
        <input
          id="onboarding-display-name"
          type="text"
          value={draft.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder="Ví dụ: Bác sĩ Minh"
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-text transition placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Mục tiêu ưu tiên */}
      <div className="space-y-2.5">
        <div>
          <span className="block text-sm font-semibold text-text">
            Mục tiêu ưu tiên của bạn
          </span>
          <span className="text-sm text-text-muted">
            Chọn một hoặc nhiều mục tiêu bạn muốn tập trung trước
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PRIORITY_CARDS.map((card) => {
            const active = draft.priorities.includes(card.value);
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => togglePriority(card.value)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-primary bg-teal-50/70 shadow-xs"
                    : "border-border bg-surface hover:border-slate-300 hover:bg-slate-50/70"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    active
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Icon name={card.icon} className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-text">
                    {card.title}
                    {active && (
                      <Icon
                        name="check"
                        className="h-4 w-4 shrink-0 text-primary"
                      />
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">
                    {card.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bối cảnh chuyên môn */}
      <div className="space-y-2.5">
        <label
          htmlFor="onboarding-work-context"
          className="block text-sm font-semibold text-text"
        >
          Chuyên môn & tình huống dùng tiếng Anh (tuỳ chọn)
        </label>
        <div className="flex flex-wrap gap-2">
          {WORK_CONTEXT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => appendChip(chip)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3.5 py-2 text-xs font-medium text-text-secondary transition hover:border-primary/50 hover:bg-teal-50/50 hover:text-primary-dark"
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              {chip}
            </button>
          ))}
        </div>
        <textarea
          id="onboarding-work-context"
          value={draft.workContext}
          onChange={(e) => onChange({ workContext: e.target.value })}
          rows={3}
          placeholder="Mô tả ngắn chuyên khoa hoặc công việc thường ngày để AI đưa ví dụ sát thực tế..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base leading-relaxed text-text transition placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
