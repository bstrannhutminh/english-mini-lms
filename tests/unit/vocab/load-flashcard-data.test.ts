import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFlashcardDeck, fetchVocabularyList } from "@/features/vocab/api";
import { loadFlashcardData } from "@/features/vocab/load-flashcard-data";
import type { DeckSnapshot } from "@/features/vocab/deck-review-storage";

vi.mock("@/features/vocab/api", () => ({ fetchFlashcardDeck: vi.fn(), fetchVocabularyList: vi.fn() }));
const word = {
  id: "11111111-1111-4111-8111-111111111111", phrase: "follow-up", ipa: null,
  contextMeaning: "tái khám", originalSentence: "Arrange a follow-up.", sourceRef: "W1", myAttempt: null,
  imageUrl: null, masteryLevel: 1, dueAt: "2026-11-19T00:00:00.000Z",
};
const pending: DeckSnapshot = { mode: "due", items: [word], batch: [{ vocab_id: word.id, result: "know", clientReviewId: "22222222-2222-4222-8222-222222222222" }] };

describe("loading a flashcard deck", () => {
  beforeEach(() => vi.resetAllMocks());
  it("uses the normal due deck when there is no unfinished review", async () => {
    vi.mocked(fetchFlashcardDeck).mockResolvedValue({ items: [word], count: 1 });
    await loadFlashcardData("due", null);
    expect(fetchFlashcardDeck).toHaveBeenCalledWith({ freePractice: false });
    expect(fetchVocabularyList).not.toHaveBeenCalled();
  });
  it("restores a pending word even when it is beyond the first two hundred vault entries", async () => {
    const others = Array.from({ length: 200 }, (_, index) => ({ ...word, id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}` }));
    const ownWords = [...others, word].map((item) => ({ ...item, learnerId: "33333333-3333-4333-8333-333333333333", sourceType: "text", createdAt: item.dueAt, updatedAt: item.dueAt }));
    vi.mocked(fetchVocabularyList).mockResolvedValue({ items: ownWords });
    const result = await loadFlashcardData("due", pending);
    expect(fetchVocabularyList).toHaveBeenCalledWith("all");
    expect(fetchFlashcardDeck).not.toHaveBeenCalled();
    expect(result.snapshot?.batch[0].clientReviewId).toBe(pending.batch[0].clientReviewId);
  });
  it("leaves the saved review untouched if its words cannot be verified", async () => {
    vi.mocked(fetchVocabularyList).mockResolvedValue({ items: [] });
    await expect(loadFlashcardData("due", pending)).rejects.toThrow("Chưa khôi phục được");
    expect(pending.batch).toHaveLength(1);
  });
});
