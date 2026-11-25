/**
 * Nhóm "review viết" (micro-challenge): lấy bộ từ đến hạn ôn kèm challenge
 * prompt. Nộp bài ôn nằm ở ./submit-vocabulary-review.ts (tách riêng vì
 * transaction + idempotency phức tạp). Bộ lập lịch DUY NHẤT ở ./schedule.ts
 * (1-3-7-14-30, mastery 0–4, partial = chưa đạt).
 * Ôn nhanh bằng flashcard quẹt (0 token AI) nằm ở ./quick-review.ts.
 */
import { eq, and, lte, asc } from "drizzle-orm";
import { db } from "@/db";
import { vocabularyVault } from "@/db/schema";
import type { ReviewVocabItem } from "@/contracts/vocabulary";
import { toReviewVocabItem } from "./serialize";

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
      imageUrl: vocabularyVault.imageUrl,
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
        imageUrl: vocabularyVault.imageUrl,
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
