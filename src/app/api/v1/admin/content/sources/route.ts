import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, withAdmin } from "@/server/http";
import { ContentError } from "@/server/admin/content-errors";
import { createContentSource, listContentSources } from "@/server/admin/content-sources-service";
import { REVIEW_STATES, isOneOf } from "@/lib/content-constants";

export const dynamic = "force-dynamic";

const objectBodySchema = z.looseObject({});

export const GET = withAdmin(async ({ req }) => {
  const state = new URL(req.url).searchParams.get("state") ?? "all";
  if (state !== "all" && !isOneOf(REVIEW_STATES, state)) {
    throw new ContentError(422, "state phải là all hoặc một reviewState hợp lệ");
  }
  return NextResponse.json({ sources: await listContentSources(state) });
});

export const POST = withAdmin(async ({ req }) => {
  const body = await parseJson(req, objectBodySchema);
  const source = await createContentSource(body);
  return NextResponse.json({ source }, { status: 201 });
});
