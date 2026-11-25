import { NextResponse } from "next/server";
import { adminSourceCreateSchema } from "@/contracts/admin-content";
import { parseJson, withAdmin } from "@/server/http";
import { ContentError } from "@/server/admin/content-errors";
import { createContentSource, listContentSources } from "@/server/admin/content-sources-service";
import { REVIEW_STATES, isOneOf } from "@/lib/content-constants";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ req }) => {
  const state = new URL(req.url).searchParams.get("state") ?? "all";
  if (state !== "all" && !isOneOf(REVIEW_STATES, state)) {
    throw new ContentError(422, "state phải là all hoặc một reviewState hợp lệ");
  }
  return NextResponse.json({ sources: await listContentSources(state) });
});

export const POST = withAdmin(async ({ req }) => {
  const body = await parseJson(req, adminSourceCreateSchema);
  const source = await createContentSource(body);
  return NextResponse.json({ source }, { status: 201 });
});
