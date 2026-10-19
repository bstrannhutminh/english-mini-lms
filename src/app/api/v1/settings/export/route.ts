import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { exportLearnerData } from "@/server/settings/export-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/settings/export — tải về JSON toàn bộ dữ liệu học tập của
 * learner (kèm signed URL media hạn 24h). learner_id từ session.
 */
export const GET = withLearner(async ({ learner }) => {
  const exportPayload = await exportLearnerData(learner.id);
  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="english-mini-lms-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});
