/**
 * Chấm một lượt Shadowing (câu nhại giọng trong bài nghe).
 * Logic chuyển từ route vào service (route chỉ parse + gọi).
 *
 * Khác submission thường: không tạo submissions/assessments (lượt luyện
 * nhanh trong phiên listening), NHƯNG vẫn phải ghi usage_events giống các
 * lượt chấm khác — sửa lỗi P1: token chi cho shadowing trước đây bị mất.
 */
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { learningSessions, usageEvents } from "@/db/schema";
import { evaluateSpeaking } from "@/server/providers/gemini";
import { downloadMediaBuffer } from "@/server/media/service";
import { ValidationError } from "../errors";
import { loadReadyMedia } from "./submission-media";

export interface ShadowingAttemptInput {
  mediaId: string;
  sentence: string;
  startSeconds?: number;
  endSeconds?: number;
}

export async function evaluateShadowingAttempt(
  sessionId: string,
  learnerId: string,
  input: ShadowingAttemptInput
) {
  // Phiên học phải thuộc về learner
  const [session] = await db
    .select({ id: learningSessions.id })
    .from(learningSessions)
    .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
    .limit(1);

  if (!session) {
    throw new ValidationError("Phiên học không tồn tại", 404);
  }

  // Media phải ready + thuộc learner + ≤ 300s
  const media = await loadReadyMedia(input.mediaId, learnerId);

  // Tải audio buffer từ Supabase Storage — mimeType lấy từ bản ghi (mp4/webm…)
  const audioBuffer = await downloadMediaBuffer(media.storageKey);

  // Chấm speaking cho câu shadowing bám theo verified_transcript của chính câu đó
  const prompt = `Đây là bài luyện Shadowing câu tiếng Anh: "${input.sentence}". Hãy so sánh phát âm và độ chính xác của người học so với câu mẫu này.`;
  const evalResult = await evaluateSpeaking(
    { buffer: audioBuffer, mimeType: media.mimeType },
    prompt,
    input.sentence
  );

  // usage_events — cùng chuẩn với các lượt chấm khác (invariant: token theo dõi được)
  await db.insert(usageEvents).values({
    learnerId,
    action: "evaluate_shadowing",
    entityType: "session",
    entityId: sessionId,
    tokenInput: evalResult.tokenInput,
    tokenOutput: evalResult.tokenOutput,
    modelName: evalResult.modelName,
  });

  return evalResult.feedback;
}
