"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  BOOK_PRESETS,
  STUDY_TIME_PRESETS,
  type OnboardingDraft,
} from "./onboarding-presets";
import { OnboardingIeltsOptions } from "./onboarding-ielts-options";

interface StepScheduleProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

/** Bước 2 Onboarding: Nhịp học 30'/45', khung giờ quen thuộc, sách y và IELTS. */
export function StepSchedule({ draft, onChange }: StepScheduleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Thiết lập nhịp học hằng ngày
        </h2>
        <p className="mt-1.5 text-base leading-relaxed text-text-secondary">
          Chọn quỹ thời gian vừa sức để duy trì đều đặn. Hệ thống sẽ tự chia
          phiên học hợp lý và nhắc tạm dừng khi hết giờ.
        </p>
      </div>

      {/* Thời lượng mục tiêu */}
      <div className="space-y-2.5">
        <span className="block text-sm font-semibold text-text">
          Thời lượng mỗi phiên học
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              {
                mins: 30 as const,
                badge: "Khuyên dùng",
                title: "30 phút / ngày",
                desc: "5' ôn từ · 15' bài chính · 8' sửa bài · 2' tổng kết",
              },
              {
                mins: 45 as const,
                badge: "Chuyên sâu",
                title: "45 phút / ngày",
                desc: "5' ôn từ · 22' bài chính · 15' sửa sâu · 3' tổng kết",
              },
            ] as const
          ).map((opt) => {
            const active = draft.targetMinutesDefault === opt.mins;
            return (
              <button
                key={opt.mins}
                type="button"
                onClick={() => onChange({ targetMinutesDefault: opt.mins })}
                aria-pressed={active}
                className={cn(
                  "flex min-h-24 cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-primary bg-teal-50/70 shadow-xs"
                    : "border-border bg-surface hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-base font-bold text-text">
                    <Icon
                      name="clock"
                      className={cn(
                        "h-4.5 w-4.5",
                        active ? "text-primary" : "text-slate-400"
                      )}
                    />
                    {opt.title}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      active
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {opt.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Khung giờ học quen thuộc */}
      <div className="space-y-2.5">
        <label
          htmlFor="onboarding-study-time"
          className="block text-sm font-semibold text-text"
        >
          Khung giờ thuận tiện nhất
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STUDY_TIME_PRESETS.map((preset) => {
            const active = draft.preferredStudyTime === preset.time;
            return (
              <button
                key={preset.time}
                type="button"
                onClick={() => onChange({ preferredStudyTime: preset.time })}
                className={cn(
                  "flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition",
                  active
                    ? "border-primary bg-teal-50 font-semibold text-primary-dark"
                    : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                )}
              >
                <span className="text-sm font-semibold">{preset.label}</span>
                <span className="text-xs opacity-80">{preset.time}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Hoặc chọn giờ cụ thể:</span>
          <input
            id="onboarding-study-time"
            type="time"
            value={draft.preferredStudyTime}
            onChange={(e) => onChange({ preferredStudyTime: e.target.value })}
            className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-base font-medium text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Sách / tài liệu đang đọc */}
      <div className="space-y-2">
        <label
          htmlFor="onboarding-current-book"
          className="block text-sm font-semibold text-text"
        >
          Sách hoặc tài liệu y khoa đang đọc (tuỳ chọn)
        </label>
        <div className="flex flex-wrap gap-2">
          {BOOK_PRESETS.map((book) => (
            <button
              key={book}
              type="button"
              onClick={() => onChange({ currentBook: book })}
              className={cn(
                "min-h-11 cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition",
                draft.currentBook === book
                  ? "border-primary bg-teal-50 text-primary-dark"
                  : "border-border bg-surface-muted text-text-secondary hover:border-primary/40"
              )}
            >
              {book}
            </button>
          ))}
        </div>
        <input
          id="onboarding-current-book"
          type="text"
          value={draft.currentBook}
          onChange={(e) => onChange({ currentBook: e.target.value })}
          placeholder="Nhập tên sách hoặc để trống nếu chưa chọn..."
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <OnboardingIeltsOptions
        value={draft.ieltsVariant}
        onChange={(ieltsVariant) => onChange({ ieltsVariant })}
      />
    </div>
  );
}
