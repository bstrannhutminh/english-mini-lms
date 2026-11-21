"use client";
import { SKILL_INFO, type Skill } from "@/lib/modes";
import { SKILL_LEVEL_LABELS, type OnboardingDraft } from "./onboarding-presets";
interface StepSkillsProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}
const SKILL_ORDER: Skill[] = ["listening", "speaking", "reading", "writing"];
export function StepSkills({ draft, onChange }: StepSkillsProps) {
  return (<div className="space-y-6">

    <div>
      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl">Bạn cảm thấy thế nào với từng kỹ năng?</h1>
      <p className="mt-2 text-base leading-relaxed text-text-secondary">Tự chọn mức gần nhất với mình. Mức 3 là gợi ý mặc định, bạn có thể chỉnh hoặc giữ để bắt đầu.</p>
    </div>

    <p className="border-l-2 border-border-strong pl-4 text-base leading-relaxed text-text-secondary">Đây là tự đánh giá để chọn bài khởi đầu. Không phải kết quả kiểm tra hay điểm IELTS/CEFR.</p>

    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {SKILL_ORDER.map((skill) => {
        const meta = SKILL_INFO[skill]; const score = draft.selfAssessment[skill]; const levelInfo = SKILL_LEVEL_LABELS[score] ?? SKILL_LEVEL_LABELS[3]; return <fieldset key={skill} className="min-w-0 border-t border-border py-3">
          <legend className="pt-3 text-lg font-semibold text-text">
            {meta.label}
          </legend>
          <p id={`skill-description-${skill}`} className="mb-3 text-base leading-relaxed text-text-secondary">Mức {score}/5 · {levelInfo.short}. {levelInfo.detail}</p>
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((level) => <label key={level} className="relative cursor-pointer">
              <input type="radio" name={`onboarding-${skill}`} value={level} checked={score === level} onChange={() => onChange({ selfAssessment: { ...draft.selfAssessment, [skill]: level } })} aria-label={`Mức ${level}: ${SKILL_LEVEL_LABELS[level].short}`} aria-describedby={`skill-description-${skill}`} className="peer sr-only" />
              <span className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-surface text-base font-medium text-text-secondary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
                {level}
              </span>
            </label>)}
          </div>
        </fieldset>;
      })}
    </div>

    <details className="border-t border-border">
      <summary className="min-h-11 cursor-pointer py-3 text-base text-text-secondary">Thang tự đánh giá 1–5</summary>
      <dl className="space-y-3 pb-3">
        {Object.entries(SKILL_LEVEL_LABELS).map(([level, info]) => <div key={level}>
          <dt className="text-base font-medium text-text">{level} · {info.short}</dt>
          <dd className="text-base text-text-secondary">
            {info.detail}
          </dd>
        </div>)}
      </dl>
    </details>

  </div>);
}
