import { NextResponse } from "next/server";
import { withLearner, parseJson } from "@/server/http";
import { updateVocabulary } from "@/server/vocabulary/service";
import { updateVocabularyRequestSchema } from "@/contracts/vocabulary";

/**
 * PATCH /api/v1/vocabulary/[id] — sửa my_attempt / mastery_level /
 * context_meaning của từ thuộc sở hữu learner (id + learner từ session).
 */
export const PATCH = withLearner<{ id: string }>(
  async ({ req, learner, params }) => {
    const body = await parseJson(req, updateVocabularyRequestSchema);
    const updated = await updateVocabulary(params.id, learner.id, body);
    return NextResponse.json({ vocabulary: updated });
  }
);
