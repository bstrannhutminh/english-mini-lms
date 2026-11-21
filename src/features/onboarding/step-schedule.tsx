"use client";
import { cn } from "@/lib/utils";
import { BOOK_PRESETS, STUDY_TIME_PRESETS, type OnboardingDraft } from "./onboarding-presets";
import { OnboardingIeltsOptions } from "./onboarding-ielts-options";
interface StepScheduleProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}
export function StepSchedule({ draft, onChange }: StepScheduleProps) {
  return (<div className="space-y-6">

    <div>
      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl">Dành bao nhiêu thời gian cho một buổi?</h1>
      <p className="mt-2 text-base leading-relaxed text-text-secondary">30 phút là lựa chọn khởi đầu. Chọn 45 phút nếu muốn dành thêm thời gian làm và sửa bài.</p>
    </div>

    <fieldset>
      <legend className="mb-3 text-base font-medium text-text">Thời lượng mặc định</legend>
      <div className="grid grid-cols-2 gap-3">
        {([30, 45] as const).map((minutes) => <button key={minutes} type="button" aria-pressed={draft.targetMinutesDefault === minutes} onClick={() => onChange({ targetMinutesDefault: minutes })} className={cn("flex min-h-24 cursor-pointer flex-col justify-center gap-1 rounded-xl border p-4 text-left", draft.targetMinutesDefault === minutes ? "border-primary bg-surface-muted" : "border-border bg-surface hover:border-primary")}>
          <span className="text-2xl font-semibold text-text">{minutes} phút</span>
          <span className="text-base text-text-secondary">
            {minutes === 30 ? "Buổi học gọn" : "Thêm thời gian sửa"}
          </span>
        </button>)}
      </div>
    </fieldset>

    <div className="space-y-3">
      <label htmlFor="onboarding-study-time" className="block text-base font-medium text-text">Giờ thường học · tùy chọn</label>
      <div role="group" aria-label="Gợi ý giờ học" className="grid grid-cols-3 gap-2">
        {STUDY_TIME_PRESETS.map((preset) => <button key={preset.time} type="button" aria-pressed={draft.preferredStudyTime === preset.time} onClick={() => onChange({ preferredStudyTime: preset.time })} className={cn("flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-lg border px-1 py-3 text-base", draft.preferredStudyTime === preset.time ? "border-primary bg-surface-muted text-primary-dark" : "border-border bg-surface text-text-secondary hover:border-primary")}>
          <span>
            {preset.label}
          </span>
          <span>
            {preset.time}
          </span>
        </button>)}
      </div>
      <input id="onboarding-study-time" type="time" value={draft.preferredStudyTime} onChange={(event) => onChange({ preferredStudyTime: event.target.value })} className="min-h-12 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      <p className="text-base text-text-secondary">Đây là giờ ưu tiên cho hồ sơ; cài đặt nhắc học riêng ở Cài đặt.</p>
    </div>

    <OnboardingIeltsOptions value={draft.ieltsVariant} onChange={(ieltsVariant) => onChange({ ieltsVariant })} />

    <details className="border-t border-border">
      <summary className="min-h-11 cursor-pointer py-4 text-base font-medium text-text">Sách hoặc tài liệu đang đọc · tùy chọn</summary>
      <div className="space-y-3 pb-2">
        <label htmlFor="onboarding-current-book" className="block text-base text-text-secondary">Tên tài liệu của bạn</label>
        <input id="onboarding-current-book" value={draft.currentBook} onChange={(event) => onChange({ currentBook: event.target.value })} placeholder="Để trống nếu chưa chọn…" className="min-h-12 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <div className="flex flex-wrap gap-2">
          {BOOK_PRESETS.map((book) => <button key={book} type="button" aria-pressed={draft.currentBook === book} onClick={() => onChange({ currentBook: book })} className="min-h-11 cursor-pointer rounded-lg border border-border px-3 py-2 text-left text-base text-text-secondary hover:border-primary">
            {book}
          </button>)}
        </div>
      </div>
    </details>

  </div>);
}
