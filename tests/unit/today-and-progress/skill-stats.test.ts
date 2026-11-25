import { describe, expect, it } from "vitest";
import { summarizeSubmissionSkills } from "@/server/progress/skill-stats";

describe("summarizeSubmissionSkills", () => {
  it("gom ielts-* về đúng skill gốc và tách independent/assisted", () => {
    const result = summarizeSubmissionSkills([
      { activityMode: "writing", assisted: false },
      { activityMode: "ielts-writing", assisted: true },
      { activityMode: "ielts-reading", assisted: false },
      { activityMode: "ielts-speaking", assisted: false },
      { activityMode: "ielts-listening", assisted: true },
    ]);

    expect(result.independentCount).toBe(3);
    expect(result.assistedCount).toBe(2);
    expect(result.skillBreakdown).toEqual([
      { skill: "writing", total: 2, independent: 1, assisted: 1 },
      { skill: "reading", total: 1, independent: 1, assisted: 0 },
      { skill: "speaking", total: 1, independent: 1, assisted: 0 },
      { skill: "listening", total: 1, independent: 0, assisted: 1 },
    ]);
  });

  it("bỏ qua mode lạ thay vì ép cast sai", () => {
    const result = summarizeSubmissionSkills([{ activityMode: "ielts-unknown", assisted: false }]);
    expect(result.skillBreakdown.every((row) => row.total === 0)).toBe(true);
    expect(result.independentCount).toBe(0);
  });
});
