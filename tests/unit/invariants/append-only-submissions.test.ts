/**
 * INVARIANT — submissions append-only, `assisted` không bao giờ do client set.
 *
 * Ranh giới enforce được hermetic: contract zod ở
 * src/contracts/submission.ts. Server route parse body qua schema này
 * trước khi chạm createSubmissionAndAssess (DB) — client gửi thừa
 * id/revision/assisted phải bị strip khỏi parsed output.
 */
import { describe, expect, it } from "vitest";
import {
  createSubmissionRequestSchema,
  updateSubmissionRequestSchema,
} from "@/contracts/submission";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("createSubmissionRequestSchema — append-only, không field server-owned", () => {
  it("strip assisted nếu client cố gửi (assisted chỉ do server tính từ session_events)", () => {
    const parsed = createSubmissionRequestSchema.parse({
      body: "bài làm",
      assisted: true,
    });
    expect("assisted" in parsed).toBe(false);
  });

  it("strip id + revision + parentId-giả-mạo field khác — client không chèn được khóa/revision", () => {
    const parsed = createSubmissionRequestSchema.parse({
      body: "bài làm",
      id: UUID,
      revision: 7,
      submittedAt: new Date().toISOString(),
      learnerId: UUID,
      sessionId: UUID,
      deletedAt: null,
    });
    // Chỉ còn đúng các field client được phép gửi.
    expect(parsed).toEqual({ body: "bài làm" });
  });

  it("keys được phép: body, parentId, mediaId, media_id — không gì khác", () => {
    const parsed = createSubmissionRequestSchema.parse({
      body: "x",
      parentId: UUID,
      mediaId: UUID,
      media_id: UUID,
      hacker: "field",
    });
    expect(Object.keys(parsed).sort()).toEqual(
      ["body", "mediaId", "media_id", "parentId"].sort()
    );
  });
});

describe("updateSubmissionRequestSchema — chỉ confirmed_transcript mutable", () => {
  it("chấp nhận confirmed_transcript hợp lệ", () => {
    const parsed = updateSubmissionRequestSchema.parse({
      confirmed_transcript: "transcript đã nghe lại",
    });
    expect(parsed.confirmed_transcript).toBe("transcript đã nghe lại");
  });

  it("patch body bị strip — bài đã nộp không bao giờ bị ghi đè nội dung", () => {
    const parsed = updateSubmissionRequestSchema.parse({
      confirmed_transcript: "ok",
      body: "CỐ GHI ĐÈ BÀI GỐC",
      assisted: true,
      deletedAt: null,
    });
    expect("body" in parsed).toBe(false);
    expect("assisted" in parsed).toBe(false);
    expect(Object.keys(parsed)).toEqual(["confirmed_transcript"]);
  });

  it("reject khi thiếu confirmed_transcript (patch body thuần không hợp lệ)", () => {
    expect(
      updateSubmissionRequestSchema.safeParse({ body: "ghi đè" }).success
    ).toBe(false);
  });

  it("reject confirmed_transcript rỗng", () => {
    expect(
      updateSubmissionRequestSchema.safeParse({ confirmed_transcript: "" }).success
    ).toBe(false);
  });
});
