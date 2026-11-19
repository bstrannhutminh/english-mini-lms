import { describe, it, expect } from "vitest";
import { deriveLearningStatus } from "@/server/library/learning-status";

describe("deriveLearningStatus (library cards)", () => {
  it("returns in_progress when an active/paused session exists", () => {
    expect(deriveLearningStatus(true, 0)).toBe("in_progress");
  });

  it("in_progress wins over submission history", () => {
    expect(deriveLearningStatus(true, 3)).toBe("in_progress");
  });

  it("returns completed when the learner has submitted at least once", () => {
    expect(deriveLearningStatus(false, 1)).toBe("completed");
    expect(deriveLearningStatus(false, 5)).toBe("completed");
  });

  it("returns not_started when no session and no submissions", () => {
    expect(deriveLearningStatus(false, 0)).toBe("not_started");
  });
});
