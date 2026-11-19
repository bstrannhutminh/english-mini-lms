import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { compareTopicKeys } from "@/lib/topics";
import type { TopicSummary } from "./types";

/**
 * Danh sách chủ đề (distinct) của các bài đã approved, kèm số bài.
 * Nếu truyền learnerId: kèm số bài learner đã nộp (≥1 submission chưa xoá).
 * Thứ tự: chủ đề đã chốt → chủ đề lạ (ABC) → "Chưa phân loại" cuối.
 */
export async function getTopics(learnerId?: string): Promise<TopicSummary[]> {
  // Lưu ý: Drizzle bỏ tiền tố bảng cho cột trong truy vấn 1 bảng → dùng alias SQL tường minh
  // trong subquery để không bị "ambiguous column id".
  const learnedExpr = learnerId
    ? sql<string>`count(*) filter (where exists (
        select 1 from submissions s
        inner join learning_sessions ls on s.session_id = ls.id
        where ls.activity_id = activities.id
          and s.learner_id = ${learnerId}
          and s.deleted_at is null
      ))`
    : sql<string>`0`;

  const rows = await db
    .select({
      topic: activities.topic,
      activityCount: sql<string>`count(*)`,
      learnedCount: learnedExpr,
    })
    .from(activities)
    .where(eq(activities.reviewState, "approved"))
    .groupBy(activities.topic);

  return rows
    .map((r) => ({
      topic: r.topic,
      activityCount: Number(r.activityCount),
      learnedCount: Number(r.learnedCount),
    }))
    .sort((a, b) => compareTopicKeys(a.topic, b.topic));
}
