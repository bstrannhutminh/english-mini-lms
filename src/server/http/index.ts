/**
 * Shared HTTP helpers for /api/v1 routes.
 * New routes: `export const GET = withLearner(async ({learner}) => ...)`.
 */
export { ApiRouteError } from "./errors";
export { apiError } from "./api-error";
export { mapServiceError } from "./map-service-error";
export { parseJson } from "./parse-json";
export { withLearner, type LearnerHandlerArgs } from "./with-learner";
export { withAdmin } from "./with-admin";
