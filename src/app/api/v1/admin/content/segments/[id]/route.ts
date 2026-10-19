import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, withAdmin } from "@/server/http";
import { updateContentSegment } from "@/server/admin/content-sources-service";

export const dynamic = "force-dynamic";

const objectBodySchema = z.looseObject({});

// Cố ý KHÔNG có DELETE: segment không có trạng thái, chỉ có thể gỡ khỏi bài (PATCH segmentIds của activity).
export const PATCH = withAdmin<{ id: string }>(async ({ req, params }) => {
  const body = await parseJson(req, objectBodySchema);
  const segment = await updateContentSegment(params.id, body);
  return NextResponse.json({ segment });
});
