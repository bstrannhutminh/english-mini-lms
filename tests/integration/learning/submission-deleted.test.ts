import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { describe, it, expect } from "vitest";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { learners, learningSessions, submissions, activities } from "@/db/schema";
import { getSubmissionWithFeedback } from "@/server/learning/service";

describe("Submissions Soft Delete Filtering (Vá 5)", () => {
  it("getSubmissionWithFeedback and PATCH query filter out soft-deleted submissions", async () => {
    // 1. Lấy learner và activity có sẵn
    const [learner] = await db.select().from(learners).limit(1);
    expect(learner).toBeDefined();

    const [act] = await db.select().from(activities).limit(1);
    expect(act).toBeDefined();

    // 2. Tạo 1 session và 1 submission
    const [session] = await db
      .insert(learningSessions)
      .values({
        learnerId: learner.id,
        activityId: act.id,
        targetMinutes: 15,
        status: "completed",
      })
      .returning();

    const [sub] = await db
      .insert(submissions)
      .values({
        sessionId: session.id,
        learnerId: learner.id,
        revision: 1,
        modality: "audio",
        assisted: false,
        body: JSON.stringify({ transcript: "Original test transcript" }),
        confirmedTranscript: null,
      })
      .returning();

    // Trước khi xoá mềm: getSubmissionWithFeedback trả về dữ liệu
    const beforeDelete = await getSubmissionWithFeedback(sub.id, learner.id);
    expect(beforeDelete).not.toBeNull();
    expect(beforeDelete?.submission.id).toBe(sub.id);

    // 3. Xoá mềm (soft delete)
    await db
      .update(submissions)
      .set({ deletedAt: new Date() })
      .where(eq(submissions.id, sub.id));

    // Sau khi xoá mềm: getSubmissionWithFeedback trả về null
    const afterDelete = await getSubmissionWithFeedback(sub.id, learner.id);
    expect(afterDelete).toBeNull();

    // 4. Kiểm tra điều kiện WHERE của PATCH:
    // and(eq(id, sub.id), eq(learnerId, learner.id), isNull(deletedAt))
    const [patchFindResult] = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(
        and(
          eq(submissions.id, sub.id),
          eq(submissions.learnerId, learner.id),
          isNull(submissions.deletedAt)
        )
      )
      .limit(1);

    expect(patchFindResult).toBeUndefined();

    // Dọn dẹp
    await db.delete(submissions).where(eq(submissions.id, sub.id));
    await db.delete(learningSessions).where(eq(learningSessions.id, session.id));
  });
});
