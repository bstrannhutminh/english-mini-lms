import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { parseJson } from "@/server/http";
import { createVocabulary, getLearnerVocabulary } from "@/server/vocabulary/service";
import {
  createVocabularyRequestSchema,
  type VocabularyListResponse,
} from "@/contracts/vocabulary";

/**
 * POST /api/v1/vocabulary — lưu từ mới vào Sổ từ (Quick-Capture 1 chạm).
 * learner_id lấy từ session (withLearner), không nhận từ body.
 */
export const POST = withLearner(async ({ req, learner }) => {
  const body = await parseJson(req, createVocabularyRequestSchema);
  const vocabulary = await createVocabulary(learner.id, body);
  return NextResponse.json({ vocabulary }, { status: 201 });
});

/**
 * GET /api/v1/vocabulary?filter=all|due|mastered — danh sách Sổ từ.
 */
export const GET = withLearner(async ({ req, learner }) => {
  const { searchParams } = new URL(req.url);
  const filterParam = searchParams.get("filter");
  const filter =
    filterParam === "due" || filterParam === "mastered" ? filterParam : "all";

  const items = await getLearnerVocabulary(learner.id, filter);
  const payload: VocabularyListResponse = { items };
  return NextResponse.json(payload);
});
