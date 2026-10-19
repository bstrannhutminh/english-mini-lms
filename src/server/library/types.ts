/**
 * Kiểu dữ liệu trả về của server/library — mirror 1-1 với
 * src/contracts/library.ts (zod) để route ⇄ client dùng chung hình dạng.
 * Giữ file thuần (không logic) để dễ đối chiếu contract.
 */
import type { activities } from "@/db/schema";
import type { LearningStatus } from "@/contracts/library";

export interface ActivityListItem {
  id: string;
  slot: string | null;
  mode: (typeof activities.$inferSelect)["mode"];
  title: string;
  objective: string | null;
  durationMinutes: number | null;
  difficulty: (typeof activities.$inferSelect)["difficulty"];
  purpose: string | null;
  output: string | null;
  topic: string | null;
  /** Trạng thái học tập của learner với bài này */
  learningStatus?: LearningStatus;
  /** Số lần learner đã nộp bài (>= 1 submission chưa xoá) */
  submissionCount?: number;
}

export interface TopicSummary {
  /** null = nhóm "Chưa phân loại" */
  topic: string | null;
  activityCount: number;
  /** Số bài learner đã nộp ít nhất 1 lần (0 nếu không truyền learnerId) */
  learnedCount: number;
}

export interface ActivityDetail {
  id: string;
  slot: string | null;
  mode: (typeof activities.$inferSelect)["mode"];
  title: string;
  objective: string | null;
  durationMinutes: number | null;
  difficulty: (typeof activities.$inferSelect)["difficulty"];
  purpose: string | null;
  output: string | null;
  topic: string | null;
  promptText: string | null;
  feedbackGuide: string | null;
  /** Số câu hỏi nghe (chỉ đếm — tuyệt đối không trả nội dung/đáp án). */
  questionCount?: number;
  sourceContext?: {
    sourceTitle: string;
    page: number | null;
    excerpt?: string | null;
  } | null;
}
