import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveWordTarget } from "@/features/session/modes/writing/word-target";

describe("word counts from the approved writing prompt", () => {
  it.each([
    ["w1-conference-email-prompt.md", 120, 150],
    ["w2-summary-ultrasound-prompt.md", 80, 100],
  ])("uses the range stated by %s", (file, min, max) => {
    const prompt = readFileSync(`content/english-lab/texts/${file}`, "utf8");
    expect(resolveWordTarget(prompt)).toEqual({ min, max });
  });
  it("keeps an IELTS minimum open-ended", () => {
    expect(resolveWordTarget("Write at least 250 words.")).toEqual({ min: 250, max: null });
  });
  it("does not invent a goal from time, missing text or an invalid range", () => {
    expect(resolveWordTarget("Write for 30–45 minutes.")).toBeNull();
    expect(resolveWordTarget(null)).toBeNull();
    expect(resolveWordTarget("150–120 words")).toBeNull();
  });
});
