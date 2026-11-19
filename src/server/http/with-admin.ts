/**
 * withAdmin(handler) — like withLearner, plus requires learners.role = "admin".
 * The guard runs INSIDE the try/catch so a throwing getCurrentLearner()
 * (e.g. missing env) becomes a 503 JSON instead of an unhandled route error —
 * this fixes the existing bug where guardAdmin() is awaited before try.
 */
import type { NextRequest } from "next/server";
import { getCurrentLearner, type CurrentLearner } from "@/server/auth";
import { apiError } from "./api-error";
import { mapServiceError } from "./map-service-error";
import type { LearnerHandlerArgs } from "./with-learner";

export function withAdmin<TParams = unknown>(
  handler: (
    args: LearnerHandlerArgs<TParams>
  ) => Promise<Response> | Response
) {
  return async function wrappedRoute(
    req: NextRequest,
    routeCtx?: { params?: Promise<TParams> }
  ): Promise<Response> {
    try {
      const learner: CurrentLearner | null = await getCurrentLearner();
      if (!learner) {
        return apiError(
          "unauthorized",
          "Unauthorized — Vui lòng đăng nhập.",
          401
        );
      }
      if (learner.role !== "admin") {
        return apiError(
          "forbidden",
          "Forbidden — Chỉ tài khoản Admin mới có quyền truy cập.",
          403
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
