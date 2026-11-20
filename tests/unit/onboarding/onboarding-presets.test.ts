import { describe, it, expect } from "vitest";
import {
  buildOnboardingSummary,
  buildOnboardingPayload,
  createInitialDraft,
  needsFirstRunOnboarding,
  resolveDefaultTargetMinutes,
} from "@/features/onboarding/onboarding-presets";
import { mergePreferences } from "@/server/settings/preferences";

describe("Onboarding presets & first-run helpers", () => {
  it("requires first-run onboarding only when neither completed nor skipped", () => {
    expect(needsFirstRunOnboarding({})).toBe(true);
    expect(needsFirstRunOnboarding({ baselineStatus: "pending" })).toBe(true);
    expect(needsFirstRunOnboarding({ baselineStatus: "completed" })).toBe(false);
    expect(
      needsFirstRunOnboarding({
        baselineStatus: "pending",
        preferences: { onboardingSkipped: true },
      })
    ).toBe(false);
  });

  it("resolves default target minutes strictly to 30 or 45", () => {
    expect(resolveDefaultTargetMinutes(null)).toBe(30);
    expect(resolveDefaultTargetMinutes({})).toBe(30);
    expect(resolveDefaultTargetMinutes({ targetMinutesDefault: 45 })).toBe(45);
    expect(resolveDefaultTargetMinutes({ targetMinutesDefault: 60 })).toBe(30);
  });

  it("builds a complete initial draft from null profile without crashing", () => {
    const draft = createInitialDraft(null);
    expect(draft.displayName).toBe("Bác sĩ Minh");
    expect(draft.priorities.length).toBeGreaterThan(0);
    expect(draft.targetMinutesDefault).toBe(30);
    expect(draft.workContext).toBe("");
    expect(draft.currentBook).toBe("");
    expect(draft.selfAssessment).toEqual({ writing: 3, reading: 3, speaking: 3, listening: 3 });
  });

  it("preserves intentionally blank preferences and chosen ratings on re-entry", () => {
    const profile = { displayName: "Minh", priorities: [], selfAssessment: { writing: 2, reading: 4, speaking: 1, listening: 5 }, workContext: "", ieltsVariant: null, currentBook: "", preferredStudyTime: "", targetMinutesDefault: 45, baselineStatus: "completed" };
    const draft = createInitialDraft(profile);
    expect(draft.priorities).toEqual([]);
    expect(draft.selfAssessment).toEqual(profile.selfAssessment);
    expect(draft.workContext).toBe("");
    expect(draft.currentBook).toBe("");
    expect(draft.preferredStudyTime).toBe("");
    expect(draft.targetMinutesDefault).toBe(45);
  });

  it("saves reviewed duration and optional blanks without inventing profile facts", () => {
    const draft = createInitialDraft(null);
    draft.displayName = " Minh ";
    draft.targetMinutesDefault = 45;
    draft.ieltsVariant = "none";
    const payload = buildOnboardingPayload(draft);
    expect(payload).toMatchObject({ displayName: "Minh", targetMinutesDefault: 45, workContext: "", currentBook: "", ieltsVariant: null });
    payload.priorities.push("changed elsewhere");
    expect(draft.priorities).not.toContain("changed elsewhere");
  });

  it("summarizes weakest skill and exact minute budget without inventing IELTS bands", () => {
    const draft = createInitialDraft(null);
    draft.targetMinutesDefault = 45;
    draft.selfAssessment = {
      writing: 4,
      reading: 4,
      speaking: 3,
      listening: 2,
    };
    const summary = buildOnboardingSummary(draft);
    expect(summary.focusSkill).toBe("listening");
    const total =
      summary.minutesSplit.warmup +
      summary.minutesSplit.main +
      summary.minutesSplit.revise +
      summary.minutesSplit.wrapup;
    expect(total).toBe(45);
    expect(summary.ieltsLabel).not.toMatch(/band\s*\d/i);
  });

  it("persists and clears onboardingSkipped through mergePreferences", () => {
    const skipped = mergePreferences(
      { remindEnabled: false, remindTime: "20:00" },
      { onboardingSkipped: true }
    );
    expect(skipped.onboardingSkipped).toBe(true);

    const cleared = mergePreferences(skipped, { onboardingSkipped: false });
    expect("onboardingSkipped" in cleared).toBe(false);
  });
});
