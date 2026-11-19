"use client";

import { Icon } from "@/components/ui";
import { SKILL_INFO, type Skill } from "@/lib/modes";
import { cn } from "@/lib/utils";
import { SKILL_LEVEL_LABELS, type OnboardingDraft } from "./onboarding-presets";

interface StepSkillsProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

const SKILL_ORDER: Skill[] = ["listening", "speaking", "reading", "writing"];

/** Bước 3 Onboarding: Tự đánh giá nhanh 4 kỹ năng bằng nút chạm 1–5 trực quan. */
export function StepSkills({ draft, onChange }: StepSkillsProps) {
  function setSkillScore(skill: Skill, value: number) {
    onChange({
      selfAssessment: {
        ...draft.selfAssessment,
        [skill]: value,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
          Tự đánh giá nhanh 4 kỹ năng
        </h2>
        <p className="mt-1.5 text-base leading-relaxed text-text-secondary">
          Chạm mức độ cảm nhận hiện tại của bạn cho từng kỹ năng để hệ thống ưu
          tiên đúng phần cần rèn trước.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-teal-200/70 bg-teal-50/60 px-4 py-3 text-sm text-teal-900">
        <Icon name="info" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
        <span>
          Đây chỉ là cảm nhận ban đầu để gợi ý bài vừa sức —{" "}
          <strong>không phải điểm kiểm tra hay xếp hạng IELTS/CEFR</strong>.
        </span>
      </div>

      <div className="space-y-3.5">
        {SKILL_ORDER.map((skill) => {
          const meta = SKILL_INFO[skill];
          const score = draft.selfAssessment[skill];
          const levelInfo = SKILL_LEVEL_LABELS[score] ?? SKILL_LEVEL_LABELS[3];

          return (
            <div
              key={skill}
              className="rounded-2xl border border-border bg-surface p-4 shadow-xs"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl border",
                      meta.badgeClass
                    )}
                  >
                    <Icon name={meta.icon} className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-text">{meta.label}</p>
                    <p className="text-xs text-text-muted">{levelInfo.detail}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Mức {score}/5 · {levelInfo.short}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label={`Tự đánh giá kỹ năng ${meta.label}`}
                className="grid grid-cols-5 gap-2"
              >
                {[1, 2, 3, 4, 5].map((level) => {
                  const selected = score === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSkillScore(skill, level)}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-bold transition",
                        selected
                          ? "border-primary bg-primary text-white shadow-xs"
                          : "border-border bg-surface-muted text-text-secondary hover:border-primary/40 hover:bg-teal-50/40"
                      )}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
