/**
 * Nhóm "capture": tra cứu nhanh qua Gemini + CRUD trên vocabulary_vault.
 * Lịch ôn (SRS) nằm ở review.ts; toan tính lịch thuần ở schedule.ts.
 */
import { eq, and, desc, lte, gte } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault, usageEvents } from "@/db/schema";
import { quickCaptureVocabulary, QuickCaptureResult } from "@/server/providers/gemini";
import { ValidationError } from "./errors";
import { clampMastery } from "./schedule";

export interface CreateVocabularyInput {
  phrase: string;
  ipa?: string;
  context_meaning?: string;
  original_sentence: string;
  source_ref?: string;
  source_type?: string;
  my_attempt?: string;
}

/**
 * Tra cứu nhanh từ vựng y khoa qua Gemini khi người dùng bôi đen văn bản.
 * Ghi usage_events nếu có learnerId (không chặn luồng khi ghi log lỗi).
 */
export async function quickCapture(
  selectedText: string,
  surroundingSentence: string,
  sourceRef?: string,
  learnerId?: string
): Promise<QuickCaptureResult> {
  if (!selectedText || !selectedText.trim()) {
    throw new ValidationError("selected_text is required", 400);
  }
  const effectiveSentence = surroundingSentence?.trim() || selectedText?.trim();
  if (!effectiveSentence) {
    throw new ValidationError("surrounding_sentence or selected_text is required", 400);
  }

  const { result, tokenInput, tokenOutput, modelName } = await quickCaptureVocabulary(
    selectedText.trim(),
    effectiveSentence,
    sourceRef
  );

  if (learnerId) {
    try {
      await db.insert(usageEvents).values({
        learnerId,
        action: "quick_capture_vocab",
        entityType: "vocabulary",
        tokenInput,
        tokenOutput,
        modelName,
      });
    } catch (e) {
      console.warn("Failed to log usage event for quick_capture:", e);
    }
  }

  return result;
}

/**
 * Lưu từ vựng vào Vocabulary Vault.
 * QUY TẮC BẮT BUỘC: Không được lưu nếu thiếu original_sentence.
 * Tuple 6 trường giữ nguyên: phrase, ipa+context_meaning, original_sentence,
 * source_ref(+source_type), my_attempt, lịch sử ôn (mastery 0, đến hạn +1 ngày).
 */
export async function createVocabulary(learnerId: string, input: CreateVocabularyInput) {
  if (!input.original_sentence || !input.original_sentence.trim()) {
    throw new ValidationError("original_sentence is required and cannot be empty", 422);
  }

  if (!input.phrase || !input.phrase.trim()) {
    throw new ValidationError("phrase is required and cannot be empty", 422);
  }

  const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // now + 1 day

  const [record] = await db
    .insert(vocabularyVault)
    .values({
      learnerId,
      phrase: input.phrase.trim(),
      ipa: input.ipa?.trim() || null,
      contextMeaning: input.context_meaning?.trim() || null,
      originalSentence: input.original_sentence.trim(),
      sourceRef: input.source_ref?.trim() || null,
      sourceType: input.source_type || "book",
      myAttempt: input.my_attempt?.trim() || "",
      masteryLevel: 0,
      dueAt,
    })
    .returning();

  return record;
}

/**
 * Lấy danh sách từ vựng của học viên với bộ lọc.
 * "due" = due_at <= now (mọi mastery — trùng định nghĩa badge trên layout).
 * "mastered" = mastery_level >= MASTERY_MAX (4).
 */
export async function getLearnerVocabulary(
  learnerId: string,
  filter?: "all" | "due" | "mastered"
) {
  const now = new Date();

  if (filter === "due") {
    return await db
      .select()
      .from(vocabularyVault)
      .where(
        and(
          eq(vocabularyVault.learnerId, learnerId),
          lte(vocabularyVault.dueAt, now)
        )
      )
      .orderBy(desc(vocabularyVault.createdAt));
  }

  if (filter === "mastered") {
    return await db
      .select()
      .from(vocabularyVault)
      .where(
        and(
          eq(vocabularyVault.learnerId, learnerId),
          gte(vocabularyVault.masteryLevel, 4)
        )
      )
      .orderBy(desc(vocabularyVault.createdAt));
  }

  return await db
    .select()
    .from(vocabularyVault)
    .where(eq(vocabularyVault.learnerId, learnerId))
    .orderBy(desc(vocabularyVault.createdAt));
}

/**
 * Cập nhật câu tự đặt (my_attempt), mức thành thạo hoặc nghĩa ngữ cảnh.
 * mastery_level do client gửi được kẹp về [0, MASTERY_MAX] ở đây luôn.
 */
export async function updateVocabulary(
  vocabId: string,
  learnerId: string,
  updates: {
    my_attempt?: string;
    mastery_level?: number;
    context_meaning?: string;
  }
) {
  const patchData: {
    myAttempt?: string;
    masteryLevel?: number;
    contextMeaning?: string;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (updates.my_attempt !== undefined) {
    patchData.myAttempt = updates.my_attempt.trim();
  }
  if (updates.mastery_level !== undefined) {
    // Kẹp vào thang 0–4 cho dù client gửi lớn hơn (an toàn dữ liệu cũ).
    patchData.masteryLevel = clampMastery(updates.mastery_level);
  }
  if (updates.context_meaning !== undefined) {
    patchData.contextMeaning = updates.context_meaning.trim();
  }

  const [updated] = await db
    .update(vocabularyVault)
    .set(patchData)
    .where(
      and(
        eq(vocabularyVault.id, vocabId),
        eq(vocabularyVault.learnerId, learnerId)
      )
    )
    .returning();

  if (!updated) {
    throw new ValidationError("Từ vựng không tồn tại hoặc không thuộc quyền sở hữu", 404);
  }

  return updated;
}

