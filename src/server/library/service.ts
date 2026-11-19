/**
 * Barrel giữ tương thích import cũ (`@/server/library/service`).
 * Implement đã tách: types.ts, learning-status.ts, activities.ts,
 * topics.ts, detail.ts — hãy import trực tiếp file con ở code mới.
 */
export type {
  ActivityListItem,
  TopicSummary,
  ActivityDetail,
} from "./types";
export { deriveLearningStatus } from "./learning-status";
export { getApprovedActivities } from "./activities";
export { getTopics } from "./topics";
export { getActivityDetail } from "./detail";
