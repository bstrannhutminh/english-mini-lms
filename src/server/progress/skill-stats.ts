import { modeSkill, type Skill } from "@/lib/modes";

export interface SubmissionSkillInput {
  activityMode: string;
  assisted: boolean;
}

export interface SkillStatsResult {
  skillBreakdown: Array<{
    skill: Skill;
    total: number;
    independent: number;
    assisted: number;
  }>;
  independentCount: number;
  assistedCount: number;
}

/** Gom thống kê submission theo skill gốc; ielts-* phải quy về đúng skill qua modeSkill(). */
export function summarizeSubmissionSkills(rows: SubmissionSkillInput[]): SkillStatsResult {
  const skillMap: Record<Skill, { total: number; independent: number; assisted: number }> = {
    writing: { total: 0, independent: 0, assisted: 0 },
    reading: { total: 0, independent: 0, assisted: 0 },
    speaking: { total: 0, independent: 0, assisted: 0 },
    listening: { total: 0, independent: 0, assisted: 0 },
  };

  let independentCount = 0;
  let assistedCount = 0;

  for (const row of rows) {
    const skill = modeSkill(row.activityMode);
    if (!skill) continue;
    skillMap[skill].total += 1;
    if (row.assisted) {
      skillMap[skill].assisted += 1;
      assistedCount += 1;
    } else {
      skillMap[skill].independent += 1;
      independentCount += 1;
    }
  }

  return {
    skillBreakdown: (["writing", "reading", "speaking", "listening"] as const).map((skill) => ({
      skill,
      ...skillMap[skill],
    })),
    independentCount,
    assistedCount,
  };
}
