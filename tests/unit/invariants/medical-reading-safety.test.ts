/**
 * INVARIANT 7 — Bài đọc y khoa: AI chỉ nhận xét ngôn ngữ và độ trung thành
 * với đoạn gốc; KHÔNG đưa khuyến nghị điều trị; không phỏng đoán ca bệnh.
 *
 * Test này chạy evaluateReading THẬT (src/server/providers/gemini/reading.ts)
 * — chỉ mock ranh giới network (getGeminiClient). Thay thế test integration
 * cũ từng "assert chính mock" (mock evaluateReading rồi assert dữ liệu mock).
 *
 * Hai lớp enforce được kiểm chứng:
 *  1. Prompt: system instruction gửi lên Gemini phải chứa các luật cấm
 *     (khuyến nghị điều trị, ca bệnh lâm sàng) + câu limitations bắt buộc.
 *  2. Hậu kiểm: model trả limitations thiếu câu cảnh báo y khoa → code THẬT
 *     phải thay bằng câu chuẩn; model trả đúng → giữ nguyên.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@/server/providers/gemini/client", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/server/providers/gemini/client")>();
  return {
    ...original, // giữ GEMINI_TIMEOUT_MS thật cho call-gemini.ts
    getGeminiClient: () => ({ models: { generateContent } }),
  };
});

import { evaluateReading } from "@/server/providers/gemini/reading";

const VALID_FEEDBACK = {
  observations: [
    {
      category: "fidelity",
      location: "Câu 1",
      original: "intravascular injection",
      issue: "Dịch sót nghĩa 'lòng mạch'",
      suggestion: "Dịch sát thuật ngữ giải phẫu",
      example: "tiêm nhầm vào lòng mạch máu",
      retry_prompt: "Dịch lại câu 1",
    },
  ],
  strengths: ["Diễn đạt tự nhiên"],
  next_action: "Chuẩn hóa thuật ngữ",
  limitations:
    "Nhận xét của AI chỉ mang tính chất rèn luyện kỹ năng ngôn ngữ và độ trung thành với đoạn gốc; tuyệt đối không phải là khuyến nghị điều trị y khoa.",
  // `note` bắt buộc theo WritingFeedbackSchema nội bộ của provider (khác
  // contract API nơi note optional) — đây cũng là một chi tiết drift đáng nhớ.
  scores: [
    {
      kind: "practice_estimate",
      dimension: "fidelity",
      value: 8,
      note: "Trung thành với đoạn gốc",
    },
  ],
};

function geminiResponse(payload: unknown) {
  return {
    text: JSON.stringify(payload),
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
  };
}

const SEGMENT =
  "Direct sonographic monitoring substantially minimizes the risk of accidental intravascular injection.";
const SUBMISSION = {
  mainIdea: "Siêu âm giảm nguy cơ tiêm nhầm mạch máu",
  translation:
    "Giám sát trực tiếp bằng siêu âm giảm thiểu đáng kể nguy cơ tiêm nhầm vào lòng mạch máu.",
  keyTerms: "intravascular injection: tiêm vào mạch máu",
};

describe("evaluateReading THẬT — invariant 7 (chỉ mock ranh giới Gemini client)", () => {
  beforeEach(() => generateContent.mockReset());

  it("system instruction cấm khuyến nghị điều trị + cấm phỏng đoán ca bệnh lâm sàng", async () => {
    generateContent.mockResolvedValue(geminiResponse(VALID_FEEDBACK));
    await evaluateReading(SEGMENT, SUBMISSION);

    expect(generateContent).toHaveBeenCalledTimes(1);
    const config = generateContent.mock.calls[0][0].config;
    const instruction: string = config.systemInstruction;
    // Luật cấm của invariant 7 phải nằm trong prompt gửi lên model.
    expect(instruction).toContain("KHÔNG đưa ra khuyến nghị điều trị");
    expect(instruction).toContain("KHÔNG phỏng đoán ca bệnh lâm sàng");
    expect(instruction).toContain("khuyến nghị điều trị y khoa");
    // Chỉ nhận xét ngôn ngữ + độ trung thành.
    expect(instruction).toContain("độ trung thành");
  });

  it("user content mang đoạn gốc + bản dịch learner (đối chiếu trung thành)", async () => {
    generateContent.mockResolvedValue(geminiResponse(VALID_FEEDBACK));
    await evaluateReading(SEGMENT, SUBMISSION);

    const contents: string = generateContent.mock.calls[0][0].contents;
    expect(contents).toContain(SEGMENT);
    expect(contents).toContain(SUBMISSION.translation);
    expect(contents).toContain(SUBMISSION.keyTerms);
  });

  it("model trả limitations THIẾU cảnh báo y khoa → hậu kiểm thay bằng câu chuẩn bắt buộc", async () => {
    // Model quên câu disclaimer — đây là tình huống invariant 7 bị vi phạm
    // nếu code không vá.
    generateContent.mockResolvedValue(
      geminiResponse({ ...VALID_FEEDBACK, limitations: "Điểm chỉ là ước tính luyện tập." })
    );

    const result = await evaluateReading(SEGMENT, SUBMISSION);
    expect(result.feedback.limitations.toLowerCase()).toContain("khuyến nghị");
    expect(result.feedback.limitations.toLowerCase()).toContain("điều trị");
    expect(result.feedback.limitations).not.toBe("Điểm chỉ là ước tính luyện tập.");
  });

  it("model trả limitations ĐÚNG chuẩn → giữ nguyên, không ghi đè", async () => {
    generateContent.mockResolvedValue(geminiResponse(VALID_FEEDBACK));
    const result = await evaluateReading(SEGMENT, SUBMISSION);
    expect(result.feedback.limitations).toBe(VALID_FEEDBACK.limitations);
  });

  it("scores từ model chỉ được kind=practice_estimate (không band IELTS chính thức)", async () => {
    generateContent.mockResolvedValue(geminiResponse(VALID_FEEDBACK));
    const result = await evaluateReading(SEGMENT, SUBMISSION);
    for (const score of result.feedback.scores) {
      expect(score.kind).toBe("practice_estimate");
    }
  });

  it("JSON không đúng schema → lỗi tiếng Việt sau đúng 2 lần gọi (retry-once policy thật)", async () => {
    generateContent.mockResolvedValue(geminiResponse({ khong: "dung schema" }));
    await expect(evaluateReading(SEGMENT, SUBMISSION)).rejects.toThrow(
      /JSON không đúng schema/
    );
    // Chính sách retry thật của callGeminiWithRetry: schema sai → thử lại đúng 1 lần.
    expect(generateContent).toHaveBeenCalledTimes(2);
  });
});
