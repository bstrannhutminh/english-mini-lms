import { describe, expect, it } from "vitest";
import {
  adminActivityCreateSchema,
  adminActivityUpdateSchema,
  adminSegmentCreateSchema,
  adminSegmentUpdateSchema,
  adminSourceCreateSchema,
  adminSourceUpdateSchema,
} from "@/contracts/admin-content";

const question = {
  id: "q1",
  prompt: "What did the speaker say?",
  options: [
    { id: "A", text: "One" },
    { id: "B", text: "Two" },
  ],
  correct_option_id: "B",
};

describe("admin content request contracts — payload UI hiện tại vẫn hợp lệ", () => {
  it("activity create/update nhận enum + null để xoá field optional", () => {
    expect(
      adminActivityCreateSchema.safeParse({
        id: "L9",
        mode: "listening",
        title: "Bài nghe mới",
        durationMinutes: 30,
        difficulty: "beginner",
        purpose: "practice",
        output: "text",
        answerReveal: "after_submit",
        segmentIds: ["seg-video-moi"],
        questions: [question],
        topic: "luyen-nghe",
      }).success
    ).toBe(true);

    expect(
      adminActivityUpdateSchema.safeParse({
        title: "Đổi tiêu đề",
        objective: null,
        durationMinutes: null,
        purpose: null,
        output: "text",
        reviewState: "approved",
      }).success
    ).toBe(true);
  });

  it("source/segment nhận null và strict với field lạ hoặc immutable", () => {
    expect(
      adminSourceCreateSchema.safeParse({
        id: "src-video-moi",
        title: "Video mới",
        kind: "video",
        url: "https://youtu.be/abcdefghijk",
        permission: null,
        locatorType: "seconds",
      }).success
    ).toBe(true);
    expect(adminSourceUpdateSchema.safeParse({ url: null, reviewState: "retired" }).success).toBe(true);
    expect(adminSourceUpdateSchema.safeParse({ id: "src-khac" }).success).toBe(false);

    expect(
      adminSegmentCreateSchema.safeParse({
        id: "seg-video-moi",
        sourceId: "src-video-moi",
        startSeconds: 10,
        endSeconds: 70,
        transcriptContent: "10|70|Hello",
        language: null,
        checksum: null,
      }).success
    ).toBe(true);
    expect(adminSegmentUpdateSchema.safeParse({ transcriptContent: null }).success).toBe(true);
    expect(adminSegmentUpdateSchema.safeParse({ sourceId: "src-khac" }).success).toBe(false);
  });

  it("strict enum và strict object chặn payload sai/field không hỗ trợ", () => {
    expect(adminActivityCreateSchema.safeParse({ id: "L9", mode: "listening", title: "x", questionsFile: "texts/l1.yaml" }).success).toBe(false);
    expect(adminActivityUpdateSchema.safeParse({ output: "video" }).success).toBe(false);
    expect(adminSegmentCreateSchema.safeParse({ id: "seg-x", sourceId: "src-x", unknown: true }).success).toBe(false);
  });
});
