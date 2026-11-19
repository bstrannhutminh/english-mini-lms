import { describe, expect, it } from "vitest";
import { selectLearningFocus } from "@/lib/learning-focus";

describe("profile preferences when recent practice counts tie", () => {
  it("chooses the lower self-assessment before a stronger practiced skill", () => {
    expect(selectLearningFocus({ writing: 0, reading: 0, speaking: 2, listening: 0 }, {
      selfAssessment: { writing: 4, reading: 3, speaking: 1, listening: 2 },
    }, "writing")).toBe("listening");
  });
  it("uses a reading goal when counts and self-assessment tie", () => {
    expect(selectLearningFocus({}, { priorities: ["Đọc hiểu và dịch sách y khoa"] }, "writing")).toBe("reading");
  });
  it("preserves the caller fallback without a profile", () => {
    expect(selectLearningFocus({}, {}, "writing")).toBe("writing");
  });
  it("ignores invalid ratings and leaves the supplied evidence untouched", () => {
    const counts = { writing: 0, reading: 0, speaking: 0, listening: 0 };
    expect(selectLearningFocus(counts, { selfAssessment: { writing: NaN, reading: 100 } }, "writing")).toBe("writing");
    expect(counts).toEqual({ writing: 0, reading: 0, speaking: 0, listening: 0 });
  });
});
