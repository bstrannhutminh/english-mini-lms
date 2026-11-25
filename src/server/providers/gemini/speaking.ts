import {
  SpeakingFeedbackSchema,
  EvaluateSpeakingAudio,
  EvaluateSpeakingResult,
} from "./types";
import { getGeminiClient } from "./client";
import {
  GeminiResponseError,
  callGeminiWithRetry,
  geminiAbortSignal,
} from "./call-gemini";
import {
  SPEAKING_SYSTEM_INSTRUCTION,
  speakingJsonSchema,
  buildSpeakingAudioPrompt,
  buildSpeakingTextOnlyPrompt,
  type SpeakingEvalContext,
} from "./speaking-prompt";

// Re-export: prompt builders + schema dùng chung cho test và caller —
// implement nằm trong speaking-prompt.ts (tách để giữ file ≤200 dòng).
export {
  SPEAKING_SYSTEM_INSTRUCTION,
  speakingJsonSchema,
  buildSpeakingAudioPrompt,
  buildSpeakingTextOnlyPrompt,
  type SpeakingEvalContext,
};

export async function evaluateSpeaking(
  audioFile: EvaluateSpeakingAudio | null,
  prompt: string,
  context: SpeakingEvalContext = {},
  modelName = "gemini-2.5-flash"
): Promise<EvaluateSpeakingResult> {
  const ai = getGeminiClient();

  // BẤT BIẾN SỐ 3: Nếu không có file audio (hoặc rỗng), TUYỆT ĐỐI không chấm phát âm từ transcript
  if (!audioFile || !audioFile.buffer || audioFile.buffer.length === 0) {
    const textPrompt = buildSpeakingTextOnlyPrompt(prompt, context);

    // Đường text-only: vẫn timeout + retry-on-schema như các nhánh khác.
    return callGeminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: textPrompt,
        config: {
          systemInstruction: SPEAKING_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          responseSchema: speakingJsonSchema as any,
          temperature: 0.2,
          abortSignal: geminiAbortSignal(),
        },
      });

      const responseText = response.text || "";
      let parsed: unknown;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        throw new GeminiResponseError(`Gemini không trả về JSON hợp lệ: ${e instanceof Error ? e.message : String(e)}`);
      }

      const validated = SpeakingFeedbackSchema.safeParse(parsed);
      if (!validated.success) {
        throw new GeminiResponseError(`JSON không đúng schema: ${validated.error.message}`);
      }

      // Đảm bảo nghiêm ngặt bất biến not_assessable
      validated.data.pronunciation = {
        status: "not_assessable",
        notes: "Không thể chấm phát âm do thiếu dữ liệu âm thanh thực tế.",
      };

      return {
        feedback: validated.data,
        tokenInput: response.usageMetadata?.promptTokenCount || 0,
        tokenOutput: response.usageMetadata?.candidatesTokenCount || 0,
        modelName,
      };
    }, "evaluateSpeaking(no-audio)");
  }

  // Trường hợp CÓ FILE AUDIO THỰC TẾ: Gửi trực tiếp audio buffer qua multimodal inlineData
  const promptText = buildSpeakingAudioPrompt(prompt, context);

  async function callGeminiAudioOnce() {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: audioFile!.mimeType,
                data: audioFile!.buffer.toString("base64"),
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SPEAKING_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseSchema: speakingJsonSchema as any,
        temperature: 0.2,
        abortSignal: geminiAbortSignal(),
      },
    });

    const responseText = response.text || "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      throw new GeminiResponseError(`Lỗi parse JSON phản hồi từ Gemini: ${e instanceof Error ? e.message : String(e)}`);
    }

    const validated = SpeakingFeedbackSchema.safeParse(parsed);
    if (!validated.success) {
      throw new GeminiResponseError(`Phản hồi Speaking không đúng schema: ${validated.error.message}`);
    }

    // Đảm bảo tối đa 3 observations
    if (validated.data.observations.length > 3) {
      validated.data.observations = validated.data.observations.slice(0, 3);
    }

    return {
      feedback: validated.data,
      tokenInput: response.usageMetadata?.promptTokenCount || 0,
      tokenOutput: response.usageMetadata?.candidatesTokenCount || 0,
      modelName,
    };
  }

  // Chính sách retry chung: chỉ retry khi JSON/schema sai.
  return callGeminiWithRetry(callGeminiAudioOnce, "evaluateSpeaking");
}
