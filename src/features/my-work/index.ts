/**
 * features/my-work — vòng "Góp ý → Sửa lại" (kiến trúc §3.5).
 * Pages mỏng ở app/(main)/my-work chỉ auth → lấy dữ liệu → ghép 2 view này.
 */
export { WorkListView } from "./list/work-list-view";
export { FeedbackDetailView } from "./detail/feedback-detail-view";
export type {
  ActivityMeta,
  AssessmentInfo,
  MyWorkFeedback,
  ParentRevision,
  SubmissionDetail,
} from "./types";
