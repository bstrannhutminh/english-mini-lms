/**
 * withLearner(handler) — wrap an /api/v1 route handler:
 *  - resolves the Supabase session → learners row via getCurrentLearner()
 *  - learner_id always comes from the session, NEVER from request bodies
 *  - 401 JSON when unauthenticated; handler errors flow through
 *    mapServiceError() so service Validation/Conflict/etc. map to 4xx.
 *
 * Next 16 note: route `params` is a Promise — we await it before handing
 * the resolved value to the handler.
 */
import type { NextRequest } from "next/server";
import { getCurrentLearner, type CurrentLearner } from "@/server/auth";
import { apiError } from "./api-error";
import { mapServiceError } from "./map-service-error";

export interface LearnerHandlerArgs<TParams> {
  req: NextRequest;
  learner: CurrentLearner;
  /** Resolved route params (undefined for routes without dynamic segments). */
  params: TParams;
}

export function withLearner<TParams = unknown>(
  handler: (
    args: LearnerHandlerArgs<TParams>
  ) => Promise<Response> | Response
) {
  return async function wrappedRoute(
    req: NextRequest,
    routeCtx?: { params?: Promise<TParams> }
  ): Promise<Response> {
    try {
      const learner = await getCurrentLearner();
      if (!learner) {
        return apiError(
          "unauthorized",
          "Chưa đăng nhập — vui lòng đăng nhập lại.",
          401
        );
      }
      const params = (
        routeCtx?.params ? await routeCtx.params : undefined
      ) as TParams;
      return await handler({ req, learner, params });
    } catch (error) {
      return mapServiceError(error);
    }
  };
}
