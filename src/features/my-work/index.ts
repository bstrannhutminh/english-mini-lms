/**
 * features/my-work — vòng "Góp ý → Sửa lại" (kiến trúc §3.5).
 * Pages mỏng ở app/(main)/my-work chỉ auth → lấy dữ liệu → ghép 2 view này.
 */
export { WorkListView, type WorkListViewProps } from "./list/work-list-view";
export { SubmissionListSkeleton } from "./list/submission-list-skeleton";
export { FeedbackDetailView } from "./detail/feedback-detail-view";
export type {
  ActivityMeta,
  AssessmentInfo,
  MyWorkFeedback,
  ParentRevision,
  SubmissionDetail,
} from "./types";
