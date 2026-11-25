/**
 * Nộp bài ôn từ viết (micro-challenge): gọi Gemini đánh giá rồi cập nhật SRS.
 * - "partial" = chưa đạt → giữ mastery, hẹn ôn sớm (schedule.nextReview).
 * - KHÔNG ghi vào my_attempt: câu trả lời đã nằm trong vocabulary_reviews.
 *   my_attempt chỉ do người học tự sửa qua PATCH (tuple trường 5).
 *
 * Atomicity + idempotency (theo pattern flashcard quick-review.ts):
 * - Gemini là network → NGOÀI transaction. Phần ghi DB (review insert +
 *   vault update + usage_event) gom trong 1 transaction: crash giữa chừng
 *   không còn để lại review đã ghi mà SRS chưa nhảy (hoặc ngược lại).
 * - clientReviewId (unique trên vocabulary_reviews): retry/double-click cùng
 *   một lần trả lời không advance mastery hai lần — trả kết quả idempotent.
 * - Vault khoá FOR UPDATE trong transaction trước khi tính SRS nên 2 request
 *   đồng thời cho cùng một từ không lost-update mastery.
 */
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault, vocabularyReviews, usageEvents } from "@/db/schema";
import { evaluateVocabUsage, VocabUsageEvaluation } from "@/server/providers/gemini";
import { ValidationError } from "./errors";
import { nextReview } from "./schedule";
import { toVocabularyItem, toVocabularyReview } from "./serialize";

export interface SubmitVocabularyReviewOptions {
  /** UUID client sinh ra cho 1 lần trả lời — retry cùng id thì idempotent. */
  clientReviewId?: string;
  /** Kết quả chấm sẵn (test/tái dùng) — bỏ qua gọi Gemini. */
  preEvaluated?: VocabUsageEvaluation;
}

export async function submitVocabularyReview(
  learnerId: string,
  vocabId: string,
  scenario: string,
  userResponse: string,
  modality: "text" | "audio" = "text",
  options?: SubmitVocabularyReviewOptions
) {
  if (!userResponse || !userResponse.trim()) {
    throw new ValidationError("Câu trả lời không được để trống", 400);
  }

  const { clientReviewId, preEvaluated } = options ?? {};

  // 1. Lấy thông tin từ vựng (bản đọc cho đánh giá — SRS tính trên bản
  // khoá FOR UPDATE bên trong transaction).
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

  // 2. Đánh giá câu trả lời qua Gemini nếu chưa có — NETWORK, tuyệt đối
  // không đưa vào transaction (giữ connection/khoá trong lúc chờ network).
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

  // 3. Transaction atomic cho toàn bộ ghi DB.
  return db.transaction(async (tx) => {
    // Khoá vault FOR UPDATE rồi mới tính SRS — chống lost-update khi 2 request
    // cùng một từ chạy song song.
    const [lockedVocab] = await tx
      .select()
      .from(vocabularyVault)
      .where(eq(vocabularyVault.id, vocab.id))
      .limit(1)
      .for("update");

    if (!lockedVocab) {
      throw new ValidationError("Từ vựng không tồn tại", 404);
    }

    // Tính lịch ôn kế tiếp trên bản khoá (1-3-7-14-30).
    const { nextMastery, nextDueAt, intervalDays } = nextReview(
      lockedVocab.masteryLevel,
      evalResult.resultStatus
    );

    // Insert review kèm idempotency theo client_review_id khi client gửi lên.
    const reviewValues = {
      vocabularyId: vocab.id,
      learnerId,
      reviewChannel: "web",
      promptScenario: scenario,
      userResponse: userResponse.trim(),
      responseModality: modality as "text" | "audio",
      aiAssessment: evalResult.aiAssessment,
      resultStatus: evalResult.resultStatus,
      nextDueAt,
    };

    const [insertedReview] = clientReviewId
      ? await tx
          .insert(vocabularyReviews)
          .values({ ...reviewValues, clientReviewId })
          .onConflictDoNothing({ target: vocabularyReviews.clientReviewId })
          .returning()
      : await tx.insert(vocabularyReviews).values(reviewValues).returning();

    // Retry trùng clientReviewId: review đã ghi trước đó — trả nguyên trạng
    // idempotent, KHÔNG advance mastery lần thứ hai. feedbackNotes/
    // exampleCorrection không persist trong DB nên bản replay chỉ khôi phục
    // được resultStatus + aiAssessment (đủ để UI hiển thị kết quả đúng).
    if (clientReviewId && !insertedReview) {
      const [existingReview] = await tx
        .select()
        .from(vocabularyReviews)
        .where(eq(vocabularyReviews.clientReviewId, clientReviewId))
        .limit(1);

      if (!existingReview) {
        // Không thể xảy ra (conflict nghĩa là row tồn tại) — phòng thủ.
        throw new ValidationError("Xung đột ghi nhận ôn tập, vui lòng thử lại.", 500);
      }

      return {
        review: toVocabularyReview(existingReview),
        vocabulary: toVocabularyItem(lockedVocab),
        evaluation: {
          resultStatus: (existingReview.resultStatus ??
            "incorrect") as VocabUsageEvaluation["resultStatus"],
          aiAssessment: existingReview.aiAssessment ?? "",
          feedbackNotes: "",
        },
        nextDueAt: lockedVocab.dueAt.toISOString(),
        intervalDays: 0,
        masteryLevel: lockedVocab.masteryLevel,
        idempotentDuplicate: true as const,
      };
    }

    // 4. Cập nhật vocabulary_vault — chỉ mastery + lịch ôn, tuyệt đối không
    // động vào my_attempt (bản cũ ghi đè câu tự đặt của học viên bằng câu trả lời).
    const [updatedVocab] = await tx
      .update(vocabularyVault)
      .set({
        masteryLevel: nextMastery,
        dueAt: nextDueAt,
        updatedAt: new Date(),
      })
      .where(eq(vocabularyVault.id, vocab.id))
      .returning();

    // 5. Ghi log usage_event trong cùng transaction: thà rollback sạch còn
    // hơn trạng thái nửa vời (review ghi mà SRS chưa nhảy).
    await tx.insert(usageEvents).values({
      learnerId,
      action: "review_vocab",
      entityType: "vocabulary",
      entityId: vocab.id,
      tokenInput: tokenIn,
      tokenOutput: tokenOut,
      modelName: modelUsed,
    });

    return {
      review: toVocabularyReview(insertedReview),
      vocabulary: toVocabularyItem(updatedVocab),
      evaluation: evalResult,
      nextDueAt: nextDueAt.toISOString(),
      intervalDays,
      masteryLevel: nextMastery,
    };
  });
}
