import { describe, it, expect } from "vitest";
import {
  buildSpeakingAudioPrompt,
  buildSpeakingTextOnlyPrompt,
} from "@/server/providers/gemini/speaking";
import { buildWritingEvalPrompt } from "@/server/providers/gemini/writing";
import {
  formatRubricSection,
  formatFeedbackGuideSection,
  isStructuredRubric,
} from "@/server/providers/gemini/prompt-sections";

const RUBRIC = {
  id: "ielts-speaking-v1",
  title: "IELTS Speaking Band Descriptors (Practice)",
  description: "Tiêu chí đánh giá bài nói IELTS theo 4 tiêu chí công khai.",
  dimensions: [
    {
      key: "fluency_coherence",
      name: "Fluency and Coherence",
      weight: 0.25,
      description: "Nói trôi chảy, ít ngập ngừng.",
    },
    {
      key: "pronunciation",
      name: "Pronunciation",
      weight: 0.25,
      description: "Phát âm rõ, trọng âm tự nhiên.",
    },
  ],
};

describe("speaking prompt — phân biệt transcript gốc vs ghi chú learner (lỗi mislabel cũ)", () => {
  it("nhánh audio: referenceTranscript dán nhãn transcript GỐC, không phải bài learner", () => {
    const prompt = buildSpeakingAudioPrompt("Đề bài X", {
      referenceTranscript: "The quick brown fox.",
      learnerText: "ghi chú của tôi",
    });
    expect(prompt).toContain("TRANSCRIPT GỐC CỦA BÀI HỌC");
    expect(prompt).toContain("The quick brown fox.");
    expect(prompt).toContain("KHÔNG phải bài nói của người học");
    // Nhãn cũ gây méo chấm không được còn xuất hiện
    expect(prompt).not.toContain("TRANSCRIPT CHUẨN");
  });

  it("nhánh audio: learnerText dán nhãn ghi chú tự gõ, cấm chép vào transcript", () => {
    const prompt = buildSpeakingAudioPrompt("Đề bài X", {
      learnerText: "ghi chú của tôi",
    });
    expect(prompt).toContain("GHI CHÚ / DÀN Ý DO NGƯỜI HỌC TỰ GÕ");
    expect(prompt).toContain("ghi chú của tôi");
    expect(prompt).toContain("không được coi là transcript của bản ghi âm");
  });

  it("nhánh audio: transcript phải bóc từ audio", () => {
    const prompt = buildSpeakingAudioPrompt("Đề bài X", {});
    expect(prompt).toContain("bóc băng chính xác lời người học nói trong audio");
  });

  it("nhánh text-only: bài learner là nội dung cần chấm, không phải transcript mẫu", () => {
    const prompt = buildSpeakingTextOnlyPrompt("Đề bài X", {
      learnerText: "bài gõ tay của learner",
    });
    expect(prompt).toContain("BÀI LÀM DẠNG VĂN BẢN DO NGƯỜI HỌC TỰ GÕ");
    expect(prompt).toContain("bài gõ tay của learner");
    expect(prompt).not.toContain("BẢN TRANSCRIPT MẪU ĐƯỢC DUYỆT");
    expect(prompt).toContain("not_assessable");
  });

  it("thiếu context → không in section rỗng", () => {
    const prompt = buildSpeakingAudioPrompt("Đề bài X");
    expect(prompt).not.toContain("TRANSCRIPT GỐC");
    expect(prompt).not.toContain("GHI CHÚ");
  });

  it("rubric + feedbackGuide được đưa vào prompt speaking", () => {
    const prompt = buildSpeakingAudioPrompt("Đề bài X", {
      feedbackGuide: "Tối đa 3 điểm: từ vựng, cấu trúc câu.",
      rubric: RUBRIC,
    });
    expect(prompt).toContain("HƯỚNG DẪN GÓP Ý RIÊNG CỦA BÀI NÀY");
    expect(prompt).toContain("Tối đa 3 điểm: từ vựng, cấu trúc câu.");
    expect(prompt).toContain("TIÊU CHÍ ĐÁNH GIÁ (RUBRIC");
    expect(prompt).toContain("fluency_coherence");
  });
});

describe("writing prompt — wiring rubric + feedback_guide", () => {
  it("rubric null → KHÔNG in chữ null vào prompt (lỗi cũ)", () => {
    const prompt = buildWritingEvalPrompt("Đề", null, "Bài viết");
    expect(prompt).not.toContain("null");
    expect(prompt).not.toContain("RUBRIC");
  });

  it("rubric structured → format theo tiêu chí với key + trọng số", () => {
    const prompt = buildWritingEvalPrompt("Đề", RUBRIC, "Bài viết");
    expect(prompt).toContain("TIÊU CHÍ ĐÁNH GIÁ (RUBRIC");
    expect(prompt).toContain("IELTS Speaking Band Descriptors");
    expect(prompt).toContain("[fluency_coherence]");
    expect(prompt).toContain("trọng số 25%");
    expect(prompt).toContain("Nói trôi chảy, ít ngập ngừng.");
  });

  it("feedbackGuide có mặt khi được truyền, vắng mặt khi không", () => {
    const withGuide = buildWritingEvalPrompt("Đề", null, "Bài", {
      feedbackGuide: "Ưu tiên 3 lỗi: độ rõ, cấu trúc email.",
    });
    expect(withGuide).toContain("HƯỚNG DẪN GÓP Ý RIÊNG CỦA BÀI NÀY");
    expect(withGuide).toContain("Ưu tiên 3 lỗi: độ rõ, cấu trúc email.");

    const noGuide = buildWritingEvalPrompt("Đề", null, "Bài");
    expect(noGuide).not.toContain("HƯỚNG DẪN GÓP Ý");
  });

  it("luôn có đề bài và bài viết", () => {
    const prompt = buildWritingEvalPrompt("Đề X", null, "Bài Y");
    expect(prompt).toContain("ĐỀ BÀI:\nĐề X");
    expect(prompt).toContain("BÀI VIẾT CỦA BÁC SĨ MINH:\nBài Y");
  });
});

describe("prompt-sections helpers", () => {
  it("isStructuredRubric nhận đúng cấu trúc machine-readable", () => {
    expect(isStructuredRubric(RUBRIC)).toBe(true);
    expect(isStructuredRubric(null)).toBe(false);
    expect(isStructuredRubric({ dimensions: [] })).toBe(false);
    expect(isStructuredRubric("rubric tự do")).toBe(false);
  });

  it("formatRubricSection fallback JSON dump cho shape lạ", () => {
    const out = formatRubricSection({ legacy: true });
    expect(out).toContain("TIÊU CHÍ ĐÁNH GIÁ (RUBRIC):");
    expect(out).toContain('"legacy": true');
  });

  it("formatRubricSection rỗng khi null/undefined", () => {
    expect(formatRubricSection(null)).toBe("");
    expect(formatRubricSection(undefined)).toBe("");
  });

  it("formatFeedbackGuideSection trim và rỗng khi blank", () => {
    expect(formatFeedbackGuideSection("  ")).toBe("");
    expect(formatFeedbackGuideSection(null)).toBe("");
    expect(formatFeedbackGuideSection("  Hướng dẫn A  ")).toContain("Hướng dẫn A");
  });
});
