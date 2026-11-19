import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, withAdmin } from "@/server/http";
import { updateContentSource } from "@/server/admin/content-sources-service";

export const dynamic = "force-dynamic";

const objectBodySchema = z.looseObject({});

// Cố ý KHÔNG có DELETE: gỡ nguồn bằng PATCH { reviewState: "retired" }.
export const PATCH = withAdmin<{ id: string }>(async ({ req, params }) => {
  const body = await parseJson(req, objectBodySchema);
  const source = await updateContentSource(params.id, body);
  return NextResponse.json({ source });
});
