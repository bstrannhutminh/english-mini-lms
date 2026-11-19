import type { LearningStatus } from "@/contracts/library";

/**
 * Suy ra trạng thái học của learner trên 1 bài (thẻ Thư viện):
 *  - có phiên active/paused → "in_progress" (ưu tiên cao nhất)
 *  - đã nộp ≥ 1 bài → "completed"
 *  - còn lại → "not_started"
 * Hàm thuần — tách ra để unit test hermetic không cần DB.
 */
export function deriveLearningStatus(
  hasInProgressSession: boolean,
  submissionCount: number
): LearningStatus {
  if (hasInProgressSession) return "in_progress";
  if (submissionCount > 0) return "completed";
  return "not_started";
}
