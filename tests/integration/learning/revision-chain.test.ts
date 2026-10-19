import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  learners,
  learningSessions,
  submissions,
  assessments,
  feedbackVersions,
  activities,
} from "@/db/schema";
import * as geminiProvider from "@/server/providers/gemini";
import {
  createSession,
  createSubmissionAndAssess,
  getSubmissionWithFeedback,
} from "@/server/learning/service";
import { getLearnerPracticeContext } from "@/server/today/pick-activity";
import { ValidationError } from "@/server/learning/session.service";

describe("Revision Chain (Bản 1 → Bản 2) Invariants & Validation", () => {
  let learner1Id: string;
  let learner2Id: string;
  const createdSessionIds: string[] = [];
  const createdSubmissionIds: string[] = [];

  beforeAll(async () => {
    // Mock Gemini AI để test không tốn token và chạy nhanh
    vi.spyOn(geminiProvider, "evaluateWriting").mockResolvedValue({
      feedback: {
        observations: [],
        strengths: ["Tốt"],
        next_action: "Luyện thêm",
        limitations: "Tập luyện",
        scores: [],
      },
      tokenInput: 50,
      tokenOutput: 20,
      modelName: "gemini-2.5-flash",
    });

    vi.spyOn(geminiProvider, "evaluateReading").mockResolvedValue({
      feedback: {
        observations: [],
        strengths: ["Đọc tốt"],
        next_action: "Luyện tập thêm",
        limitations: "Tập luyện",
        scores: [],
      },
      tokenInput: 50,
      tokenOutput: 20,
      modelName: "gemini-2.5-flash",
    });

    // Tự tạo 2 test learners — test phải hermetic trên DB trống,
    // không giả định có sẵn learner nào.
    const [l1, l2] = await db
      .insert(learners)
      .values([
        { userId: randomUUID(), displayName: "Test Learner R1" },
        { userId: randomUUID(), displayName: "Test Learner R2" },
      ])
      .returning({ id: learners.id });

    learner1Id = l1.id;
    learner2Id = l2.id;
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test
    for (const subId of createdSubmissionIds) {
      const assessRows = await db
        .select({ id: assessments.id })
        .from(assessments)
        .where(eq(assessments.submissionId, subId));
      for (const a of assessRows) {
        await db.delete(feedbackVersions).where(eq(feedbackVersions.assessmentId, a.id));
      }
      await db.delete(assessments).where(eq(assessments.submissionId, subId));
      await db.delete(submissions).where(eq(submissions.id, subId));
    }
    for (const sId of createdSessionIds) {
      await db.delete(learningSessions).where(eq(learningSessions.id, sId));
    }
    const learnerIds = [learner1Id, learner2Id].filter(Boolean);
    if (learnerIds.length > 0) {
      await db.delete(learners).where(inArray(learners.id, learnerIds));
    }
  });

  it("gợi ý start_revision chỉ chọn submission có assessment feedback_ready", async () => {
    // 1. Tạo 1 session & submission Bản 1 cho learner 1
    const session1 = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(session1.id);

    const [sub1] = await db
      .insert(submissions)
      .values({
        sessionId: session1.id,
        learnerId: learner1Id,
        revision: 1,
        body: "Bản 1 thử nghiệm kiểm tra gợi ý",
        modality: "text",
      })
      .returning();
    createdSubmissionIds.push(sub1.id);

    // Chưa có assessment -> getLearnerPracticeContext không được gợi ý sub1
    let context = await getLearnerPracticeContext(learner1Id);
    expect(context.unrevisedSubmission?.id).not.toBe(sub1.id);

    // Tạo assessment với status 'processing' -> không được gợi ý
    const [assess] = await db
      .insert(assessments)
      .values({
        submissionId: sub1.id,
        learnerId: learner1Id,
        status: "processing",
      })
      .returning();

    context = await getLearnerPracticeContext(learner1Id);
    expect(context.unrevisedSubmission?.id).not.toBe(sub1.id);

    // Cập nhật assessment sang 'failed' -> không được gợi ý
    await db
      .update(assessments)
      .set({ status: "failed" })
      .where(eq(assessments.id, assess.id));

    context = await getLearnerPracticeContext(learner1Id);
    expect(context.unrevisedSubmission?.id).not.toBe(sub1.id);

    // Cập nhật assessment sang 'feedback_ready' -> BẮT BUỘC ĐƯỢC GỢI Ý
    await db
      .update(assessments)
      .set({ status: "feedback_ready" })
      .where(eq(assessments.id, assess.id));

    context = await getLearnerPracticeContext(learner1Id);
    expect(context.unrevisedSubmission?.id).toBe(sub1.id);
  });

  it("chuỗi đầy đủ: submit với parentId hợp lệ tạo bản 2 revision=2 và parentId đúng", async () => {
    const session1 = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(session1.id);

    // Nộp bản 1
    const sub1Res = await createSubmissionAndAssess(
      session1.id,
      learner1Id,
      "Đây là bài viết bản 1 của tôi."
    );
    const sub1Id = sub1Res.submission.id;
    createdSubmissionIds.push(sub1Id);

    // Tạo session mới để làm bản 2 cho cùng bài W1
    const session2 = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(session2.id);

    // Nộp bản 2 kèm parentId
    const sub2Res = await createSubmissionAndAssess(
      session2.id,
      learner1Id,
      "Đây là bài viết bản 2 đã cải thiện theo nhận xét.",
      sub1Id
    );
    const sub2Id = sub2Res.submission.id;
    createdSubmissionIds.push(sub2Id);

    // Kiểm tra bản 2 trong DB
    const [sub2InDb] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, sub2Id));

    expect(sub2InDb).toBeDefined();
    expect(sub2InDb.revision).toBe(2);
    expect(sub2InDb.parentId).toBe(sub1Id);

    // Kiểm tra getSubmissionWithFeedback trả về đúng parentData
    const detail = await getSubmissionWithFeedback(sub2Id, learner1Id);
    expect(detail?.parent).toBeDefined();
    expect(detail?.parent?.submission.id).toBe(sub1Id);
  });

  it("từ chối submit nếu parentId không tồn tại (404)", async () => {
    const session = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(session.id);

    await expect(
      createSubmissionAndAssess(
        session.id,
        learner1Id,
        "Bài nộp với parent rác",
        "11111111-2222-3333-4444-555555555555"
      )
    ).rejects.toThrowError(ValidationError);
  });

  it("từ chối submit nếu parentId thuộc về learner khác (403)", async () => {
    // Tạo bản 1 của learner 2
    const sessionL2 = await createSession(learner2Id, "W1", 15);
    createdSessionIds.push(sessionL2.id);
    const subL2 = await createSubmissionAndAssess(
      sessionL2.id,
      learner2Id,
      "Bài viết của learner 2"
    );
    const subL2Id = subL2.submission.id;
    createdSubmissionIds.push(subL2Id);

    // Learner 1 cố nộp bài lấy parentId của Learner 2
    const sessionL1 = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(sessionL1.id);

    await expect(
      createSubmissionAndAssess(
        sessionL1.id,
        learner1Id,
        "Learner 1 cố gắng chiếm parent của learner 2",
        subL2Id
      )
    ).rejects.toThrowError("Không có quyền");
  });

  it("từ chối submit nếu parentId đã bị xóa mềm (422)", async () => {
    const session = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(session.id);

    const sub = await createSubmissionAndAssess(
      session.id,
      learner1Id,
      "Bản 1 sắp bị xóa"
    );
    const subId = sub.submission.id;
    createdSubmissionIds.push(subId);

    // Soft delete bản 1
    await db
      .update(submissions)
      .set({ deletedAt: new Date() })
      .where(eq(submissions.id, subId));

    // Cố tạo bản 2 từ bản 1 đã xóa
    const sessionRev = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(sessionRev.id);

    await expect(
      createSubmissionAndAssess(
        sessionRev.id,
        learner1Id,
        "Bản 2 từ parent đã xóa",
        subId
      )
    ).rejects.toThrowError("Bài viết gốc đã bị xóa");
  });

  it("từ chối submit nếu parentId thuộc activity khác (422)", async () => {
    // Tạo bản 1 cho bài W1
    const sessionW1 = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(sessionW1.id);
    const subW1 = await createSubmissionAndAssess(
      sessionW1.id,
      learner1Id,
      "Bản 1 cho bài W1"
    );
    const subW1Id = subW1.submission.id;
    createdSubmissionIds.push(subW1Id);

    // Tạo session cho bài R1 (hoặc bài khác W1)
    const [otherAct] = await db
      .select({ id: activities.id })
      .from(activities)
      .where(eq(activities.mode, "reading"))
      .limit(1);

    if (otherAct) {
      const sessionOther = await createSession(learner1Id, otherAct.id, 15);
      createdSessionIds.push(sessionOther.id);

      await expect(
        createSubmissionAndAssess(
          sessionOther.id,
          learner1Id,
          JSON.stringify({ mainIdea: "Test", translation: "Dịch", keyTerms: "Từ" }),
          subW1Id
        )
      ).rejects.toThrowError("không cùng bài học");
    }
  });

  it("getSubmissionWithFeedback: không trả parentData nếu parent đã bị xóa mềm", async () => {
    // Tạo bản 1 & bản 2
    const session = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(session.id);

    const sub1 = await createSubmissionAndAssess(
      session.id,
      learner1Id,
      "Bản 1"
    );
    const sub1Id = sub1.submission.id;
    createdSubmissionIds.push(sub1Id);

    const session2 = await createSession(learner1Id, "W1", 15);
    createdSessionIds.push(session2.id);

    const sub2 = await createSubmissionAndAssess(
      session2.id,
      learner1Id,
      "Bản 2",
      sub1Id
    );
    const sub2Id = sub2.submission.id;
    createdSubmissionIds.push(sub2Id);

    // Trước khi xóa: getSubmissionWithFeedback có parentData
    let detail = await getSubmissionWithFeedback(sub2Id, learner1Id);
    expect(detail?.parent).toBeDefined();

    // Xóa mềm Bản 1
    await db
      .update(submissions)
      .set({ deletedAt: new Date() })
      .where(eq(submissions.id, sub1Id));

    // Sau khi xóa: getSubmissionWithFeedback KHÔNG trả parentData
    detail = await getSubmissionWithFeedback(sub2Id, learner1Id);
    expect(detail?.parent).toBeNull();
  });
});
