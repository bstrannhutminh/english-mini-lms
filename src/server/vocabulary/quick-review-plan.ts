/**
 * Tính toán thuần cho batch ôn nhanh flashcard (tách khỏi quick-review.ts
 * để unit test hermetic — không chạm DB).
 *
 * Khớp ngữ nghĩa vòng lặp tuần tự cũ: xử lý items THEO THỨ TỰ, nếu một từ
 * xuất hiện nhiều lần trong cùng batch thì lần sau tính SRS trên mastery
 * đã nhảy của lần trước (compounding) — trạng thái vault cuối cùng của một
 * từ chính là kết quả của item cuối cùng được áp dụng cho từ đó.
 */
import { nextReview } from "./schedule";

export interface QuickReviewPlanInput {
  vocab_id: string;
  result: "know" | "dont_know";
  clientReviewId?: string;
}

/** Tối thiểu cần từ bản ghi vault để tính SRS. */
export interface QuickReviewVocabState {
  id: string;
  phrase: string;
  masteryLevel: number;
}

export interface QuickReviewPlanItem {
  vocabId: string;
  phrase: string;
  result: "know" | "dont_know";
  clientReviewId?: string;
  nextMastery: number;
  nextDueAt: Date;
  intervalDays: number;
}

/**
 * Lập kế hoạch áp dụng batch theo thứ tự, bỏ qua item có vocab không tồn tại
 * (hoặc không thuộc learner — caller chỉ nạp vocab của learner đó).
 * `now` dùng chung cho cả batch: các item cùng mastery sẽ trùng dueAt,
 * nhờ đó tầng DB gom UPDATE theo mastery thay vì từng dòng một.
 */
export function planQuickReviewBatch(
  reviews: QuickReviewPlanInput[],
  vocabById: ReadonlyMap<string, QuickReviewVocabState>,
  now: Date
): QuickReviewPlanItem[] {
  // Mastery "đang tính" của từng từ trong batch — khởi đầu từ vault,
  // nhảy dần khi có nhiều item cùng một từ (compounding như vòng lặp cũ).
  const workingMastery = new Map<string, number>();
  const plans: QuickReviewPlanItem[] = [];

  for (const item of reviews) {
    const vocab = vocabById.get(item.vocab_id);
    if (!vocab) continue;

    const currentMastery = workingMastery.get(item.vocab_id) ?? vocab.masteryLevel;
    const { nextMastery, nextDueAt, intervalDays } = nextReview(
      currentMastery,
      item.result === "know" ? "correct" : "incorrect",
      now
    );
    workingMastery.set(item.vocab_id, nextMastery);

    plans.push({
      vocabId: vocab.id,
      phrase: vocab.phrase,
      result: item.result,
      clientReviewId: item.clientReviewId,
      nextMastery,
      nextDueAt,
      intervalDays,
    });
  }

  return plans;
}

/**
 * Trạng thái vault cuối cùng sau batch: với mỗi từ, item cuối cùng được áp
 * dụng (không phải duplicate idempotent) quyết định mastery/dueAt — vì mỗi
 * plan đã compounding sẵn trạng thái các item trước của cùng từ đó.
 * `duplicateFlags` song hành với `plans` (true = item trùng clientReviewId
 * đã ghi trước đó → bỏ qua, tuyệt đối không advance mastery lần nữa).
 * intervalDays đi kèm để tầng DB gom UPDATE theo (mastery, intervalDays) —
 * dueAt giống nhau trong cùng nhóm vì batch dùng chung một mốc now.
 */
export function finalVaultStates(
  plans: QuickReviewPlanItem[],
  duplicateFlags: boolean[]
): Map<string, { masteryLevel: number; dueAt: Date; intervalDays: number }> {
  const finalStates = new Map<
    string,
    { masteryLevel: number; dueAt: Date; intervalDays: number }
  >();
  plans.forEach((plan, index) => {
    if (duplicateFlags[index]) return;
    finalStates.set(plan.vocabId, {
      masteryLevel: plan.nextMastery,
      dueAt: plan.nextDueAt,
      intervalDays: plan.intervalDays,
    });
  });
  return finalStates;
}
