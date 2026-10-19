import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, withAdmin } from "@/server/http";
import { ContentError } from "@/server/admin/content-errors";
import { createContentActivity, listContentActivities } from "@/server/admin/content-service";
import { REVIEW_STATES, isOneOf } from "@/lib/content-constants";

export const dynamic = "force-dynamic";

/** Admin CRUD bodies are validated field-by-field inside the services
 * (better Vietnamese messages); the route only guarantees a JSON object. */
const objectBodySchema = z.looseObject({});

export const GET = withAdmin(async ({ req }) => {
  const state = new URL(req.url).searchParams.get("state") ?? "all";
  if (state !== "all" && !isOneOf(REVIEW_STATES, state)) {
    throw new ContentError(422, "state phải là all hoặc một reviewState hợp lệ");
  }
  return NextResponse.json({ activities: await listContentActivities(state) });
});

export const POST = withAdmin(async ({ req }) => {
  const body = await parseJson(req, objectBodySchema);
  const activity = await createContentActivity(body);
  return NextResponse.json({ activity }, { status: 201 });
});
