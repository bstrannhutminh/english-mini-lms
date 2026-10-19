/**
 * Wizard "Bài nghe YouTube" — validate từng bước (pure functions).
 * Khớp với luật duyệt server-side (checkApprovalReadiness cho bài nghe).
 */
import { describe, expect, it } from "vitest";
import {
  draftToQuestion,
  newQuestionDraft,
  suggestActivityId,
  suggestSegmentId,
  suggestSourceId,
  validateQuestionsStep,
  validateSourceStep,
  validateTranscriptStep,
  type WizardData,
} from "@/features/admin/wizard/wizard-types";

function baseData(): WizardData {
  return {
    mode: "listening",
    title: "Bài nghe mới",
    topic: "",
    durationMinutes: "10",
    youtubeUrl: "https://www.youtube.com/watch?v=abc12345678",
    startSeconds: "0",
    endSeconds: "60",
    sourceId: "src-yt-bai-nghe",
    segmentId: "seg-yt-bai-nghe",
    activityId: "L99",
    idsTouched: false,
    transcript: "0|5|Hello.\n5|10|World.",
    verifiedTranscript: false,
    questions: [newQuestionDraft(0)],
  };
}

describe("suggest ids", () => {
  it("slugify tiêu đề tiếng Việt cho source/segment id", () => {
    expect(suggestSourceId("Phỏng vấn Bác sĩ")).toBe("src-yt-phong-van-bac-si");
    expect(suggestSegmentId("src-yt-x")).toBe("seg-yt-x");
  });

  it("activity id theo mode: L* / IL* kế tiếp", () => {
    expect(suggestActivityId("listening", ["L1", "L7", "W3"])).toBe("L8");
    expect(suggestActivityId("ielts-listening", ["IL2", "L9"])).toBe("IL3");
    expect(suggestActivityId("listening", [])).toBe("L1");
  });
});

describe("validateSourceStep", () => {
  it("chấp nhận dữ liệu hợp lệ", () => {
    expect(validateSourceStep(baseData())).toEqual([]);
  });

  it("báo lỗi link YouTube sai + end <= start + id sai prefix", () => {
    const d = {
      ...baseData(),
      youtubeUrl: "https://vimeo.com/123",
      startSeconds: "50",
      endSeconds: "10",
      activityId: "W9",
    };
    const fields = validateSourceStep(d).map((e) => e.field);
    expect(fields).toContain("youtubeUrl");
    expect(fields).toContain("endSeconds");
    expect(fields).toContain("activityId"); // W9 không khớp mode listening (cần L)
  });

  it("ielts-listening cần id IL*", () => {
    const d = { ...baseData(), mode: "ielts-listening" as const, activityId: "IL4" };
    expect(validateSourceStep(d)).toEqual([]);
    expect(
      validateSourceStep({ ...d, activityId: "L4" }).some((e) => e.field === "activityId")
    ).toBe(true);
  });
});

describe("validateTranscriptStep", () => {
  it("trống → lỗi; đúng format → pass", () => {
    expect(validateTranscriptStep({ ...baseData(), transcript: "  " })).toHaveLength(1);
    expect(validateTranscriptStep(baseData())).toEqual([]);
  });

  it("báo lỗi kèm số dòng cho dòng sai", () => {
    const d = { ...baseData(), transcript: "0|5|Ok\nkhông có mốc giây\n6|9|Fine" };
    const errs = validateTranscriptStep(d);
    expect(errs.length).toBe(1);
    expect(errs[0].message).toContain("dòng 2");
  });
});

describe("validateQuestionsStep", () => {
  it("0 câu hỏi → lỗi bắt buộc", () => {
    expect(
      validateQuestionsStep({ ...baseData(), questions: [] })[0].message
    ).toContain("ít nhất 1 câu hỏi");
  });

  it("câu hỏi rỗng → lỗi prompt; hợp lệ → pass", () => {
    expect(validateQuestionsStep(baseData()).length).toBeGreaterThan(0);
    const q = newQuestionDraft(0);
    q.prompt = "What is the topic?";
    q.options = [
      { id: "A", text: "One" },
      { id: "B", text: "Two" },
    ];
    q.correctOptionId = "B";
    expect(validateQuestionsStep({ ...baseData(), questions: [q] })).toEqual([]);
  });

  it("timestamp không phải số → báo lỗi thay vì mất dữ liệu", () => {
    const q = newQuestionDraft(0);
    q.prompt = "Q?";
    q.options = [
      { id: "A", text: "x" },
      { id: "B", text: "y" },
    ];
    q.timestampRef = "abc";
    const errs = validateQuestionsStep({ ...baseData(), questions: [q] });
    expect(errs.some((e) => e.message.includes("timestamp_reference"))).toBe(true);
  });
});

describe("draftToQuestion", () => {
  it("convert đúng shape màn nghe đọc", () => {
    const q = newQuestionDraft(0);
    q.prompt = "  Pick one  ";
    q.options = [
      { id: "A", text: " a " },
      { id: "B", text: " b " },
    ];
    q.correctOptionId = "B";
    q.explanation = " vì đúng ";
    q.timestampRef = "42";
    expect(draftToQuestion(q)).toEqual({
      id: "q1",
      prompt: "Pick one",
      options: [
        { id: "A", text: "a" },
        { id: "B", text: "b" },
      ],
      correct_option_id: "B",
      explanation: "vì đúng",
      timestamp_reference: 42,
    });
  });
});
