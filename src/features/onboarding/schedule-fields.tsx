"use client";

const IELTS_VARIANTS = [
  { id: "academic", label: "Academic" },
  { id: "general", label: "General" },
  { id: "none", label: "Không thi / Bỏ qua" },
] as const;

export type IeltsVariantChoice = "academic" | "general" | "none";

interface IeltsVariantPickerProps {
  value: IeltsVariantChoice;
  onChange: (value: IeltsVariantChoice) => void;
}

/** Biến thể IELTS — tuỳ chọn, có thể bỏ trống ("none"). */
export function IeltsVariantPicker({ value, onChange }: IeltsVariantPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {IELTS_VARIANTS.map((variant) => (
        <button
          type="button"
          key={variant.id}
          aria-pressed={value === variant.id}
          onClick={() => onChange(variant.id)}
          className={`min-h-[44px] rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition ${
            value === variant.id
              ? "border-blue-600 bg-blue-50 text-blue-800"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          {variant.label}
        </button>
      ))}
    </div>
  );
}

interface StudyScheduleFieldsProps {
  preferredStudyTime: string;
  targetMinutes: number;
  onTimeChange: (value: string) => void;
  onMinutesChange: (value: number) => void;
}

/** Khung giờ học quen + thời lượng phiên mặc định (30/45). */
export function StudyScheduleFields({
  preferredStudyTime,
  targetMinutes,
  onTimeChange,
  onMinutesChange,
}: StudyScheduleFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label
          htmlFor="study-time"
          className="block text-xs font-bold uppercase tracking-wider text-slate-800"
        >
          7. Khung giờ học quen thuộc
        </label>
        <input
          id="study-time"
          type="text"
          value={preferredStudyTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          placeholder="Ví dụ: 21:00 hoặc 06:30 sáng"
        />
      </div>

      <div className="space-y-1.5">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
          8. Thời lượng phiên học mặc định
        </span>
        <div className="flex gap-2">
          {[30, 45].map((minutes) => (
            <button
              type="button"
              key={minutes}
              aria-pressed={targetMinutes === minutes}
              onClick={() => onMinutesChange(minutes)}
              className={`min-h-[44px] flex-1 rounded-xl border py-3 text-xs font-semibold transition sm:text-sm ${
                targetMinutes === minutes
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              ⏱️ {minutes} phút
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
