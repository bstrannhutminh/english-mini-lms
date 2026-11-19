/**
 * Serializers drizzle-row → contract shape: Date → ISO-8601 string.
 * Chỉ dùng ở ranh giới service → API route / client feature; phía trong
 * service vẫn làm việc với Date của drizzle.
 */
import type {
  VocabularyItem,
  VocabularyReview,
} from "@/contracts/vocabulary";
import type { vocabularyReviews, vocabularyVault } from "@/db/schema";

type VocabRow = typeof vocabularyVault.$inferSelect;
type ReviewRow = typeof vocabularyReviews.$inferSelect;

/** vocabulary_vault row → contract vocabularyItemSchema. */
export function toVocabularyItem(row: VocabRow): VocabularyItem {
  return {
    ...row,
    dueAt: row.dueAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Row subset (dueAt: Date, kèm challengePrompt tuỳ chọn) → reviewVocabItemSchema.
 * Giữ nguyên các field còn lại của row.
 */
export function toReviewVocabItem<T extends { dueAt: Date }>(
  row: T
): Omit<T, "dueAt"> & { dueAt: string } {
  return { ...row, dueAt: row.dueAt.toISOString() };
}

/** vocabulary_reviews row → contract vocabularyReviewSchema. */
export function toVocabularyReview(row: ReviewRow): VocabularyReview {
  return {
    ...row,
    nextDueAt: row.nextDueAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
