/**
 * Dispatcher chấm bài — ĐIỂM DUY NHẤT quyết định evaluator theo
 * modeSkill(activity.mode). Được dùng chung bởi
 *   - createSubmissionAndAssess (nộp lần đầu)
 *   - retryAssessment (chấm lại — sửa lỗi bài nghe từng rơi vào writing)
 * so với code cũ không còn lặp 2 nhánh chấm khác nhau.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, sourceSegments, mediaObjects } from "@/db/schema";
import { modeSkill } from "@/lib/modes";
import {
  evaluateWriting,
  evaluateReading,
  evaluateSpeaking,
  type WritingFeedback,
  type SpeakingFeedback,
} from "@/server/providers/gemini";
import { downloadMediaBuffer } from "@/server/media/service";
import { loadListeningQuestions } from "../listening-questions";
import { gradeListeningSubmission } from "./listening-evaluator";

/**
 * Feedback trả về từ mọi evaluator (writing/reading/local + speaking).
 * SpeakingFeedback.scores[].note là optional còn WritingFeedback bắt buộc —
 * type này chọn rộng (note?) để nhận cả hai mà không cần `any`.
 */
export interface EvaluationFeedback {
  observations: WritingFeedback["observations"];
  strengths: string[];
  next_action: string;
  limitations: string;
  scores: Array<{
    kind: "practice_estimate";
    dimension: string;
    value: number;
    note?: string;
  }>;
  pronunciation?: SpeakingFeedback["pronunciation"];
  transcript?: string;
  transcript_confidence?: number;
  retry_prompt?: string;
}

export interface EvaluationOutcome {
  feedback: EvaluationFeedback;
  tokenInput: number;
  tokenOutput: number;
  modelName: string;
}

export type EvalActivity = Pick<
  typeof activities.$inferSelect,
  | "id"
  | "mode"
  | "promptText"
  | "rubricJson"
  | "segmentIds"
  | "questions"
  | "questionsFile"
>;

export interface EvalSubmission {
  body: string | null;
  mediaId: string | null;
  confirmedTranscript: string | null;
}

export interface ReadingSubmissionParts {
  mainIdea: string;
  translation: string;
  keyTerms: string;
}

/**
 * Parse body bài Đọc–dịch: client gửi JSON {mainIdea, translation, keyTerms};
 * body plain-text được xem là bản dịch trần. Hàm thuần — test được.
 */
export function parseReadingSubmissionBody(body: string | null): ReadingSubmissionParts {
  const fallback: ReadingSubmissionParts = {
    mainIdea: "",
    translation: body || "",
    keyTerms: "",
  };
  if (!body) return fallback;
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const record = parsed as Record<string, unknown>;
      return {
        mainIdea: typeof record.mainIdea === "string" ? record.mainIdea : "",
        translation:
          typeof record.translation === "string" && record.translation
            ? record.translation
            : body,
        keyTerms: typeof record.keyTerms === "string" ? record.keyTerms : "",
      };
    }
  } catch {
    // body là plain text
  }
  return fallback;
}

/** Đoạn văn bản gốc phục vụ chấm Reading (segment đầu tiên của activity). */
async function loadFirstSegmentText(activity: EvalActivity): Promise<string> {
  if (!activity.segmentIds || activity.segmentIds.length === 0) return "";
  const [seg] = await db
    .select({ textContent: sourceSegments.textContent })
    .from(sourceSegments)
    .where(eq(sourceSegments.id, activity.segmentIds[0]))
    .limit(1);
  return seg?.textContent || "";
}

/** Buffer + mimeType THẬT của media — không hardcode (iPhone gửi audio/mp4). */
async function loadSubmissionAudio(
  mediaId: string | null
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!mediaId) return null;
  const [media] = await db
    .select({ storageKey: mediaObjects.storageKey, mimeType: mediaObjects.mimeType })
    .from(mediaObjects)
    .where(eq(mediaObjects.id, mediaId))
    .limit(1);
  if (!media) return null;
  const buffer = await downloadMediaBuffer(media.storageKey);
  return { buffer, mimeType: media.mimeType };
}

/**
 * Chấm một submission theo kỹ năng của activity.
 * Mode lạ (modeSkill → null) giữ hành vi cũ: rơi về writing evaluator.
 */
export async function evaluateSubmission(
  activity: EvalActivity,
  submission: EvalSubmission
): Promise<EvaluationOutcome> {
  const skill = modeSkill(activity.mode);

  if (skill === "speaking") {
    const audio = await loadSubmissionAudio(submission.mediaId);
    return evaluateSpeaking(
      audio,
      activity.promptText || "",
      submission.confirmedTranscript || submission.body || undefined
    );
  }

  if (skill === "reading") {
    const segmentText = await loadFirstSegmentText(activity);
    const readingSubmission = parseReadingSubmissionBody(submission.body);
    return evaluateReading(segmentText, readingSubmission);
  }

  if (skill === "listening") {
    const questionsList = loadListeningQuestions(activity);
    return gradeListeningSubmission(questionsList, submission.body);
  }

  // writing (mặc định — gồm cả mode lạ như hành vi cũ)
  return evaluateWriting(
    activity.promptText || "",
    activity.rubricJson,
    submission.body || ""
  );
}
