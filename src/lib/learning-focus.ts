import type { Skill } from "./modes";

export interface LearningFocusProfile {
  priorities?: string[];
  selfAssessment?: Partial<Record<Skill, number>>;
}

const SKILL_ORDER: Skill[] = ["speaking", "listening", "writing", "reading"];

function goalWeight(skill: Skill, priorities: string[]): number {
  return priorities.reduce((total, priority) => {
    const text = priority.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();
    const relevant =
      (skill === "reading" && /doc|dich|sach|bai bao/.test(text)) ||
      (skill === "writing" && /viet|email|hoi nghi|thuyet trinh/.test(text)) ||
      (skill === "speaking" && /noi|giao tiep|hoi nghi|thuyet trinh|lam sang/.test(text)) ||
      (skill === "listening" && /nghe|giao tiep/.test(text));
    return total + (relevant ? 1 : 0);
  }, 0);
}

/** Evidence counts win; self-assessment and goals break ties without estimating a band. */
export function selectLearningFocus(
  counts: Record<string, number>,
  profile: LearningFocusProfile,
  fallback: Skill = "speaking",
): Skill {
  const order = [fallback, ...SKILL_ORDER.filter((skill) => skill !== fallback)];
  return order.sort((a, b) => {
    const countDiff = (counts[a] ?? 0) - (counts[b] ?? 0);
    if (countDiff) return countDiff;
    const rating = (skill: Skill) => {
      const value = profile.selfAssessment?.[skill];
      return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5 ? value : 3;
    };
    return rating(a) - rating(b) || goalWeight(b, profile.priorities ?? []) - goalWeight(a, profile.priorities ?? []);
  })[0];
}
