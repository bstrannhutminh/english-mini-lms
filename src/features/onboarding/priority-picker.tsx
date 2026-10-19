"use client";

export const PRIORITY_OPTIONS = [
  "Giao tiếp công việc & lâm sàng hàng ngày",
  "Đọc - dịch sách và bài báo y khoa chuyên ngành",
  "Báo cáo & trao đổi tại hội nghị quốc tế",
  "Luyện thi IELTS mục tiêu 7.5 - 8.0",
] as const;

interface PriorityPickerProps {
  values: string[];
  onChange: (values: string[]) => void;
}

/** Chọn nhiều mục tiêu ưu tiên (button toggle, ≥44px). */
export function PriorityPicker({ values, onChange }: PriorityPickerProps) {
  const toggle = (opt: string) => {
    onChange(
      values.includes(opt)
        ? values.filter((p) => p !== opt)
        : [...values, opt]
    );
  };

  return (
    <div className="space-y-2">
      {PRIORITY_OPTIONS.map((opt) => {
        const checked = values.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            aria-pressed={checked}
            onClick={() => toggle(opt)}
            className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition sm:text-sm ${
              checked
                ? "border-blue-500 bg-blue-50/60 font-semibold text-blue-900"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
          >
            <span>{opt}</span>
            <span className="text-base">{checked ? "☑️" : "⬜"}</span>
          </button>
        );
      })}
    </div>
  );
}
