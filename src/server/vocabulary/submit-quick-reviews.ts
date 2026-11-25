/**
 * Ghi hàng loạt kết quả quẹt flashcard trong 1 transaction.
 * Idempotent theo client_review_id (unique): quẹt trùng → bỏ qua cập nhật.
 *
 * Đã batch-hoá (trước: 4 roundtrip DB NỐI TIẾP cho mỗi thẻ → deck 20–30 thẻ
 * tốn 80–120 roundtrip trong một transaction):
 *  1. Nạp toàn bộ vocab một lần bằng inArray.
 *  2. Tính SRS thuần trong bộ nhớ (quick-review-plan.ts, giữ compounding
 *     theo thứ tự như vòng lặp cũ) với một mốc `now` chung cho cả batch.
 *  3. Bulk insert vocabulary_reviews một lần — onConflictDoNothing +
 *     returning để phát hiện item trùng clientReviewId.
 *  4. Cập nhật vault gom theo (mastery, intervalDays): cùng nhóm thì dueAt
 *     trùng nhau (vì chung `now`) nên mỗi nhóm chỉ 1 UPDATE — tối đa vài
 *     câu thay vì mỗi thẻ một câu.
 *  5. Bulk insert usage_events một lần (guard mảng rỗng).
 */
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault, vocabularyReviews, usageEvents } from "@/db/schema";
import { planQuickReviewBatch, finalVaultStates } from "./quick-review-plan";

export interface QuickReviewSubmission {
  vocab_id: string;
  result: "know" | "dont_know";
  clientReviewId?: string;
}

export async function submitQuickFlashcardReviews(
  learnerId: string,
  reviews: QuickReviewSubmission[]
) {
  if (!reviews || reviews.length === 0) {
    return { success: true, processedCount: 0, results: [] };
  }

  return await db.transaction(async (tx) => {
    // 1. Nạp toàn bộ vocab của batch trong 1 truy vấn (chỉ vocab của learner).
    const vocabIds = [...new Set(reviews.map((item) => item.vocab_id))];
    const vocabRows = await tx
      .select()
      .from(vocabularyVault)
      .where(
        and(
          inArray(vocabularyVault.id, vocabIds),
          eq(vocabularyVault.learnerId, learnerId)
        )
      );
    const vocabById = new Map(vocabRows.map((row) => [row.id, row]));

    // 2. Tính SRS thuần theo thứ tự — item nào thiếu vocab bị loại khỏi plan
    //    (giống `continue` của vòng lặp cũ: không có entry trong results).
    const now = new Date();
    const plans = planQuickReviewBatch(reviews, vocabById, now);
    if (plans.length === 0) {
      return { success: true, processedCount: 0, results: [] };
    }

    // 3. Bulk insert reviews — một câu lệnh, conflict client_review_id thì bỏ qua.
    const insertedRows = await tx
      .insert(vocabularyReviews)
      .values(
        plans.map((plan) => ({
          vocabularyId: plan.vocabId,
          learnerId,
          clientReviewId: plan.clientReviewId ?? null,
          reviewChannel: "web-flashcard",
          promptScenario: "quick_flashcard",
          userResponse: plan.result,
          responseModality: null,
          aiAssessment:
            plan.result === "know"
              ? "Đã thuộc (Quick Flashcard)"
              : "Chưa thuộc (Quick Flashcard)",
          resultStatus: plan.result === "know" ? "correct" : "incorrect",
          nextDueAt: plan.nextDueAt,
        }))
      )
      .onConflictDoNothing({ target: vocabularyReviews.clientReviewId })
      .returning({ clientReviewId: vocabularyReviews.clientReviewId });

    // Phát hiện duplicate: có clientReviewId mà không nằm trong tập vừa insert
    // được. clientReviewId lặp ngay trong cùng batch thì chỉ lần đầu được tính.
    const insertedClientIds = new Set(
      insertedRows.map((row) => row.clientReviewId).filter(Boolean)
    );
    const seenInBatch = new Set<string>();
    const duplicateFlags = plans.map((plan) => {
      if (!plan.clientReviewId) return false;
      if (seenInBatch.has(plan.clientReviewId)) return true;
      seenInBatch.add(plan.clientReviewId);
      return !insertedClientIds.has(plan.clientReviewId);
    });

    // 4. Cập nhật vault — gom nhóm (mastery, intervalDays), mỗi nhóm 1 UPDATE.
    const finalStates = finalVaultStates(plans, duplicateFlags);
    const groups = new Map<string, { masteryLevel: number; dueAt: Date; ids: string[] }>();
    for (const [vocabId, state] of finalStates) {
      const key = `${state.masteryLevel}:${state.intervalDays}`;
      const group = groups.get(key) ?? {
        masteryLevel: state.masteryLevel,
        dueAt: state.dueAt,
        ids: [],
      };
      group.ids.push(vocabId);
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      await tx
        .update(vocabularyVault)
        .set({ masteryLevel: group.masteryLevel, dueAt: group.dueAt, updatedAt: now })
        .where(inArray(vocabularyVault.id, group.ids));
    }

    // 5. Bulk insert usage_events cho các item thật sự áp dụng (token = 0).
    const usageRows = plans
      .filter((_, index) => !duplicateFlags[index])
      .map((plan) => ({
        learnerId,
        action: "flashcard_quick_review",
        entityType: "vocabulary",
        entityId: plan.vocabId,
        tokenInput: 0,
        tokenOutput: 0,
        modelName: "none",
      }));
    if (usageRows.length > 0) {
      await tx.insert(usageEvents).values(usageRows);
    }

    // Kết quả theo đúng thứ tự input: duplicate trả nguyên trạng idempotent
    // (mastery/dueAt hiện tại của vault, intervalDays = 0) như vòng lặp cũ.
    const results = plans.map((plan, index) => {
      if (duplicateFlags[index]) {
        const vocab = vocabById.get(plan.vocabId)!;
        return {
          vocabId: plan.vocabId,
          phrase: plan.phrase,
          result: plan.result,
          nextMastery: vocab.masteryLevel,
          nextDueAt: vocab.dueAt.toISOString(),
          intervalDays: 0,
          idempotentDuplicate: true,
        };
      }
      return {
        vocabId: plan.vocabId,
        phrase: plan.phrase,
        result: plan.result,
        nextMastery: plan.nextMastery,
        nextDueAt: plan.nextDueAt.toISOString(),
        intervalDays: plan.intervalDays,
      };
    });

    return {
      success: true,
      processedCount: results.length,
      results,
    };
  });
}
