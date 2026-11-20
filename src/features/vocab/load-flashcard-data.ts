import { fetchFlashcardDeck, fetchVocabularyList } from "./api";
import { restoreDeckSnapshot, type DeckSnapshot } from "./deck-review-storage";

/** Validate a resumed deck against the whole authenticated vault, not a page of due words. */
export async function loadFlashcardData(mode: "due" | "all", pending: DeckSnapshot | null) {
  const data = pending ? await fetchVocabularyList("all") : await fetchFlashcardDeck({ freePractice: mode === "all" });
  const snapshot = restoreDeckSnapshot(pending, data.items);
  if (pending && !snapshot) {
    throw new Error("Chưa khôi phục được đợt ôn trước. Nội dung tạm vẫn được giữ; thử tải lại hoặc chủ động bỏ phiên cũ.");
  }
  return { items: snapshot?.items ?? data.items, snapshot };
}
