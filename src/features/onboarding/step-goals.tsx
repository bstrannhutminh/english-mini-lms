"use client";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PRIORITY_CARDS, WORK_CONTEXT_CHIPS, type OnboardingDraft } from "./onboarding-presets";
interface StepGoalsProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}
export function StepGoals({ draft, onChange }: StepGoalsProps) {
  function togglePriority(value: string) { onChange({ priorities: draft.priorities.includes(value) ? draft.priorities.filter((item) => item !== value) : [...draft.priorities, value] }); }
  function appendChip(chip: string) {
    const current = draft.workContext.trim(); if (!current.toLowerCase().includes(chip.toLowerCase()))
      onChange({ workContext: current ? `${current}. ${chip}.` : `${chip}.` });
  }
  const customPriorities = draft.priorities.filter((value) => !PRIORITY_CARDS.some((card) => card.value === value));
  return (<div className="space-y-6">

    <div>
      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl">Bạn muốn dùng tiếng Anh để làm gì?</h1>
      <p className="mt-2 text-base leading-relaxed text-text-secondary">Chọn những mục tiêu muốn tập trung trước. Có thể đổi trong hồ sơ sau này.</p>
    </div>

    <fieldset className="space-y-3">
      <legend className="mb-3 text-base font-medium text-text">Mục tiêu ưu tiên · có thể chọn nhiều</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {PRIORITY_CARDS.map((card) => {
          const active = draft.priorities.includes(card.value); return <button key={card.value} type="button" onClick={() => togglePriority(card.value)} aria-pressed={active} className={cn("flex min-h-14 w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors", active ? "border-primary bg-surface-muted" : "border-border bg-surface hover:border-primary")}>
            <Icon name={card.icon} className="mt-1 h-5 w-5 shrink-0 text-primary-dark" />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-medium text-text">
                {card.title}
              </span>
              <span className="mt-1 block text-base leading-relaxed text-text-secondary">
                {card.subtitle}
              </span>
            </span>
            {active && <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-primary-dark" />}
          </button>;
        })}
        {customPriorities.map((value) => <button key={value} type="button" aria-pressed="true" onClick={() => togglePriority(value)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-primary bg-surface-muted p-4 text-left text-base text-text">
          {value}
          <Icon name="x" className="h-5 w-5 shrink-0" />
        </button>)}
      </div>
    </fieldset>

    <div className="space-y-2">
      <label htmlFor="onboarding-display-name" className="block text-base font-medium text-text">Ứng dụng nên gọi bạn là gì?</label>
      <input id="onboarding-display-name" value={draft.displayName} onChange={(event) => onChange({ displayName: event.target.value })} placeholder="Ví dụ: Bác sĩ Minh" className="min-h-12 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>

    <details className="border-t border-border">
      <summary className="min-h-11 cursor-pointer py-4 text-base font-medium text-text">Thêm bối cảnh công việc · tùy chọn</summary>
      <div className="space-y-3 pb-2">
        <label htmlFor="onboarding-work-context" className="block text-base text-text-secondary">Chuyên môn hoặc tình huống bạn muốn luyện</label>
        <textarea id="onboarding-work-context" value={draft.workContext} onChange={(event) => onChange({ workContext: event.target.value })} rows={3} placeholder="Mô tả công việc, tránh thông tin bệnh nhân…" className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-base leading-relaxed text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <p className="text-base text-text-secondary">Hoặc thêm một gợi ý:</p>
        <div className="flex flex-wrap gap-2">
          {WORK_CONTEXT_CHIPS.map((chip) => <button key={chip} type="button" onClick={() => appendChip(chip)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-base text-text-secondary hover:border-primary">
            <Icon name="plus" className="h-4 w-4 shrink-0" />
            {chip}
          </button>)}
        </div>
      </div>
    </details>

  </div>);
}
