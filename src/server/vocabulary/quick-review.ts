/**
 * Nhóm "ôn nhanh flashcard" (vuốt thẻ, 0 token AI): lấy bộ thẻ đến hạn /
 * ôn tự do và ghi hàng loạt kết quả quẹt. Dùng CHUNG bộ lập lịch thuần
 * ./schedule.ts với ôn viết (./review.ts) — know→correct, dont_know→incorrect.
 */
import { eq, and, lte, asc } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault, vocabularyReviews, usageEvents } from "@/db/schema";
import type { ReviewVocabItem } from "@/contracts/vocabulary";
import { nextReview } from "./schedule";
import { toReviewVocabItem } from "./serialize";

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

export interface QuickReviewSubmission {
  vocab_id: string;
  result: "know" | "dont_know";
  clientReviewId?: string;
}

/**
 * Ghi hàng loạt kết quả quẹt flashcard trong 1 transaction.
 * Idempotent theo client_review_id (unique): quẹt trùng → bỏ qua cập nhật.
 */
export async function submitQuickFlashcardReviews(
  learnerId: string,
  reviews: QuickReviewSubmission[]
) {
  if (!reviews || reviews.length === 0) {
    return { success: true, processedCount: 0, results: [] };
  }

  return await db.transaction(async (tx) => {
    const results = [];

    for (const item of reviews) {
      // 1. Tìm từ vựng
      const [vocab] = await tx
        .select()
        .from(vocabularyVault)
        .where(
          and(
            eq(vocabularyVault.id, item.vocab_id),
            eq(vocabularyVault.learnerId, learnerId)
          )
        )
        .limit(1);

      if (!vocab) continue;

      // 2. Tính SRS bằng scheduler dùng chung: know → correct, dont_know → incorrect
      const { nextMastery, nextDueAt, intervalDays } = nextReview(
        vocab.masteryLevel,
        item.result === "know" ? "correct" : "incorrect"
      );

      // 3. Ghi vocabulary_reviews với onConflictDoNothing trên client_review_id
      const reviewValues = {
        vocabularyId: vocab.id,
        learnerId,
        reviewChannel: "web-flashcard",
        promptScenario: "quick_flashcard",
        userResponse: item.result,
        responseModality: null,
        aiAssessment:
          item.result === "know"
            ? "Đã thuộc (Quick Flashcard)"
            : "Chưa thuộc (Quick Flashcard)",
        resultStatus: item.result === "know" ? "correct" : "incorrect",
        nextDueAt,
      };

      const [insertedReview] = item.clientReviewId
        ? await tx
            .insert(vocabularyReviews)
            .values({ ...reviewValues, clientReviewId: item.clientReviewId })
            .onConflictDoNothing({ target: vocabularyReviews.clientReviewId })
            .returning()
        : await tx.insert(vocabularyReviews).values(reviewValues).returning();

      // Nếu có clientReviewId và conflict (insertedReview rỗng) → review đã ghi trước đó.
      // Bỏ qua update mastery và usage_events, trả về thành công idempotent.
      if (item.clientReviewId && !insertedReview) {
        results.push({
          vocabId: vocab.id,
          phrase: vocab.phrase,
          result: item.result,
          nextMastery: vocab.masteryLevel,
          nextDueAt: vocab.dueAt.toISOString(),
          intervalDays: 0,
          idempotentDuplicate: true,
        });
        continue;
      }

      // 4. Cập nhật vocabulary_vault (chỉ khi insert mới thành công)
      await tx
        .update(vocabularyVault)
        .set({
          masteryLevel: nextMastery,
          dueAt: nextDueAt,
          updatedAt: new Date(),
        })
        .where(eq(vocabularyVault.id, vocab.id));

      // 5. Ghi usage_events với token = 0
      try {
        await tx.insert(usageEvents).values({
          learnerId,
          action: "flashcard_quick_review",
          entityType: "vocabulary",
          entityId: vocab.id,
          tokenInput: 0,
          tokenOutput: 0,
          modelName: "none",
        });
      } catch (e) {
        console.warn("Lỗi ghi log usage event flashcard:", e);
      }

      results.push({
        vocabId: vocab.id,
        phrase: vocab.phrase,
        result: item.result,
        nextMastery,
        nextDueAt: nextDueAt.toISOString(),
        intervalDays,
      });
    }

    return {
      success: true,
      processedCount: results.length,
      results,
    };
  });
}
