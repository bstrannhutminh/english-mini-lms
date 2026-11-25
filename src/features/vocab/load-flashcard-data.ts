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

/**
 * Chọn nguồn dữ liệu deck cho lượt tải: lượt mount đầu + chế độ "due" +
 * không snapshot resume → dùng luôn `initialDeck` server render sẵn (pattern
 * /today), khỏi fetch trùng một roundtrip. Còn lại → fetch client như cũ.
 * Hàm thuần theo tham số — quyết định không phụ thuộc window/sessionStorage.
 */
export function chooseDeckDataSource(
  reloadKey: number,
  mode: "due" | "all",
  initialDeck: import("./api").FlashcardDeckItem[] | null,
  pending: DeckSnapshot | null
) {
  const canUseServerDeck =
    reloadKey === 0 && mode === "due" && initialDeck !== null && !pending;
  return canUseServerDeck
    ? Promise.resolve({ items: initialDeck, snapshot: null })
    : loadFlashcardData(mode, pending);
}
