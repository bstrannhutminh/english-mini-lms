/**
 * CONTRACT ROUNDTRIP — bắt drift giữa server serializer và client contract.
 *
 * Mô phỏng đúng đường đi của dữ liệu production:
 *   dữ liệu server-side (drizzle row có Date object, field null)
 *   → serializer thật (toVocabularyItem...) hoặc wire shape type-locked
 *   → JSON.stringify/parse (chính là NextResponse.json → fetch)
 *   → parse qua zod contract schema mà client dùng (apiFetch).
 *
 * Nếu server đổi shape (đổi tên field, quên serialize Date, thêm enum mới)
 * mà quên cập nhật contract — hoặc ngược lại — test này đỏ.
 *
 * 2 lớp bảo vệ:
 *   - compile-time: fixture gán type server thật (import type) → server đổi
 *     type thì test không compile;
 *   - runtime: zod parse sau JSON roundtrip → bắt những gì type không thấy
 *     (int vs float, ISO format, literal union, default/optional).
 */
import { describe, expect, it } from "vitest";
import {
  todayRecommendationSchema,
} from "@/contracts/today";
import { progressSummarySchema } from "@/contracts/progress";
import {
  submissionListResponseSchema,
  createSubmissionResponseSchema,
  retryAssessmentResponseSchema,
} from "@/contracts/submission";
import {
  vocabularyItemSchema,
  vocabularyReviewSchema,
  reviewListResponseSchema,
  submitReviewResponseSchema,
} from "@/contracts/vocabulary";
import {
  toVocabularyItem,
  toVocabularyReview,
  toReviewVocabItem,
} from "@/server/vocabulary/serialize";
import type { TodayRecommendation } from "@/server/today/service";
import type { ProgressSummary } from "@/server/progress/service";
import type { SubmissionListItem } from "@/contracts/submission";
import type {
  vocabularyVault,
  vocabularyReviews,
  feedbackVersions,
} from "@/db/schema";

type VocabRow = typeof vocabularyVault.$inferSelect;
type ReviewRow = typeof vocabularyReviews.$inferSelect;
type FeedbackRow = typeof feedbackVersions.$inferSelect;

/** Đúng chuỗi NextResponse.json → res.json() của client. */
function wire<T>(data: T): unknown {
  return JSON.parse(JSON.stringify(data));
}

const LEARNER = "11111111-1111-4111-8111-111111111111";
const VOCAB = "22222222-2222-4222-8222-222222222222";
const SESSION = "33333333-3333-4333-8333-333333333333";
const SUBMISSION = "44444444-4444-4444-8444-444444444444";
const ASSESSMENT = "55555555-5555-4555-8555-555555555555";
const FEEDBACK = "66666666-6666-4666-8666-666666666666";

/* ── 1. GET /api/v1/today ──────────────────────────────────────────── */

describe("today roundtrip — TodayRecommendation server → todayRecommendationSchema", () => {
  it("payload đầy đủ (recommended + in-progress + weekActivity) parse qua contract", () => {
    const serverData: TodayRecommendation = {
      learnerName: "Bác sĩ Minh",
      baselineStatus: "completed",
      targetMinutes: 45,
      reason: "Kỹ năng speaking ít luyện nhất trong 14 ngày qua.",
      recommendedActivity: {
        id: "S1",
        slot: "S1",
        title: "Giới thiệu bản thân ở hội nghị",
        mode: "speaking",
        objective: "Nói trôi chảy 2 phút không ngập ngừng",
        durationMinutes: 15,
        reason: "Kỹ năng speaking đang cần bổ sung.",
        actionType: "new_session",
      },
      alternateActivities: [
        {
          id: "W1",
          slot: "W1",
          title: "Email xin nghỉ phép hội nghị",
          mode: "writing",
          objective: null,
          durationMinutes: 15,
          reason: "Bài luyện kỹ năng Viết phù hợp với quỹ thời gian 45 phút.",
        },
      ],
      dueVocabCount: 12,
      leastPracticedSkill: "Nói",
      streakDays: 4,
      inProgressSession: {
        sessionId: SESSION,
        activityId: "R1",
        targetMinutes: 45,
        status: "paused",
        title: "Đọc–dịch đoạn sách siêu âm",
        mode: "reading",
        slot: "R1",
      },
      dailyPlan: [
        {
          key: "warmup",
          title: "Ôn từ đến hạn",
          description: "12 từ đang đến hạn ôn.",
          estimatedMinutes: 5,
          href: "/vocab/flashcards",
          status: "current",
        },
        {
          key: "main",
          title: "Bài chính",
          description: "Làm bài speaking được đề xuất.",
          estimatedMinutes: 22,
          href: null,
          status: "upcoming",
        },
        {
          key: "revise",
          title: "Sửa bài",
          description: "Chưa có bài chờ sửa.",
          estimatedMinutes: 15,
          href: null,
          status: "upcoming",
        },
        {
          key: "wrapup",
          title: "Kết thúc",
          description: "Tổng kết phiên học.",
          estimatedMinutes: 3,
          href: null,
          status: "upcoming",
        },
      ],
      weekActivity: [
        { date: "2026-11-19", label: "T5", studied: true, isToday: false },
        { date: "2026-11-20", label: "T6", studied: false, isToday: false },
        { date: "2026-11-25", label: "T3", studied: true, isToday: true },
      ],
      weekMinutes: 95,
    };

    const parsed = todayRecommendationSchema.parse(wire(serverData));
    expect(parsed.targetMinutes).toBe(45);
    expect(parsed.inProgressSession?.status).toBe("paused");
    expect(parsed.dailyPlan).toHaveLength(4);
    expect(parsed.weekActivity).toHaveLength(3);
  });

  it("payload tối thiểu (không recommended, không in-progress) vẫn hợp lệ; weekActivity default []", () => {
    // Client/snapshot cũ có thể thiếu weekActivity + weekMinutes — contract
    // cho phép nhờ optional().default().
    const minimal = {
      learnerName: "Bác sĩ Minh",
      baselineStatus: "pending",
      targetMinutes: 30,
      reason: "Chưa có dữ liệu nền.",
      recommendedActivity: null,
      alternateActivities: [],
      dueVocabCount: 0,
      leastPracticedSkill: "Viết",
      streakDays: 0,
      inProgressSession: null,
      dailyPlan: [],
    };

    const parsed = todayRecommendationSchema.parse(wire(minimal));
    expect(parsed.recommendedActivity).toBeNull();
    expect(parsed.weekActivity).toEqual([]);
    expect(parsed.weekMinutes).toBe(0);
  });

  it("targetMinutes lạ (ví dụ 40) bị reject — chốt 30/45", () => {
    const bad = {
      learnerName: "x",
      baselineStatus: "pending",
      targetMinutes: 40,
      reason: "",
      recommendedActivity: null,
      alternateActivities: [],
      dueVocabCount: 0,
      leastPracticedSkill: "",
      streakDays: 0,
      inProgressSession: null,
      dailyPlan: [],
    };
    expect(todayRecommendationSchema.safeParse(wire(bad)).success).toBe(false);
  });
});

/* ── 2. GET /api/v1/progress ───────────────────────────────────────── */

describe("progress roundtrip — ProgressSummary server → progressSummarySchema", () => {
  it("payload đầy đủ với revisionComparisons parse qua contract", () => {
    const serverData: ProgressSummary = {
      sessionsThisWeek: 5,
      actualStudyMinutes: 142,
      totalSubmissions: 18,
      hasSufficientData: true,
      skillBreakdown: [
        { skill: "writing", total: 6, independent: 5, assisted: 1 },
        { skill: "reading", total: 4, independent: 4, assisted: 0 },
        { skill: "speaking", total: 5, independent: 3, assisted: 2 },
        { skill: "listening", total: 3, independent: 2, assisted: 1 },
      ],
      independentCount: 14,
      assistedCount: 4,
      recurringErrors: [
        {
          category: "grammar",
          count: 7,
          samples: ["he go → he goes", "thì hiện tại đơn"],
        },
      ],
      masteredVocabCount: 31,
      totalVocabCount: 142,
      revisionComparisons: [
        {
          activityId: "W1",
          activityTitle: "Email xin nghỉ phép hội nghị",
          mode: "writing",
          originalSubmissionId: SUBMISSION,
          revisedSubmissionId: "77777777-7777-4777-8777-777777777777",
          originalDate: "2026-11-20T02:00:00.000Z",
          revisedDate: "2026-11-21T02:30:00.000Z",
          originalAssisted: false,
          revisedAssisted: false,
          originalExcerpt: "Dear Sir, I want to ask...",
          revisedExcerpt: "Dear Dr. Han, I am writing to request...",
        },
      ],
    };

    const parsed = progressSummarySchema.parse(wire(serverData));
    expect(parsed.skillBreakdown).toHaveLength(4);
    expect(parsed.revisionComparisons[0].revisedDate).toBe(
      "2026-11-21T02:30:00.000Z"
    );
  });

  it("ít dữ liệu: insufficientDataMessage optional nhưng parse được khi có", () => {
    const sparse: ProgressSummary = {
      sessionsThisWeek: 1,
      actualStudyMinutes: 20,
      totalSubmissions: 2,
      hasSufficientData: false,
      insufficientDataMessage: "Cần ít nhất 3 bài nộp để phân tích xu hướng.",
      skillBreakdown: [],
      independentCount: 2,
      assistedCount: 0,
      recurringErrors: [],
      masteredVocabCount: 0,
      totalVocabCount: 10,
      revisionComparisons: [],
    };
    const parsed = progressSummarySchema.parse(wire(sparse));
    expect(parsed.hasSufficientData).toBe(false);
  });

  it("skill lạ trong skillBreakdown bị reject — enum 4 kỹ năng chốt", () => {
    const bad = {
      sessionsThisWeek: 0,
      actualStudyMinutes: 0,
      totalSubmissions: 0,
      hasSufficientData: false,
      skillBreakdown: [{ skill: "ielts", total: 1, independent: 1, assisted: 0 }],
      independentCount: 0,
      assistedCount: 0,
      recurringErrors: [],
      masteredVocabCount: 0,
      totalVocabCount: 0,
      revisionComparisons: [],
    };
    expect(progressSummarySchema.safeParse(wire(bad)).success).toBe(false);
  });
});

/* ── 3. GET /api/v1/submissions ────────────────────────────────────── */

describe("submissions roundtrip — list item → submissionListResponseSchema", () => {
  it("item đầy đủ trường null-able (parentId, activitySlot) parse qua contract", () => {
    // Shape khớp listLearnerSubmissions (server) — submittedAt đã toISOString.
    const items: SubmissionListItem[] = [
      {
        id: SUBMISSION,
        sessionId: SESSION,
        revision: 2,
        parentId: "88888888-8888-4888-8888-888888888888",
        modality: "text",
        assisted: false,
        submittedAt: new Date("2026-11-24T03:00:00Z").toISOString(),
        activityId: "W1",
        activityTitle: "Email xin nghỉ phép hội nghị",
        activityMode: "writing",
        activitySlot: null,
        assessmentStatus: "feedback_ready",
      },
      {
        id: "99999999-9999-4999-8999-999999999999",
        sessionId: SESSION,
        revision: 1,
        parentId: null,
        modality: "audio",
        assisted: true,
        submittedAt: new Date("2026-11-23T03:00:00Z").toISOString(),
        activityId: "S1",
        activityTitle: "Giới thiệu bản thân",
        activityMode: "speaking",
        activitySlot: "S1",
        // assessment missing → service fallback "not_assessed"
        assessmentStatus: "not_assessed",
      },
    ];

    const parsed = submissionListResponseSchema.parse(
      wire({ submissions: items })
    );
    expect(parsed.submissions).toHaveLength(2);
    expect(parsed.submissions[0].parentId).toBe(
      "88888888-8888-4888-8888-888888888888"
    );
    expect(parsed.submissions[1].parentId).toBeNull();
  });

  it("modality ngoài enum text/audio bị reject", () => {
    const bad = [
      {
        id: SUBMISSION,
        sessionId: SESSION,
        revision: 1,
        parentId: null,
        modality: "video",
        assisted: false,
        submittedAt: new Date().toISOString(),
        activityId: "W1",
        activityTitle: "t",
        activityMode: "writing",
        activitySlot: null,
        assessmentStatus: "queued",
      },
    ];
    expect(
      submissionListResponseSchema.safeParse(wire({ submissions: bad })).success
    ).toBe(false);
  });
});

/* ── 4. feedback_versions row → feedbackVersionSchema ──────────────── */

describe("feedbackVersion roundtrip — drizzle row (Date objects) qua JSON → contract", () => {
  function feedbackRow(): FeedbackRow {
    return {
      id: FEEDBACK,
      assessmentId: ASSESSMENT,
      learnerId: LEARNER,
      submissionId: SUBMISSION,
      runVersion: 2,
      rubricSnapshot: {
        pronunciation: { status: "not_assessable", notes: "Không có audio." },
        rubric: null,
        transcript: "ai transcript",
        transcript_confidence: 0.87,
      },
      modelRef: "gemini-2.5-flash",
      observations: [
        {
          category: "grammar",
          location: "Đoạn 1, câu 2",
          original: "he go",
          issue: "subject-verb agreement",
          suggestion: "he goes",
          example: "He goes to work.",
          retry_prompt: "Viết lại câu với thì hiện tại đơn.",
        },
      ],
      strengths: ["Cấu trúc email đúng chuẩn"],
      nextAction: "Viết lại đoạn mở.",
      limitations: "Điểm chỉ là ước tính luyện tập.",
      scores: [
        { kind: "practice_estimate", dimension: "grammar", value: 6.5, note: "Còn lỗi thì" },
      ],
      reviewState: "active",
      createdAt: new Date("2026-11-24T03:00:00Z"),
      updatedAt: new Date("2026-11-24T03:00:05Z"),
    } as FeedbackRow;
  }

  it("row đầy đủ → NextResponse.json → parse createSubmissionResponseSchema", () => {
    const apiPayload = {
      submissionId: SUBMISSION,
      assessmentId: ASSESSMENT,
      status: "feedback_ready",
      revision: 1,
      assisted: false,
      feedback: feedbackRow(),
    };

    const parsed = createSubmissionResponseSchema.parse(wire(apiPayload));
    // Date object đã thành ISO string sau JSON roundtrip và hợp lệ theo contract.
    expect(parsed.feedback?.createdAt).toBe("2026-11-24T03:00:00.000Z");
    expect(parsed.feedback?.runVersion).toBe(2);
    expect(parsed.feedback?.observations?.[0].retry_prompt).toContain("Viết lại");
  });

  it("feedback null (assessment failed) vẫn hợp lệ — submission luôn được giữ", () => {
    const apiPayload = {
      submissionId: SUBMISSION,
      assessmentId: ASSESSMENT,
      status: "failed",
      revision: 1,
      assisted: false,
      feedback: null,
    };
    const parsed = createSubmissionResponseSchema.parse(wire(apiPayload));
    expect(parsed.feedback).toBeNull();
    expect(parsed.status).toBe("failed");
  });

  it("retry response wrap cùng feedbackVersionSchema", () => {
    const parsed = retryAssessmentResponseSchema.parse(
      wire({ success: true, feedback: feedbackRow() })
    );
    expect(parsed.success).toBe(true);
    expect(parsed.feedback.modelRef).toBe("gemini-2.5-flash");
  });

  it("observations thiếu retry_prompt bị reject — invariant cấu trúc feedback", () => {
    const row = feedbackRow();
    (row.observations as unknown[])[0] = {
      location: "x",
      original: "y",
      issue: "z",
      suggestion: "s",
      example: "e",
      // thiếu retry_prompt
    };
    const parsed = retryAssessmentResponseSchema.safeParse(
      wire({ success: true, feedback: row })
    );
    expect(parsed.success).toBe(false);
  });
});

/* ── 5. Vocabulary — qua serializer THẬT ───────────────────────────── */

describe("vocabulary roundtrip — serializer thật (toVocabularyItem/toVocabularyReview) → contract", () => {
  function vocabRow(): VocabRow {
    return {
      id: VOCAB,
      learnerId: LEARNER,
      phrase: "suprascapular nerve block",
      ipa: "/ˌsuːprəˈskæpjʊlər/",
      contextMeaning: "phong bế thần kinh trên vai",
      originalSentence:
        "Ultrasound-guided suprascapular nerve block provides significant pain relief.",
      sourceType: "book",
      sourceRef: "Trang 42",
      myAttempt: null,
      imageUrl: null,
      masteryLevel: 2,
      dueAt: new Date("2026-11-26T00:00:00Z"),
      createdAt: new Date("2026-11-01T01:00:00Z"),
      updatedAt: new Date("2026-11-24T01:00:00Z"),
    } as VocabRow;
  }

  it("toVocabularyItem(row Date) → wire → vocabularyItemSchema", () => {
    const serialized = toVocabularyItem(vocabRow());
    const parsed = vocabularyItemSchema.parse(wire(serialized));
    expect(parsed.dueAt).toBe("2026-11-26T00:00:00.000Z");
    expect(parsed.createdAt).toBe("2026-11-01T01:00:00.000Z");
    expect(parsed.myAttempt).toBeNull();
    expect(parsed.imageUrl).toBeNull();
  });

  it("toReviewVocabItem + challengePrompt → wire → reviewListResponseSchema", () => {
    const dueRow = {
      ...vocabRow(),
      challengePrompt: "Đặt câu với cụm này trong buổi khám.",
    };
    const serialized = toReviewVocabItem(dueRow);
    const payload = { items: [serialized], count: 1 };

    const parsed = reviewListResponseSchema.parse(wire(payload));
    expect(parsed.count).toBe(1);
    expect(parsed.items[0].challengePrompt).toContain("Đặt câu");
    expect(parsed.items[0].dueAt).toBe("2026-11-26T00:00:00.000Z");
  });

  it("submitReviewResponse đầy đủ (micro-challenge) parse qua contract", () => {
    const reviewRow: ReviewRow = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      clientReviewId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      vocabularyId: VOCAB,
      learnerId: LEARNER,
      reviewChannel: "web",
      promptScenario: "Buổi khám vai",
      userResponse: "We perform a suprascapular nerve block.",
      responseModality: "text",
      aiAssessment: "Câu đúng ngữ pháp, thuật ngữ chuẩn.",
      resultStatus: "correct",
      nextDueAt: new Date("2026-12-03T00:00:00Z"),
      reviewedAt: new Date("2026-11-25T02:00:00Z"),
      createdAt: new Date("2026-11-25T02:00:00Z"),
      updatedAt: new Date("2026-11-25T02:00:00Z"),
    } as ReviewRow;

    // Lắp payload đúng cách service submitVocabularyReview trả về.
    const serviceResult = {
      review: toVocabularyReview(reviewRow),
      vocabulary: toVocabularyItem(vocabRow()),
      evaluation: {
        resultStatus: "correct" as const,
        aiAssessment: "Câu đúng ngữ pháp, thuật ngữ chuẩn.",
        feedbackNotes: "Phát âm cần nhấn âm 2.",
        exampleCorrection: "a suprascapular nerve block",
      },
      nextDueAt: new Date("2026-12-03T00:00:00Z").toISOString(),
      intervalDays: 7,
      masteryLevel: 3,
    };

    const parsed = submitReviewResponseSchema.parse(wire(serviceResult));
    expect(parsed.review.clientReviewId).toBe(
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    );
    expect(parsed.review.nextDueAt).toBe("2026-12-03T00:00:00.000Z");
    expect(parsed.evaluation.resultStatus).toBe("correct");
    expect(parsed.intervalDays).toBe(7);
  });

  it("nhánh idempotent duplicate (intervalDays=0, feedbackNotes rỗng) vẫn hợp contract", () => {
    const reviewRow = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      clientReviewId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      vocabularyId: VOCAB,
      learnerId: LEARNER,
      reviewChannel: "web",
      promptScenario: "Buổi khám vai",
      userResponse: "We perform a suprascapular nerve block.",
      responseModality: "text" as const,
      aiAssessment: "ok",
      resultStatus: "correct",
      nextDueAt: null, // row cũ chưa có
      reviewedAt: new Date("2026-11-25T02:00:00Z"),
      createdAt: new Date("2026-11-25T02:00:00Z"),
      updatedAt: new Date("2026-11-25T02:00:00Z"),
    } as ReviewRow;

    const serviceResult = {
      review: toVocabularyReview(reviewRow),
      vocabulary: toVocabularyItem(vocabRow()),
      evaluation: {
        resultStatus: "correct" as const,
        aiAssessment: "ok",
        feedbackNotes: "",
      },
      nextDueAt: vocabRow().dueAt.toISOString(),
      intervalDays: 0,
      masteryLevel: 2,
      idempotentDuplicate: true,
    };

    const parsed = submitReviewResponseSchema.parse(wire(serviceResult));
    expect(parsed.review.nextDueAt).toBeNull();
    expect(parsed.idempotentDuplicate).toBe(true);
  });

  it("serializer thật giữ nguyên field null — nextDueAt null không bị méo thành 'null' string", () => {
    const row = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      clientReviewId: null,
      vocabularyId: VOCAB,
      learnerId: LEARNER,
      reviewChannel: null,
      promptScenario: null,
      userResponse: null,
      responseModality: null,
      aiAssessment: null,
      resultStatus: null,
      nextDueAt: null,
      reviewedAt: new Date("2026-11-25T02:00:00Z"),
      createdAt: new Date("2026-11-25T02:00:00Z"),
      updatedAt: new Date("2026-11-25T02:00:00Z"),
    } as ReviewRow;

    const parsed = vocabularyReviewSchema.parse(wire(toVocabularyReview(row)));
    expect(parsed.nextDueAt).toBeNull();
    expect(parsed.clientReviewId).toBeNull();
  });
});
