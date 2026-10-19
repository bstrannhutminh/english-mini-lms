"use client";

import type { SelfAssessment } from "@/contracts/onboarding";

const SKILLS = [
  { key: "writing", label: "✍️ Viết (Writing)" },
  { key: "reading", label: "📖 Đọc (Reading)" },
  { key: "speaking", label: "🎙️ Nói (Speaking)" },
  { key: "listening", label: "🎧 Nghe (Listening)" },
] as const;

interface SkillSlidersProps {
  values: SelfAssessment;
  onChange: (values: SelfAssessment) => void;
}

/** Tự đánh giá năng lực 4 kỹ năng, thang 1–5 (input range). */
export function SkillSliders({ values, onChange }: SkillSlidersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SKILLS.map((skill) => (
        <div
          key={skill.key}
          className="space-y-1.5 rounded-xl border border-slate-200/70 bg-slate-50 p-3"
        >
          <div className="flex justify-between text-xs font-semibold text-slate-800">
            <span>{skill.label}</span>
            <span className="font-bold text-blue-600">
              {values[skill.key]} / 5
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={values[skill.key]}
            aria-label={skill.label}
            onChange={(e) =>
              onChange({ ...values, [skill.key]: Number(e.target.value) })
            }
            className="w-full cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>1 (Cơ bản)</span>
            <span>3 (Khá)</span>
            <span>5 (Thành thạo)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
