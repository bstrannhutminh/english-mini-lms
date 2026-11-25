/**
 * Nhóm "ôn nhanh flashcard" (vuốt thẻ, 0 token AI): lấy bộ thẻ đến hạn /
 * ôn tự do và ghi hàng loạt kết quả quẹt. Dùng CHUNG bộ lập lịch thuần
 * ./schedule.ts với ôn viết (./review.ts) — know→correct, dont_know→incorrect.
 * Toan tính batch thuần (compounding, trạng thái vault cuối) ở ./quick-review-plan.ts.
 */
import { eq, and, lte, asc } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault } from "@/db/schema";
import type { ReviewVocabItem } from "@/contracts/vocabulary";
import { toReviewVocabItem } from "./serialize";

// submitQuickFlashcardReviews tách sang ./submit-quick-reviews.ts (batch-hoá
// chống N+1) — re-export để đường import cũ không đổi.
export {
  submitQuickFlashcardReviews,
  type QuickReviewSubmission,
} from "./submit-quick-reviews";

/**
 * Bộ thẻ flashcard của learner. "due" = dueAt <= now; "all" = ôn tự do,
 * ưu tiên mastery thấp + đến hạn sớm. Trả về contract ReviewVocabItem
 * (dueAt serialize ISO string).
 */
export async function getVocabularyForFlashcards(
  learnerId: string,
  limit = 20,
  mode: "due" | "all" = "due"
): Promise<ReviewVocabItem[]> {
  const now = new Date();

  const baseSelect = {
    id: vocabularyVault.id,
    phrase: vocabularyVault.phrase,
    ipa: vocabularyVault.ipa,
    contextMeaning: vocabularyVault.contextMeaning,
    originalSentence: vocabularyVault.originalSentence,
    sourceRef: vocabularyVault.sourceRef,
    sourceType: vocabularyVault.sourceType,
    myAttempt: vocabularyVault.myAttempt,
    imageUrl: vocabularyVault.imageUrl,
    masteryLevel: vocabularyVault.masteryLevel,
    dueAt: vocabularyVault.dueAt,
  };

  if (mode === "due") {
    // 1. Lấy các từ đến hạn ôn (dueAt <= now)
    const rows = await db
      .select(baseSelect)
      .from(vocabularyVault)
      .where(
        and(
          eq(vocabularyVault.learnerId, learnerId),
          lte(vocabularyVault.dueAt, now)
        )
      )
      .orderBy(asc(vocabularyVault.dueAt))
      .limit(limit);
    return rows.map(toReviewVocabItem);
  }

  // 2. Chế độ "ôn tự do": ưu tiên từ ít thuộc nhất (mastery thấp, đến hạn sớm)
  const rows = await db
    .select(baseSelect)
    .from(vocabularyVault)
    .where(eq(vocabularyVault.learnerId, learnerId))
    .orderBy(asc(vocabularyVault.masteryLevel), asc(vocabularyVault.dueAt))
    .limit(limit);
  return rows.map(toReviewVocabItem);
}
