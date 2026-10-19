import { describe, expect, it } from "vitest";
import {
  apiErrorBodySchema,
  legacyErrorBodySchema,
  createSubmissionRequestSchema,
  practiceScoreSchema,
  feedbackObservationSchema,
  speakingFeedbackSchema,
  createSessionRequestSchema,
  uploadMediaResponseSchema,
  quickCaptureRequestSchema,
  todayRecommendationSchema,
} from "@/contracts";

describe("apiErrorBodySchema (unified error envelope)", () => {
  it("accepts { error: { code, message, fields } }", () => {
    const parsed = apiErrorBodySchema.parse({
      error: {
        code: "validation_failed",
        message: "Dữ liệu không hợp lệ.",
        fields: { body: "Bắt buộc" },
      },
    });
    expect(parsed.error.code).toBe("validation_failed");
    expect(parsed.error.fields?.body).toBe("Bắt buộc");
  });

  it("rejects the legacy flat error shape", () => {
    expect(
      apiErrorBodySchema.safeParse({ error: "Chưa đăng nhập" }).success
    ).toBe(false);
  });

  it("legacy shape still parses via legacyErrorBodySchema (transition)", () => {
    const parsed = legacyErrorBodySchema.parse({
      error: "Đã có phiên đang mở",
      sessionId: "6b7c8d90-0000-4000-8000-000000000001",
    });
    expect(parsed.error).toBe("Đã có phiên đang mở");
  });
});

describe("createSubmissionRequestSchema", () => {
  const uuid = "6b7c8d90-0000-4000-8000-000000000001";

  it("accepts mediaId (camelCase)", () => {
    const parsed = createSubmissionRequestSchema.parse({
      body: "Hello",
      mediaId: uuid,
    });
    expect(parsed.mediaId).toBe(uuid);
  });

  it("accepts legacy media_id (snake_case)", () => {
    const parsed = createSubmissionRequestSchema.parse({
      body: "Hello",
      media_id: uuid,
    });
    expect(parsed.media_id).toBe(uuid);
  });

  it("rejects bodies over the 20k character limit", () => {
    const result = createSubmissionRequestSchema.safeParse({
      body: "x".repeat(20001),
    });
    expect(result.success).toBe(false);
  });
});

describe("feedback invariant shapes", () => {
  it("feedbackObservation requires the locked field set", () => {
    const parsed = feedbackObservationSchema.parse({
      location: "para 1",
      original: "he go",
      issue: "subject-verb agreement",
      suggestion: "he goes",
      example: "He goes to work.",
      retry_prompt: "Viết lại câu với thì hiện tại đơn đúng.",
    });
    expect(parsed.retry_prompt).toBeTruthy();
  });

  it("practiceScoreSchema only allows kind=practice_estimate (no IELTS band)", () => {
    expect(
      practiceScoreSchema.safeParse({
        kind: "practice_estimate",
        dimension: "grammar",
        value: 6.5,
      }).success
    ).toBe(true);
    expect(
      practiceScoreSchema.safeParse({
        kind: "ielts_band",
        dimension: "grammar",
        value: 7.0,
      }).success
    ).toBe(false);
  });

  it("speakingFeedback requires pronunciation status enum incl. not_assessable", () => {
    const parsed = speakingFeedbackSchema.parse({
      transcript: "hello",
      pronunciation: { status: "not_assessable", notes: "no audio" },
      retry_prompt: "Nói lại",
      observations: [],
      strengths: [],
      next_action: "practice",
      limitations: "text only",
      scores: [],
    });
    expect(parsed.pronunciation.status).toBe("not_assessable");
  });
});

describe("session + media + vocab contracts", () => {
  it("createSessionRequest defaults targetMinutes to 30", () => {
    const parsed = createSessionRequestSchema.parse({ activityId: "W1" });
    expect(parsed.targetMinutes).toBe(30);
  });

  it("createSessionRequest rejects non 30/45 minutes", () => {
    expect(
      createSessionRequestSchema.safeParse({
        activityId: "W1",
        targetMinutes: 20,
      }).success
    ).toBe(false);
  });

  it("uploadMediaResponse keeps snake_case keys", () => {
    const parsed = uploadMediaResponseSchema.parse({
      media_id: "6b7c8d90-0000-4000-8000-000000000001",
      status: "ready",
      storage_key: "learner_x/1.webm",
      size_bytes: 1234,
    });
    expect(parsed.media_id).toBeTruthy();
  });

  it("quickCaptureRequest keeps snake_case and defaults surrounding_sentence", () => {
    const parsed = quickCaptureRequestSchema.parse({
      selected_text: "mitigate",
    });
    expect(parsed.surrounding_sentence).toBe("");
  });
});

describe("todayRecommendationSchema", () => {
  it("accepts a full recommendation payload", () => {
    const parsed = todayRecommendationSchema.parse({
      learnerName: "Bác sĩ Minh",
      baselineStatus: "done",
      targetMinutes: 30,
      reason: "Ít luyện nhất",
      recommendedActivity: {
        id: "W1",
        slot: "W1",
        title: "Email",
        mode: "writing",
        objective: null,
        durationMinutes: 15,
        reason: "rule (c)",
        actionType: "new_session",
      },
      alternateActivities: [],
      dueVocabCount: 3,
      leastPracticedSkill: "Nói",
      streakDays: 4,
      inProgressSession: null,
      dailyPlan: [],
    });
    expect(parsed.recommendedActivity?.actionType).toBe("new_session");
  });
});
