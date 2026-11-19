import { cn } from "@/lib/utils";
import type { OnboardingDraft } from "./onboarding-presets";

const IELTS_CHOICES = [
  {
    value: "none" as const,
    title: "Chưa luyện IELTS",
    desc: "Ưu tiên tiếng Anh thực tế & y khoa",
  },
  {
    value: "academic" as const,
    title: "IELTS Academic",
    desc: "Học thuật, đọc báo cáo & hội nghị",
  },
  {
    value: "general" as const,
    title: "IELTS General",
    desc: "Giao tiếp & viết thực hành",
  },
];

/** Keep the optional IELTS goal separate from daily study scheduling. */
export function OnboardingIeltsOptions({
  value,
  onChange,
}: {
  value: OnboardingDraft["ieltsVariant"];
  onChange: (value: OnboardingDraft["ieltsVariant"]) => void;
}) {
  return (
    <div className="space-y-2.5">
      <span className="block text-sm font-semibold text-text">
        Lộ trình IELTS (tuỳ chọn — có thể để trống)
      </span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {IELTS_CHOICES.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={cn(
                "min-h-14 cursor-pointer rounded-xl border p-3 text-left transition",
                active
                  ? "border-primary bg-teal-50/70 text-primary-dark"
                  : "border-border bg-surface text-text-secondary hover:bg-slate-50"
              )}
            >
              <span className="block text-sm font-semibold text-text">
                {opt.title}
              </span>
              <span className="mt-0.5 block text-xs text-text-muted">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
