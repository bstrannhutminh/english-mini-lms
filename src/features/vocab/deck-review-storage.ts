import { z } from "zod";
import { reviewVocabItemSchema, quickReviewItemSchema } from "@/contracts/vocabulary";

const STORAGE_KEY = "english-lms:pending-flashcards";
const snapshotSchema = z.object({
  mode: z.enum(["due", "all"]),
  items: z.array(reviewVocabItemSchema).max(200),
  batch: z.array(quickReviewItemSchema.extend({ clientReviewId: z.string().uuid() })).max(200),
});
export type DeckSnapshot = z.infer<typeof snapshotSchema>;

export function parseDeckSnapshot(raw: string | null): DeckSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = snapshotSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.batch.length === 0) return null;
    const ids = parsed.data.items.map((item) => item.id);
    const reviews = parsed.data.batch.map((item) => item.vocab_id);
    if (new Set(ids).size !== ids.length || new Set(reviews).size !== reviews.length) return null;
    if (reviews.some((id, index) => id !== ids[index])) return null;
    if (new Set(parsed.data.batch.map((entry) => entry.clientReviewId)).size !== reviews.length) return null;
    return parsed.data;
  } catch { return null; }
}

/** Only restore words returned by the authenticated learner's current deck. */
export function restoreDeckSnapshot(snapshot: DeckSnapshot | null, currentItems: DeckSnapshot["items"]): DeckSnapshot | null {
  if (!snapshot) return null;
  const current = new Map(currentItems.map((item) => [item.id, item]));
  if (snapshot.items.some((item) => !current.has(item.id))) return null;
  return { ...snapshot, items: snapshot.items.map((item) => current.get(item.id)!) };
}

export function readDeckSnapshot(): DeckSnapshot | null {
  try { return typeof window === "undefined" ? null : parseDeckSnapshot(sessionStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

export function saveDeckSnapshot(snapshot: DeckSnapshot): void {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* In-memory review and navigation guard remain available. */ }
}

export function clearDeckSnapshot(): void {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
}
