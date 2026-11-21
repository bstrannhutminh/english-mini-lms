import { describe, expect, it } from "vitest";
import {
  feedbackCategoryLabel,
  hasFeedbackLabel,
  normalizeFeedbackKey,
  scoreCriterionLabel,
} from "@/lib/feedback-labels";

describe("feedback-labels", () => {
  it("maps the observation categories emitted by the providers", () => {
    const expected: Record<string, string> = {
      grammar: "Ngữ pháp",
      vocabulary: "Từ vựng",
      lexical: "Từ vựng",
      tone: "Giọng văn",
      register: "Giọng văn",
      structure: "Cấu trúc",
      organization: "Cấu trúc",
      clarity: "Độ rõ ràng",
      coherence: "Mạch lạc",
      cohesion: "Mạch lạc",
      task: "Đáp ứng đề",
      fluency: "Độ trôi chảy",
      pronunciation: "Phát âm",
      accuracy: "Độ trung thành với bản gốc",
      fidelity: "Độ trung thành với bản gốc",
      comprehension: "Mức hiểu bài",
      terminology: "Thuật ngữ",
      expression: "Cách diễn đạt",
      spelling: "Chính tả",
      punctuation: "Dấu câu",
    };
    for (const [key, label] of Object.entries(expected)) {
      expect(feedbackCategoryLabel(key), key).toBe(label);
    }
  });

  it("maps rubric criterion keys and their English display names", () => {
    expect(scoreCriterionLabel("task_response")).toBe("Đáp ứng đề");
    expect(scoreCriterionLabel("task_achievement")).toBe("Đáp ứng đề");
    expect(scoreCriterionLabel("lexical_resource")).toBe("Từ vựng");
    expect(scoreCriterionLabel("coherence_cohesion")).toBe("Mạch lạc");
    expect(scoreCriterionLabel("Coherence and Cohesion")).toBe("Mạch lạc");
    expect(scoreCriterionLabel("Grammatical Range and Accuracy")).toBe(
      "Ngữ pháp (đa dạng & chính xác)"
    );
    expect(scoreCriterionLabel("tone_vocabulary")).toBe("Giọng văn & từ vựng");
    expect(scoreCriterionLabel("Tone & Formal Vocabulary")).toBe(
      "Giọng văn & từ vựng trang trọng"
    );
    expect(scoreCriterionLabel("fluency_coherence")).toBe("Trôi chảy & mạch lạc");
    expect(scoreCriterionLabel("fidelity_accuracy")).toBe("Độ trung thành với bản gốc");
    expect(scoreCriterionLabel("listening_comprehension")).toBe("Mức hiểu bài nghe");
  });

  it("is case-insensitive and tolerant of separators", () => {
    expect(feedbackCategoryLabel("  GRAMMAR ")).toBe("Ngữ pháp");
    expect(feedbackCategoryLabel("Task-Response")).toBe("Đáp ứng đề");
    expect(normalizeFeedbackKey("Structure & Cohesion")).toBe("structure_cohesion");
  });

  it("falls back to the capitalised original for unknown keys", () => {
    expect(feedbackCategoryLabel("self_correction")).toBe("Self correction");
    expect(scoreCriterionLabel("idiomaticity")).toBe("Idiomaticity");
    expect(hasFeedbackLabel("idiomaticity")).toBe(false);
    expect(hasFeedbackLabel("Tone")).toBe(true);
  });

  it("handles missing keys without throwing", () => {
    expect(feedbackCategoryLabel(undefined)).toBe("Khác");
    expect(feedbackCategoryLabel("   ")).toBe("Khác");
    expect(scoreCriterionLabel(null)).toBe("Tiêu chí");
  });

  it("never labels a practice estimate as an official band", () => {
    for (const key of ["task_response", "lexical_resource", "pronunciation", "clarity"]) {
      expect(scoreCriterionLabel(key).toLowerCase()).not.toMatch(/band|chính thức/);
    }
  });
});
