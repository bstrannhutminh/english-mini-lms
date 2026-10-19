/**
 * INVARIANT — màn Nghe:
 *  1. Emit⇄parse một nguồn: observation do gradeListeningSubmission (server)
 *     phát phải đọc lại được bằng buildListeningReview (client) — đúng câu,
 *     đúng đáp án, đúng mốc giây.
 *  2. Transcript gate: canRevealTranscript false trước khi nộp/reveal.
 */
import { describe, expect, it } from "vitest";
import { gradeListeningSubmission } from "@/server/learning/assessment/listening-evaluator";
import {
  buildListeningReview,
  parseCorrectOptionFromIssue,
} from "@/lib/listening-answer-checking";
import { canRevealTranscript } from "@/server/learning/session/listening-session-data";

const QUESTIONS = [
  {
    id: "q1",
    prompt: "Bác sĩ khuyên gì?",
    options: [
      { id: "A", text: "Nghỉ ngơi" },
      { id: "B", text: "Siêu âm" },
    ],
    correct_option_id: "B",
    explanation: "Bác sĩ yêu cầu siêu âm.",
    timestamp_seconds: 110,
  },
  {
    id: "q2",
    prompt: "Bệnh nhân cảm thấy thế nào?",
    options: [
      { id: "A", text: "Đau" },
      { id: "B", text: "Ổn" },
    ],
    correct_option_id: "A",
    explanation: "Bệnh nhân kể đau nhẹ.",
    timestamp_seconds: 45,
  },
];

describe("gradeListeningSubmission → buildListeningReview (emit ⇄ parse)", () => {
  it("observation server phát đọc lại đúng đáp án + mốc giây phía client", () => {
    // Learner trả lời: q1 sai (chọn A, đúng là B), q2 đúng (A).
    const body = JSON.stringify({ answers: { q1: "A", q2: "A" } });
    const { feedback } = gradeListeningSubmission(QUESTIONS, body);

    // Chỉ câu SAI mới có observation.
    expect(feedback.observations).toHaveLength(1);
    expect(
      parseCorrectOptionFromIssue(feedback.observations[0].issue)
    ).toBe("B");

    const review = buildListeningReview(
      QUESTIONS.map((q) => ({ id: q.id, prompt: q.prompt })),
      { q1: "A", q2: "A" },
      feedback.observations
    );

    const q1 = review.find((r) => r.id === "q1")!;
    expect(q1.isCorrect).toBe(false);
    expect(q1.correctOption).toBe("B"); // parse lại từ issue string
    expect(q1.timestamp).toBe(110); // parse lại từ location "Mốc 110s …"

    const q2 = review.find((r) => r.id === "q2")!;
    expect(q2.isCorrect).toBe(true);
    expect(q2.correctOption).toBeNull();
  });

  it("không trả lời câu nào → mọi câu sai, đáp án vẫn parse được", () => {
    const { feedback } = gradeListeningSubmission(QUESTIONS, null);
    const review = buildListeningReview(
      QUESTIONS.map((q) => ({ id: q.id, prompt: q.prompt })),
      {},
      feedback.observations
    );
    expect(review.every((r) => !r.isCorrect)).toBe(true);
    expect(review.map((r) => r.correctOption)).toEqual(["B", "A"]);
  });

  it("score luôn kind=practice_estimate (không band IELTS)", () => {
    const { feedback } = gradeListeningSubmission(QUESTIONS, "{}");
    expect(feedback.scores[0].kind).toBe("practice_estimate");
  });
});

describe("canRevealTranscript — cổng lộ transcript", () => {
  it("false trước khi nộp và trước khi bấm reveal", () => {
    expect(
      canRevealTranscript({ hasRevealEvent: false, hasSubmission: false })
    ).toBe(false);
  });

  it("true sau khi nộp HOẶC sau reveal event", () => {
    expect(
      canRevealTranscript({ hasRevealEvent: false, hasSubmission: true })
    ).toBe(true);
    expect(
      canRevealTranscript({ hasRevealEvent: true, hasSubmission: false })
    ).toBe(true);
    expect(
      canRevealTranscript({ hasRevealEvent: true, hasSubmission: true })
    ).toBe(true);
  });
});
