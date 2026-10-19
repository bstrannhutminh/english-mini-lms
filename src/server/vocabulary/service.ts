/**
 * Facade — giữ đường import `@/server/vocabulary/service` ổn định cho
 * route handler, layout (badge từ đến hạn), trang vocab và test tích hợp.
 *
 * Code mới có thể import trực tiếp module nhỏ:
 *  - ./schedule.ts : bộ lập lịch SRS thuần (1-3-7-14-30, mastery 0–4, partial = ôn sớm)
 *  - ./capture.ts  : quick-capture + CRUD vocabulary_vault
 *  - ./review.ts   : ôn micro-challenge AI + flashcard quẹt
 *  - ./errors.ts   : ValidationError (statusCode → mapServiceError)
 */
export { ValidationError } from "./errors";
export {
  SPACED_INTERVALS_DAYS,
  MASTERY_MAX,
  MASTERY_SCALE,
  clampMastery,
  isMastered,
  formatMastery,
  nextReview,
  calculateNextReview,
  type ReviewOutcome,
  type NextReview,
} from "./schedule";
export {
  quickCapture,
  createVocabulary,
  getLearnerVocabulary,
  updateVocabulary,
  type CreateVocabularyInput,
} from "./capture";
export {
  getDueVocabularyForReview,
  submitVocabularyReview,
  getVocabularyForFlashcards,
  submitQuickFlashcardReviews,
  type FlashcardItem,
  type QuickReviewSubmission,
} from "./review";
