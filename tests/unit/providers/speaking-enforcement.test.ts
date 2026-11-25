/**
 * INVARIANT 3 — Speaking không có audio thật → pronunciation BẮT BUỘC
 * not_assessable, kể cả khi model tự ý chấm phát âm từ transcript.
 *
 * Chạy evaluateSpeaking THẬT — chỉ mock ranh giới network (getGeminiClient).
 * Trước đây invariant này chỉ được kiểm chứng bằng test integration gọi
 * Gemini thật (tests/integration/speaking-listening) — nay có bản hermetic;
 * bản live còn lại chỉ là smoke test opt-in ở tests/live/.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@/server/providers/gemini/client", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/server/providers/gemini/client")>();
  return {
    ...original,
    getGeminiClient: () => ({ models: { generateContent } }),
  };
});

import { evaluateSpeaking } from "@/server/providers/gemini/speaking";

/** Feedback hợp lệ theo SpeakingFeedbackSchema nhưng model VI PHẠM invariant:
 *  tự chấm phát âm dù không hề có audio. */
const MODEL_VIOLATES = {
  transcript: "hello world this is my answer",
  observations: [],
  pronunciation: { status: "assessed", notes: "Phát âm rõ ràng, trọng âm tốt." },
  retry_prompt: "Nói lại câu mở đầu.",
  strengths: ["Đủ ý chính"],
  next_action: "Luyện thêm ngữ điệu.",
  limitations: "Không phải điểm thi chính thức.",
  scores: [{ kind: "practice_estimate", dimension: "fluency", value: 6 }],
};

function geminiResponse(payload: unknown) {
  return {
    text: JSON.stringify(payload),
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
  };
}

describe("evaluateSpeaking THẬT — enforcement not_assessable khi thiếu audio", () => {
  beforeEach(() => generateContent.mockReset());

  it("không audio + model tự chấm 'assessed' → code THẬT ghi đè về not_assessable", async () => {
    generateContent.mockResolvedValue(geminiResponse(MODEL_VIOLATES));

    const result = await evaluateSpeaking(null, "Đề: giới thiệu bản thân");
    expect(result.feedback.pronunciation.status).toBe("not_assessable");
    expect(result.feedback.pronunciation.notes).toBe(
      "Không thể chấm phát âm do thiếu dữ liệu âm thanh thực tế."
    );
  });

  it("audio rỗng (buffer length 0) cũng bị coi là không audio → not_assessable", async () => {
    generateContent.mockResolvedValue(geminiResponse(MODEL_VIOLATES));

    const result = await evaluateSpeaking(
      { buffer: Buffer.alloc(0), mimeType: "audio/webm" },
      "Đề"
    );
    expect(result.feedback.pronunciation.status).toBe("not_assessable");
    // Không được gửi inlineData audio rỗng lên model.
    const contents = generateContent.mock.calls[0][0].contents;
    expect(typeof contents).toBe("string");
  });

  it("nhánh text-only dùng prompt dán nhãn bài learner tự gõ, không gọi là transcript mẫu", async () => {
    generateContent.mockResolvedValue(geminiResponse(MODEL_VIOLATES));

    await evaluateSpeaking(null, "Đề mở", {
      learnerText: "bài gõ tay của learner",
    });
    const contents: string = generateContent.mock.calls[0][0].contents;
    expect(contents).toContain("BÀI LÀM DẠNG VĂN BẢN DO NGƯỜI HỌC TỰ GÕ");
    expect(contents).toContain("bài gõ tay của learner");
  });

  it("CÓ audio thật → pronunciation của model được giữ nguyên (assessed hợp lệ)", async () => {
    generateContent.mockResolvedValue(geminiResponse(MODEL_VIOLATES));

    const audio = { buffer: Buffer.from("real audio bytes"), mimeType: "audio/webm" };
    const result = await evaluateSpeaking(audio, "Đề");
    expect(result.feedback.pronunciation.status).toBe("assessed");
    expect(result.feedback.pronunciation.notes).toContain("Phát âm rõ ràng");
  });

  it("có audio thật → payload gửi lên là multimodal inlineData base64", async () => {
    generateContent.mockResolvedValue(geminiResponse(MODEL_VIOLATES));

    const audio = { buffer: Buffer.from("real audio bytes"), mimeType: "audio/webm" };
    await evaluateSpeaking(audio, "Đề");

    const contents = generateContent.mock.calls[0][0].contents;
    const parts = contents[0].parts;
    const inline = parts.find((p: { inlineData?: unknown }) => p.inlineData);
    expect(inline.inlineData.mimeType).toBe("audio/webm");
    expect(inline.inlineData.data).toBe(audio.buffer.toString("base64"));
  });

  it("model trả quá 3 observations → schema max(3) reject, retry đúng 1 lần rồi lỗi", async () => {
    const obs = {
      category: "fluency",
      location: "Câu 1",
      original: "x",
      issue: "y",
      suggestion: "z",
      example: "e",
      retry_prompt: "r",
    };
    generateContent.mockResolvedValue(
      geminiResponse({
        ...MODEL_VIOLATES,
        observations: [obs, obs, obs, obs, obs],
      })
    );

    await expect(evaluateSpeaking(null, "Đề")).rejects.toThrow(/schema/);
    // Retry-once policy thật: schema sai → thử lại đúng 1 lần, không lần 3.
    expect(generateContent).toHaveBeenCalledTimes(2);
  });
});
