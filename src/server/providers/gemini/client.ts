import { GoogleGenAI } from "@google/genai";
import { getEnv } from "@/lib/env";

export const GEMINI_TIMEOUT_MS = 55_000; // 55 giây (dưới maxDuration=60s của Vercel)

export function getGeminiClient(): GoogleGenAI {
  // getEnv() validates toàn bộ env bằng zod và nêu TÊN biến thiếu bằng
  // tiếng Việt (EnvError → mapServiceError trả 503). Gọi lazy tại request time.
  const apiKey = getEnv().GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment");
  }
  return new GoogleGenAI({ apiKey });
}
