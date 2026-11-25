/**
 * fetchTodayInputs — gom 7 truy vấn đọc độc lập của màn Hôm nay vào một
 * Promise.all (trước đây nối tiếp 7 lượt chờ DB). Thuần đọc; toàn bộ suy
 * diễn nghiệp vụ (chọn bài, nhịp tuần, kế hoạch phiên) nằm ở service.ts.
 */
import { eq, and, gte, isNull, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  learners,
  learningSessions,
  submissions,
} from "@/db/schema";
import { countDueVocabulary } from "@/server/vocabulary/capture";
import { getLearnerPracticeContext } from "./pick-activity";
import { startOfTodayVietnam } from "./daily-plan";

export async function fetchTodayInputs(learnerId: string) {
  const [
    [learner],
    dueVocabCount,
    ctx,
    approvedActs,
    completedSessions,
    [inProgress],
    todaySubs,
  ] = await Promise.all([
    // 1. Thông tin người học
    db
      .select({
        displayName: learners.displayName,
        baselineStatus: learners.baselineStatus,
      })
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1),
    // 2. Số từ vựng đến hạn ôn tập (Spaced Repetition) — qua countDueVocabulary
    //    đã bọc React cache(): cùng request với badge ở layout thì chỉ 1 truy vấn.
    countDueVocabulary(learnerId),
    // 3. Ngữ cảnh luyện tập: nháp dở, bài cần sửa, cân bằng 4 kỹ năng (module dùng chung)
    getLearnerPracticeContext(learnerId),
    // 4. Danh sách các hoạt động đã được phê duyệt (approved)
    db
      .select({
        id: activities.id,
        slot: activities.slot,
        title: activities.title,
        mode: activities.mode,
        objective: activities.objective,
        durationMinutes: activities.durationMinutes,
      })
      .from(activities)
      .where(eq(activities.reviewState, "approved")),
    // 6. Các phiên đã hoàn thành — tính streak và nhịp 7 ngày
    db
      .select({
        updatedAt: learningSessions.updatedAt,
        activeSeconds: learningSessions.activeSeconds,
      })
      .from(learningSessions)
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          eq(learningSessions.status, "completed")
        )
      )
      .orderBy(desc(learningSessions.updatedAt)),
    // 7. Phiên học đang dở (active hoặc paused) gần nhất
    db
      .select({
        sessionId: learningSessions.id,
        activityId: learningSessions.activityId,
        targetMinutes: learningSessions.targetMinutes,
        status: learningSessions.status,
        activityTitle: activities.title,
        activityMode: activities.mode,
        activitySlot: activities.slot,
      })
      .from(learningSessions)
      .innerJoin(activities, eq(learningSessions.activityId, activities.id))
      .where(
        and(
          eq(learningSessions.learnerId, learnerId),
          inArray(learningSessions.status, ["active", "paused"])
        )
      )
      .orderBy(desc(learningSessions.updatedAt))
      .limit(1),
    // 8. Bài nộp "hôm nay" (mốc 00:00 giờ VN — cùng computeStreakDays) để
    // suy ra kế hoạch phiên: đã nộp bài chính chưa, đã sửa bản nào chưa.
    db
      .select({
        revision: submissions.revision,
        parentId: submissions.parentId,
      })
      .from(submissions)
      .where(
        and(
          eq(submissions.learnerId, learnerId),
          isNull(submissions.deletedAt),
          gte(submissions.submittedAt, startOfTodayVietnam())
        )
      ),
  ]);

  return {
    learner,
    dueVocabCount,
    ctx,
    approvedActs,
    completedSessions,
    inProgress,
    todaySubs,
  };
}
