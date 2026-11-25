import { NextResponse } from "next/server";
import { adminSegmentUpdateSchema } from "@/contracts/admin-content";
import { parseJson, withAdmin } from "@/server/http";
import { updateContentSegment } from "@/server/admin/content-sources-service";

export const dynamic = "force-dynamic";

// Cố ý KHÔNG có DELETE: segment không có trạng thái, chỉ có thể gỡ khỏi bài (PATCH segmentIds của activity).
export const PATCH = withAdmin<{ id: string }>(async ({ req, params }) => {
  const body = await parseJson(req, adminSegmentUpdateSchema);
  const segment = await updateContentSegment(params.id, body);
  return NextResponse.json({ segment });
});
