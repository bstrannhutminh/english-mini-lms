/**
 * Nhóm "review viết" (micro-challenge): ghi kết quả ôn vào vocabulary_reviews
 * và cập nhật vocabulary_vault theo bộ lập lịch DUY NHẤT ở ./schedule.ts
 * (1-3-7-14-30, mastery 0–4, partial = chưa đạt).
 * Ôn nhanh bằng flashcard quẹt (0 token AI) nằm ở ./quick-review.ts.
 */
import { eq, and, lte, asc } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault, vocabularyReviews, usageEvents } from "@/db/schema";
import { evaluateVocabUsage, VocabUsageEvaluation } from "@/server/providers/gemini";
import type { ReviewVocabItem } from "@/contracts/vocabulary";
import { ValidationError } from "./errors";
import { nextReview } from "./schedule";
import { toReviewVocabItem, toVocabularyItem, toVocabularyReview } from "./serialize";

/**
 * Lấy tối đa `limit` từ vựng đến hạn ôn (due_at <= now).
 * allowPracticeExtra=true → bổ sung từ chưa đến hạn (mastery ≤ 3) cho đủ bộ.
 */
export async function getDueVocabularyForReview(
  learnerId: string,
  limit = 5,
  allowPracticeExtra = false
): Promise<ReviewVocabItem[]> {
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

  // Tạo câu hỏi micro-challenge cho từng từ (serialize Date → ISO cho contract)
  return items.map((item) =>
    toReviewVocabItem({
      ...item,
      challengePrompt: `Dùng cụm từ "${item.phrase}" (${item.contextMeaning || "chuyên ngành y tế"}) trong một câu tiếng Anh trao đổi với bệnh nhân hoặc đồng nghiệp.`,
    })
  );
}

/**
 * Nộp bài ôn từ (text hoặc voice): gọi Gemini đánh giá rồi cập nhật lịch SRS.
 * - "partial" = chưa đạt → giữ mastery, hẹn ôn sớm (schedule.nextReview).
 * - KHÔNG ghi vào my_attempt: câu trả lời đã nằm trong vocabulary_reviews.
 *   my_attempt chỉ do người học tự sửa qua PATCH (tuple trường 5).
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

  // 5. Cập nhật vocabulary_vault — chỉ mastery + lịch ôn, tuyệt đối không
  // động vào my_attempt (bản cũ ghi đè câu tự đặt của học viên bằng câu trả lời).
  const [updatedVocab] = await db
    .update(vocabularyVault)
    .set({
      masteryLevel: nextMastery,
      dueAt: nextDueAt,
      updatedAt: new Date(),
    })
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
    review: toVocabularyReview(review),
    vocabulary: toVocabularyItem(updatedVocab),
    evaluation: evalResult,
    nextDueAt: nextDueAt.toISOString(),
    intervalDays,
    masteryLevel: nextMastery,
  };
}

// Ôn nhanh flashcard quẹt (getVocabularyForFlashcards /
// submitQuickFlashcardReviews) nằm ở ./quick-review.ts — cùng scheduler
// ./schedule.ts, chỉ khác kênh ghi (0 token AI).
