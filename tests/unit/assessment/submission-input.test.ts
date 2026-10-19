import { describe, it, expect } from "vitest";
import { parseReadingSubmissionBody } from "@/server/learning/assessment/evaluate-submission";
import {
  parseTranscriptLines,
  canRevealTranscript,
} from "@/server/learning/session/listening-session-data";
import { createSubmissionRequestSchema } from "@/contracts/submission";
import { modeSkill } from "@/lib/modes";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("modeSkill — nguồn duy nhất cho dispatch chấm + tải dữ liệu màn học", () => {
  it("ielts-* quy về đúng 4 skill", () => {
    expect(modeSkill("ielts-listening")).toBe("listening");
    expect(modeSkill("ielts-reading")).toBe("reading");
    expect(modeSkill("ielts-speaking")).toBe("speaking");
    expect(modeSkill("ielts-writing")).toBe("writing");
    expect(modeSkill("listening")).toBe("listening");
  });

  it("mode lạ → null (caller fallback writing)", () => {
    expect(modeSkill("karaoke")).toBeNull();
  });
});

describe("parseReadingSubmissionBody", () => {
  it("body JSON đủ 3 phần", () => {
    const body = JSON.stringify({ mainIdea: "Ý A", translation: "Bản dịch", keyTerms: "term" });
    expect(parseReadingSubmissionBody(body)).toEqual({
      mainIdea: "Ý A",
      translation: "Bản dịch",
      keyTerms: "term",
    });
  });

  it("body plain text → toàn bộ xem là translation", () => {
    expect(parseReadingSubmissionBody("đoạn dịch thường")).toEqual({
      mainIdea: "",
      translation: "đoạn dịch thường",
      keyTerms: "",
    });
  });

  it("body rỗng → translation rỗng", () => {
    expect(parseReadingSubmissionBody(null).translation).toBe("");
  });
});

describe("parseTranscriptLines — format start|end|text", () => {
  it("parse đúng, bỏ dòng trống, text có thể chứa |", () => {
    const raw = "10|15|Hello world\n\n20|25|a|b with pipe\n";
    expect(parseTranscriptLines(raw)).toEqual([
      { startSeconds: 10, endSeconds: 15, text: "Hello world" },
      // mọi phần sau 2 dấu | đầu đều là text (giữ nguyên ký tự | trong câu)
      { startSeconds: 20, endSeconds: 25, text: "a|b with pipe" },
    ]);
  });

  it("raw rỗng → []", () => {
    expect(parseTranscriptLines("")).toEqual([]);
  });
});

describe("canRevealTranscript — bất biến: không lộ transcript trước nộp", () => {
  it("chưa reveal + chưa nộp → khoá", () => {
    expect(canRevealTranscript({ hasRevealEvent: false, hasSubmission: false })).toBe(false);
  });
  it("đã reveal HOẶC đã nộp → mở", () => {
    expect(canRevealTranscript({ hasRevealEvent: true, hasSubmission: false })).toBe(true);
    expect(canRevealTranscript({ hasRevealEvent: false, hasSubmission: true })).toBe(true);
    expect(canRevealTranscript({ hasRevealEvent: true, hasSubmission: true })).toBe(true);
  });
});

describe("createSubmissionRequestSchema — bất biến assisted + giới hạn", () => {
  it("client gửi `assisted` bị strip — server luôn tự tính", () => {
    const parsed = createSubmissionRequestSchema.parse({
      body: "bài làm",
      assisted: true, // cố gửi — phải bị loại khỏi parsed output
    });
    expect("assisted" in parsed).toBe(false);
  });

  it("chấp nhận cả mediaId lẫn media_id legacy", () => {
    expect(createSubmissionRequestSchema.parse({ mediaId: UUID }).mediaId).toBe(UUID);
    expect(createSubmissionRequestSchema.parse({ media_id: UUID }).media_id).toBe(UUID);
  });

  it("body > 20.000 ký tự → reject", () => {
    expect(
      createSubmissionRequestSchema.safeParse({ body: "x".repeat(20_001) }).success
    ).toBe(false);
    expect(
      createSubmissionRequestSchema.safeParse({ body: "x".repeat(20_000) }).success
    ).toBe(true);
  });
});
