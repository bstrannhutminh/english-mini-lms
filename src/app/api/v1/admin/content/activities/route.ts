import { NextResponse } from "next/server";
import { adminActivityCreateSchema } from "@/contracts/admin-content";
import { parseJson, withAdmin } from "@/server/http";
import { ContentError } from "@/server/admin/content-errors";
import { createContentActivity, listContentActivities } from "@/server/admin/content-service";
import { REVIEW_STATES, isOneOf } from "@/lib/content-constants";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ req }) => {
  const state = new URL(req.url).searchParams.get("state") ?? "all";
  if (state !== "all" && !isOneOf(REVIEW_STATES, state)) {
    throw new ContentError(422, "state phải là all hoặc một reviewState hợp lệ");
  }
  return NextResponse.json({ activities: await listContentActivities(state) });
});

export const POST = withAdmin(async ({ req }) => {
  const body = await parseJson(req, adminActivityCreateSchema);
  const activity = await createContentActivity(body);
  return NextResponse.json({ activity }, { status: 201 });
});
