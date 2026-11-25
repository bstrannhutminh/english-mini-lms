/**
 * Unit test hermetic cho reconcile review_state của seed:
 *  - Activity gỡ khỏi manifest → retired
 *  - Activity đổi khỏi approved trong manifest → theo trạng thái manifest
 *  - Approved trong manifest → reconcile không động vào (upsert chính lo)
 *  - Không action khi DB đã đúng trạng thái (idempotent — chạy lại không ghi)
 */
import { describe, it, expect } from "vitest";
import { computeSeedReviewStateReconcile } from "@/server/seed/reconcile";

describe("computeSeedReviewStateReconcile", () => {
  it("activity gỡ khỏi manifest → retired", () => {
    const actions = computeSeedReviewStateReconcile(
      [],
      [{ id: "W1", reviewState: "approved" }]
    );
    expect(actions).toEqual([
      { id: "W1", nextReviewState: "retired", reason: "missing_from_manifest" },
    ]);
  });

  it("activity đổi sang draft trong manifest → draft (kể cả DB đang approved)", () => {
    const actions = computeSeedReviewStateReconcile(
      [{ id: "W1", reviewState: "draft" }],
      [{ id: "W1", reviewState: "approved" }]
    );
    expect(actions).toEqual([
      { id: "W1", nextReviewState: "draft", reason: "manifest_not_approved" },
    ]);
  });

  it("activity approved trong manifest → reconcile bỏ qua (upsert chính xử lý)", () => {
    const actions = computeSeedReviewStateReconcile(
      [{ id: "W1", reviewState: "approved" }],
      [{ id: "W1", reviewState: "retired" }]
    );
    expect(actions).toEqual([]);
  });

  it("idempotent: DB đã đúng trạng thái → không action", () => {
    const actions = computeSeedReviewStateReconcile(
      [{ id: "W1", reviewState: "reviewing" }],
      [
        { id: "W1", reviewState: "reviewing" },
        { id: "W2", reviewState: "retired" }, // đã retired sẵn + không trong manifest
      ]
    );
    expect(actions).toEqual([]);
  });

  it("nhiều row hỗn hợp trong một lần chạy", () => {
    const actions = computeSeedReviewStateReconcile(
      [
        { id: "W1", reviewState: "approved" },
        { id: "W2", reviewState: "draft" },
        { id: "W3", reviewState: "rejected" },
      ],
      [
        { id: "W1", reviewState: "approved" }, // khớp — bỏ qua
        { id: "W2", reviewState: "approved" }, // hạ approved → draft
        { id: "W3", reviewState: "approved" }, // hạ approved → rejected
        { id: "W4", reviewState: "approved" }, // không còn trong manifest → retired
      ]
    );
    expect(actions).toEqual([
      { id: "W2", nextReviewState: "draft", reason: "manifest_not_approved" },
      { id: "W3", nextReviewState: "rejected", reason: "manifest_not_approved" },
      { id: "W4", nextReviewState: "retired", reason: "missing_from_manifest" },
    ]);
  });
});
