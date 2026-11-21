import { describe, expect, it } from "vitest";
import { parseDeckSnapshot, restoreDeckSnapshot } from "@/features/vocab/deck-review-storage";

const word = {
  id: "11111111-1111-4111-8111-111111111111",
  phrase: "follow-up", ipa: null, contextMeaning: "tái khám", originalSentence: "Arrange a follow-up.",
  sourceRef: "W1", myAttempt: null, imageUrl: null, masteryLevel: 1, dueAt: "2026-11-19T00:00:00.000Z",
};
const review = { vocab_id: word.id, result: "know", clientReviewId: "22222222-2222-4222-8222-222222222222" };
const snapshot = { mode: "due", items: [word], batch: [review] };

describe("pending flashcard review restoration", () => {
  it("keeps the original idempotency key when restoring an unsaved grade", () => {
    const parsed = parseDeckSnapshot(JSON.stringify(snapshot));
    expect(parsed?.batch[0].clientReviewId).toBe(review.clientReviewId);
  });
  it("restores grades saved before optional word images were available", () => {
    const legacy = { ...snapshot, items: [{ ...word, imageUrl: undefined }] };
    const parsed = parseDeckSnapshot(JSON.stringify(legacy));
    expect(parsed?.items[0].imageUrl).toBeNull();
    expect(parsed?.batch[0].clientReviewId).toBe(review.clientReviewId);
  });
  it("does not expose a stored word outside the authenticated learner's current list", () => {
    expect(restoreDeckSnapshot(parseDeckSnapshot(JSON.stringify(snapshot)), [])).toBeNull();
  });
  it("uses current source content instead of a stale stored phrase", () => {
    const current = { ...word, phrase: "follow-up visit" };
    expect(restoreDeckSnapshot(parseDeckSnapshot(JSON.stringify(snapshot)), [current])?.items[0].phrase).toBe(current.phrase);
  });
  it("restores a pending word outside the first two hundred words", () => {
    const unrelated = Array.from({ length: 200 }, (_, index) => ({ ...word, id: `other-${index}` }));
    expect(restoreDeckSnapshot(parseDeckSnapshot(JSON.stringify(snapshot)), [...unrelated, word])?.batch).toHaveLength(1);
  });
  it("rejects corrupted, duplicate or out-of-order grades", () => {
    expect(parseDeckSnapshot("invalid json")).toBeNull();
    expect(parseDeckSnapshot(JSON.stringify({ ...snapshot, batch: [review, review] }))).toBeNull();
    expect(parseDeckSnapshot(JSON.stringify({ ...snapshot, batch: [{ ...review, vocab_id: review.clientReviewId }] }))).toBeNull();
  });
});
