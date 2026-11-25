/**
 * Pipeline Gemini JSON dùng chung: gọi generateContent với timeout chung,
 * parse JSON, validate bằng zod contract phía server và trích token usage.
 * Retry/error tiếng Việt vẫn do callGeminiWithRetry điều phối.
 */
import type { ContentListUnion, GoogleGenAI } from "@google/genai";
import type { z } from "zod";
import { GeminiResponseError, geminiAbortSignal } from "./call-gemini";

export interface GenerateValidatedJsonOptions<T> {
  ai: GoogleGenAI;
  modelName: string;
  contents: ContentListUnion;
  systemInstruction: string;
  responseSchema: unknown;
  temperature: number;
  schema: z.ZodType<T>;
  /** Một số provider cũ có prefix lỗi riêng; giữ nguyên để test/message không đổi. */
  schemaErrorPrefix?: string;
  parseErrorPrefix?: string;
}

export interface ValidatedGeminiResult<T> {
  data: T;
  tokenInput: number;
  tokenOutput: number;
  modelName: string;
}

export async function generateValidatedJson<T>({
  ai,
  modelName,
  contents,
  systemInstruction,
  responseSchema,
  temperature,
  schema,
  schemaErrorPrefix = "JSON không đúng schema",
  parseErrorPrefix = "Gemini không trả về JSON hợp lệ",
}: GenerateValidatedJsonOptions<T>): Promise<ValidatedGeminiResult<T>> {
  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      // SDK genai định kiểu responseSchema theo Type/enum nội bộ; schema JSON
      // của ta vẫn là object literal tương thích runtime. Giữ cast cục bộ này.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSchema: responseSchema as any,
      temperature,
      abortSignal: geminiAbortSignal(),
    },
  });

  const responseText = response.text || "";
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(responseText);
  } catch (parseError) {
    throw new GeminiResponseError(
      `${parseErrorPrefix}: ${parseError instanceof Error ? parseError.message : String(parseError)}`
    );
  }

  const validated = schema.safeParse(parsedJson);
  if (!validated.success) {
    throw new GeminiResponseError(`${schemaErrorPrefix}: ${validated.error.message}`);
  }

  return {
    data: validated.data,
    tokenInput: response.usageMetadata?.promptTokenCount || 0,
    tokenOutput: response.usageMetadata?.candidatesTokenCount || 0,
    modelName,
  };
}
