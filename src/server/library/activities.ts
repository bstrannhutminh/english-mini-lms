import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { UNCATEGORIZED_TOPIC } from "@/lib/topics";
import { deriveLearningStatus } from "./learning-status";
import type { ActivityListItem } from "./types";

/**
 * Lấy danh sách activity đã approved để hiển thị trên /library.
 * ĐẢM BẢO AN TOÀN TUYỆT ĐỐI:
 * - Chỉ nạp review_state = approved (bỏ qua draft, reviewing, rejected, retired).
 * - Tuyệt đối không chọn questions_file, rubric_json, đáp án ra ngoài client.
 *
 * topicFilter: undefined/"all" = không lọc; "uncategorized" = bài chưa có topic;
 * giá trị khác = đúng chủ đề đó.
 *
 * learnerId (tùy chọn): nếu truyền sẽ join tính trạng thái học gộp (Đang học dở / Đã nộp N lần / Chưa học).
 */
export async function getApprovedActivities(
  modeFilter?: string,
  topicFilter?: string,
  learnerId?: string
): Promise<ActivityListItem[]> {
  const conditions = [eq(activities.reviewState, "approved")];

  if (modeFilter && modeFilter !== "all") {
    conditions.push(
      eq(activities.mode, modeFilter as (typeof activities.$inferSelect)["mode"])
    );
  }

  if (topicFilter && topicFilter !== "all") {
    conditions.push(
      topicFilter === UNCATEGORIZED_TOPIC
        ? isNull(activities.topic)
        : eq(activities.topic, topicFilter)
    );
  }

  const inProgressExpr = learnerId
    ? sql<boolean>`exists (
        select 1 from learning_sessions ls
        where ls.activity_id = activities.id
          and ls.learner_id = ${learnerId}
          and ls.status in ('active', 'paused')
      )`
    : sql<boolean>`false`;

  const submissionCountExpr = learnerId
    ? sql<number>`coalesce((
        select count(s.id)::int from submissions s
        inner join learning_sessions ls on s.session_id = ls.id
        where ls.activity_id = activities.id
          and s.learner_id = ${learnerId}
          and s.deleted_at is null
      ), 0)`
    : sql<number>`0`;

  const rows = await db
    .select({
      id: activities.id,
      slot: activities.slot,
      mode: activities.mode,
      title: activities.title,
      objective: activities.objective,
      durationMinutes: activities.durationMinutes,
      difficulty: activities.difficulty,
      purpose: activities.purpose,
      output: activities.output,
      topic: activities.topic,
      hasInProgress: inProgressExpr,
      submissionCount: submissionCountExpr,
    })
    .from(activities)
    .where(and(...conditions))
    .orderBy(activities.slot, activities.id);

  return rows.map((r) => {
    const subCount = Number(r.submissionCount || 0);
    return {
      id: r.id,
      slot: r.slot,
      mode: r.mode,
      title: r.title,
      objective: r.objective,
      durationMinutes: r.durationMinutes,
      difficulty: r.difficulty,
      purpose: r.purpose,
      output: r.output,
      topic: r.topic,
      learningStatus: deriveLearningStatus(Boolean(r.hasInProgress), subCount),
      submissionCount: subCount,
    };
  });
}
