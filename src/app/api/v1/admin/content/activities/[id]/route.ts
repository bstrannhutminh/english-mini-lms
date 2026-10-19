import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, withAdmin } from "@/server/http";
import { updateContentActivity } from "@/server/admin/content-service";

export const dynamic = "force-dynamic";

const objectBodySchema = z.looseObject({});

// Cố ý KHÔNG có DELETE: muốn gỡ bài thì PATCH { reviewState: "retired" }.
export const PATCH = withAdmin<{ id: string }>(async ({ req, params }) => {
  const body = await parseJson(req, objectBodySchema);
  const activity = await updateContentActivity(params.id, body);
  return NextResponse.json({ activity });
});
