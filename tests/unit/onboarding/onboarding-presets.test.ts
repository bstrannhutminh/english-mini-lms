import { describe, it, expect } from "vitest";
import {
  buildOnboardingSummary,
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
