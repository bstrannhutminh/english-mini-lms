/**
 * INVARIANT — hợp đồng chấm bài:
 *  1. Speaking không có audio thật → pronunciation.status PHẢI chấp nhận
 *     "not_assessable" (không được bịa điểm phát âm).
 *  2. Điểm chỉ là "practice_estimate" — app KHÔNG BAO GIỜ phát band IELTS
 *     chính thức.
 */
import { describe, expect, it } from "vitest";
import {
  practiceScoreSchema,
  pronunciationResultSchema,
  speakingFeedbackSchema,
} from "@/contracts/submission";

describe("pronunciationResultSchema — not_assessable", () => {
  it("enum status bao gồm cả assessed lẫn not_assessable", () => {
    expect(
      pronunciationResultSchema.safeParse({ status: "assessed", notes: "ok" }).success
    ).toBe(true);
    expect(
      pronunciationResultSchema.safeParse({
        status: "not_assessable",
        notes: "Không có audio để chấm phát âm.",
      }).success
    ).toBe(true);
  });

  it("reject status lạ (ví dụ 'failed' / 'good')", () => {
    for (const status of ["failed", "good", "pending", ""]) {
      expect(
        pronunciationResultSchema.safeParse({ status, notes: "x" }).success
      ).toBe(false);
    }
  });

  it("speakingFeedbackSchema nhận pronunciation not_assessable trong payload đầy đủ", () => {
    const feedback = {
      observations: [],
      strengths: ["Nói đủ ý chính"],
      next_action: "Thu âm rõ hơn để được chấm phát âm.",
      limitations: "Không chấm được phát âm do thiếu audio.",
      scores: [
        { kind: "practice_estimate", dimension: "fluency", value: 6 },
      ],
      transcript: "hello",
      pronunciation: {
        status: "not_assessable",
        notes: "Audio quá ngắn để đánh giá.",
      },
      retry_prompt: "Nói lại câu mở đầu.",
    };
    expect(speakingFeedbackSchema.safeParse(feedback).success).toBe(true);
  });
});

describe("practiceScoreSchema — chỉ practice_estimate, không official band", () => {
  it("kind=practice_estimate hợp lệ", () => {
    expect(
      practiceScoreSchema.safeParse({
        kind: "practice_estimate",
        dimension: "grammar",
        value: 6.5,
      }).success
    ).toBe(true);
  });

  it("kind=official_ielts bị reject — không được phát band thật", () => {
    for (const kind of [
      "official_ielts",
      "ielts_band",
      "official",
      "predicted_band",
    ]) {
      expect(
        practiceScoreSchema.safeParse({ kind, dimension: "overall", value: 7.5 })
          .success
      ).toBe(false);
    }
  });
});
