import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { quickCapture } from "@/server/vocabulary/service";
import { quickCaptureRequestSchema } from "@/contracts/vocabulary";

export const maxDuration = 60;

/**
 * POST /api/v1/vocabulary/quick-capture — tra cứu chuyên ngành qua Gemini
 * cho đoạn văn bản được bôi đen. Trả về {phrase, ipa, context_meaning,
 * example_sentence} (snake_case, khớp contract cũ).
 */
export const POST = withLearner(async ({ req, learner }) => {
  const body = await parseJson(req, quickCaptureRequestSchema);

  const effectiveSentence =
    body.surrounding_sentence.trim() || body.selected_text.trim();

  const result = await quickCapture(
    body.selected_text.trim(),
    effectiveSentence,
    body.source_ref,
    learner.id
  );

  return NextResponse.json(result);
});
