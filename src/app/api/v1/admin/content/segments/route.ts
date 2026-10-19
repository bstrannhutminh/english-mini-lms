import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, withAdmin } from "@/server/http";
import { createContentSegment, listContentSegments } from "@/server/admin/content-sources-service";

export const dynamic = "force-dynamic";

const objectBodySchema = z.looseObject({});

export const GET = withAdmin(async () => {
  return NextResponse.json({ segments: await listContentSegments() });
});

export const POST = withAdmin(async ({ req }) => {
  const body = await parseJson(req, objectBodySchema);
  const segment = await createContentSegment(body);
  return NextResponse.json({ segment }, { status: 201 });
});
