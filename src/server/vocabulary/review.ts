/**
 * Nhóm "review": ghi kết quả ôn từ (micro-challenge AI + flashcard quẹt)
 * vào vocabulary_reviews, cập nhật vocabulary_vault theo bộ lập lịch
 * DUY NHẤT ở ./schedule.ts (1-3-7-14-30, mastery 0–4, partial = chưa đạt).
 */
import { eq, and, lte, asc } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault, vocabularyReviews, usageEvents } from "@/db/schema";
import { evaluateVocabUsage, VocabUsageEvaluation } from "@/server/providers/gemini";
import { ValidationError } from "./errors";
import { nextReview } from "./schedule";

/**
 * Lấy tối đa `limit` từ vựng đến hạn ôn (due_at <= now).
 * allowPracticeExtra=true → bổ sung từ chưa đến hạn (mastery ≤ 3) cho đủ bộ.
 */
export async function getDueVocabularyForReview(
  learnerId: string,
  limit = 5,
  allowPracticeExtra = false
) {
  const now = new Date();

  // Lấy các từ đến hạn ôn (due_at <= now)
  const dueItems = await db
    .select({
      id: vocabularyVault.id,
      phrase: vocabularyVault.phrase,
      ipa: vocabularyVault.ipa,
      contextMeaning: vocabularyVault.contextMeaning,
      originalSentence: vocabularyVault.originalSentence,
      sourceRef: vocabularyVault.sourceRef,
      myAttempt: vocabularyVault.myAttempt,
      masteryLevel: vocabularyVault.masteryLevel,
      dueAt: vocabularyVault.dueAt,
    })
    .from(vocabularyVault)
    .where(
      and(
        eq(vocabularyVault.learnerId, learnerId),
        lte(vocabularyVault.dueAt, now)
      )
    )
    .orderBy(asc(vocabularyVault.dueAt))
    .limit(limit);

  const items = [...dueItems];

  // Chỉ bổ sung thêm từ luyện tập nếu người dùng bật allowPracticeExtra
  if (allowPracticeExtra && items.length < limit) {
    const existingIds = new Set(items.map((i) => i.id));
    const extraItems = await db
      .select({
        id: vocabularyVault.id,
        phrase: vocabularyVault.phrase,
        ipa: vocabularyVault.ipa,
        contextMeaning: vocabularyVault.contextMeaning,
        originalSentence: vocabularyVault.originalSentence,
        sourceRef: vocabularyVault.sourceRef,
        myAttempt: vocabularyVault.myAttempt,
        masteryLevel: vocabularyVault.masteryLevel,
        dueAt: vocabularyVault.dueAt,
      })
      .from(vocabularyVault)
      .where(
        and(
          eq(vocabularyVault.learnerId, learnerId),
          lte(vocabularyVault.masteryLevel, 3)
        )
      )
      .orderBy(asc(vocabularyVault.masteryLevel), asc(vocabularyVault.dueAt))
      .limit(limit * 2);

    for (const extra of extraItems) {
      if (!existingIds.has(extra.id) && items.length < limit) {
        items.push(extra);
        existingIds.add(extra.id);
      }
    }
  }

  // Tạo câu hỏi micro-challenge cho từng từ
  return items.map((item) => ({
    ...item,
    challengePrompt: `Dùng cụm từ "${item.phrase}" (${item.contextMeaning || "chuyên ngành y tế"}) trong một câu tiếng Anh trao đổi với bệnh nhân hoặc đồng nghiệp.`,
  }));
}

/**
 * Nộp bài ôn từ (text hoặc voice): gọi Gemini đánh giá rồi cập nhật lịch SRS.
 * - "partial" = chưa đạt → giữ mastery, hẹn ôn sớm (schedule.nextReview).
 * - Chỉ ghi my_attempt khi cột đang rỗng — KHÔNG ghi đè câu học viên tự đặt.
 */
export async function submitVocabularyReview(
  learnerId: string,
  vocabId: string,
  scenario: string,
  userResponse: string,
  modality: "text" | "audio" = "text",
  preEvaluated?: VocabUsageEvaluation
) {
  if (!userResponse || !userResponse.trim()) {
    throw new ValidationError("Câu trả lời không được để trống", 400);
  }

  // 1. Lấy thông tin từ vựng
  const [vocab] = await db
    .select()
    .from(vocabularyVault)
    .where(
      and(
        eq(vocabularyVault.id, vocabId),
        eq(vocabularyVault.learnerId, learnerId)
      )
    )
    .limit(1);

  if (!vocab) {
    throw new ValidationError("Từ vựng không tồn tại", 404);
  }

  // 2. Đánh giá câu trả lời qua Gemini nếu chưa có kết quả đánh giá trước
  let evalResult: VocabUsageEvaluation;
  let tokenIn = 0;
  let tokenOut = 0;
  let modelUsed = "gemini-2.5-flash";

  if (preEvaluated) {
    evalResult = preEvaluated;
  } else {
    const aiRes = await evaluateVocabUsage(
      vocab.phrase,
      vocab.contextMeaning || "",
      scenario,
      userResponse.trim()
    );
    evalResult = aiRes.result;
    tokenIn = aiRes.tokenInput;
    tokenOut = aiRes.tokenOutput;
    modelUsed = aiRes.modelName;
  }

  // 3. Tính lịch ôn tập kế tiếp bằng scheduler dùng chung (1-3-7-14-30)
  const { nextMastery, nextDueAt, intervalDays } = nextReview(
    vocab.masteryLevel,
    evalResult.resultStatus
  );

  // 4. Ghi lịch sử vào vocabulary_reviews
  const [review] = await db
    .insert(vocabularyReviews)
    .values({
      vocabularyId: vocab.id,
      learnerId,
      reviewChannel: "web",
      promptScenario: scenario,
      userResponse: userResponse.trim(),
      responseModality: modality,
      aiAssessment: evalResult.aiAssessment,
      resultStatus: evalResult.resultStatus,
      nextDueAt,
    })
    .returning();

  // 5. Cập nhật vocabulary_vault
  const updateData: {
    masteryLevel: number;
    dueAt: Date;
    updatedAt: Date;
    myAttempt?: string;
  } = {
    masteryLevel: nextMastery,
    dueAt: nextDueAt,
    updatedAt: new Date(),
  };
  // Chỉ ghi my_attempt khi đang rỗng — không ghi đè câu học viên đã lưu
  if (!vocab.myAttempt || !vocab.myAttempt.trim()) {
    updateData.myAttempt = userResponse.trim();
  }

  const [updatedVocab] = await db
    .update(vocabularyVault)
    .set(updateData)
    .where(eq(vocabularyVault.id, vocab.id))
    .returning();

  // 6. Ghi log usage_event
  try {
    await db.insert(usageEvents).values({
      learnerId,
      action: "review_vocab",
      entityType: "vocabulary",
      entityId: vocab.id,
      tokenInput: tokenIn,
      tokenOutput: tokenOut,
      modelName: modelUsed,
    });
  } catch (e) {
    console.warn("Lỗi ghi log usage event ôn từ:", e);
  }

  return {
    review,
    vocabulary: updatedVocab,
    evaluation: evalResult,
    nextDueAt,
    intervalDays,
    masteryLevel: nextMastery,
  };
}

// ──────────────────────────────────────────────
// Quick Flashcard Review (Vuốt thẻ, 0 token AI)
// ──────────────────────────────────────────────

export interface FlashcardItem {
  id: string;
  phrase: string;
  ipa: string | null;
  contextMeaning: string | null;
  originalSentence: string | null;
  sourceRef: string | null;
  sourceType: string | null;
  myAttempt: string | null;
  masteryLevel: number;
  dueAt: Date;
}

export async function getVocabularyForFlashcards(
  learnerId: string,
  limit = 20,
  mode: "due" | "all" = "due"
): Promise<FlashcardItem[]> {
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
    return await db
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
  }

  // 2. Chế độ "ôn tự do": ưu tiên từ ít thuộc nhất (mastery thấp, đến hạn sớm)
  return await db
    .select(baseSelect)
    .from(vocabularyVault)
    .where(eq(vocabularyVault.learnerId, learnerId))
    .orderBy(asc(vocabularyVault.masteryLevel), asc(vocabularyVault.dueAt))
    .limit(limit);
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
          nextDueAt: vocab.dueAt,
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
        nextDueAt,
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
