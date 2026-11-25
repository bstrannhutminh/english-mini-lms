import {
  SpeakingFeedbackSchema,
  EvaluateSpeakingAudio,
  EvaluateSpeakingResult,
} from "./types";
import { getGeminiClient } from "./client";
import { callGeminiWithRetry } from "./call-gemini";
import { generateValidatedJson } from "./generate-validated-json";
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
      const result = await generateValidatedJson({
        ai,
        modelName,
        contents: textPrompt,
        systemInstruction: SPEAKING_SYSTEM_INSTRUCTION,
        responseSchema: speakingJsonSchema,
        temperature: 0.2,
        schema: SpeakingFeedbackSchema,
      });

      // Đảm bảo nghiêm ngặt bất biến not_assessable
      result.data.pronunciation = {
        status: "not_assessable",
        notes: "Không thể chấm phát âm do thiếu dữ liệu âm thanh thực tế.",
      };

      return {
        feedback: result.data,
        tokenInput: result.tokenInput,
        tokenOutput: result.tokenOutput,
        modelName: result.modelName,
      };
    }, "evaluateSpeaking(no-audio)");
  }

  // Trường hợp CÓ FILE AUDIO THỰC TẾ: Gửi trực tiếp audio buffer qua multimodal inlineData
  const promptText = buildSpeakingAudioPrompt(prompt, context);

  async function callGeminiAudioOnce() {
    const result = await generateValidatedJson({
      ai,
      modelName,
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
            { text: promptText },
          ],
        },
      ],
      systemInstruction: SPEAKING_SYSTEM_INSTRUCTION,
      responseSchema: speakingJsonSchema,
      temperature: 0.2,
      schema: SpeakingFeedbackSchema,
      schemaErrorPrefix: "Phản hồi Speaking không đúng schema",
      parseErrorPrefix: "Lỗi parse JSON phản hồi từ Gemini",
    });

    // Đảm bảo tối đa 3 observations
    if (result.data.observations.length > 3) {
      result.data.observations = result.data.observations.slice(0, 3);
    }

    return {
      feedback: result.data,
      tokenInput: result.tokenInput,
      tokenOutput: result.tokenOutput,
      modelName: result.modelName,
    };
  }

  // Chính sách retry chung: chỉ retry khi JSON/schema sai.
  return callGeminiWithRetry(callGeminiAudioOnce, "evaluateSpeaking");
}
