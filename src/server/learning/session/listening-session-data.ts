import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  sessionEvents,
  submissions,
  activities,
  sourceSegments,
  sources,
} from "@/db/schema";
import { loadListeningQuestions } from "../listening-questions";

export interface TranscriptSegment {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface ListeningSessionData {
  videoUrl: string | null;
  startSeconds: number;
  endSeconds: number;
  questions: Array<{
    id: string;
    prompt: string;
    options: Array<{ id: string; text: string }>;
  }>;
  transcriptSegments: TranscriptSegment[];
  isTranscriptRevealed: boolean;
}

type ListeningActivity = Pick<
  typeof activities.$inferSelect,
  "segmentIds" | "questionsFile" | "questions"
>;

/** Parse `transcript_content` dạng `start|end|text` từng dòng → segments. */
export function parseTranscriptLines(rawTranscript: string): TranscriptSegment[] {
  return rawTranscript
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      return {
        startSeconds: parseInt(parts[0], 10) || 0,
        endSeconds: parseInt(parts[1], 10) || 0,
        text: parts.slice(2).join("|").trim(),
      };
    });
}

/**
 * Bất biến transcript: chỉ trả cho client khi
 *   (a) learner đã chủ động bấm reveal (session_events.kind="reveal"), hoặc
 *   (b) session đã có ít nhất một submission (sau nộp mới được xem).
 * Không bao giờ trả transcript cùng đáp án trước khi nộp.
 */
export function canRevealTranscript(args: {
  hasRevealEvent: boolean;
  hasSubmission: boolean;
}): boolean {
  return args.hasRevealEvent || args.hasSubmission;
}

/**
 * Tải toàn bộ payload màn Nghe cho một activity skill=listening
 * (bao gồm ielts-listening — caller đã qua modeSkill()).
 * KHÔNG bao giờ trả đáp án ra client trước khi nộp.
 */
export async function loadListeningSessionData(
  activity: ListeningActivity,
  sessionId: string,
  learnerId: string
): Promise<ListeningSessionData> {
  const revealEvents = await db
    .select({ id: sessionEvents.id })
    .from(sessionEvents)
    .where(
      and(
        eq(sessionEvents.sessionId, sessionId),
        eq(sessionEvents.learnerId, learnerId),
        eq(sessionEvents.kind, "reveal")
      )
    );
  const hasRevealEvent = revealEvents.length > 0;

  let startSec = 95;
  let endSec = 155;
  let videoUrl = "https://www.youtube.com/watch?v=uVSiFJ85EtM";
  let rawTranscript = "";

  if (activity.segmentIds && activity.segmentIds.length > 0) {
    const [seg] = await db
      .select({
        startSeconds: sourceSegments.startSeconds,
        endSeconds: sourceSegments.endSeconds,
        transcriptContent: sourceSegments.transcriptContent,
        url: sources.url,
      })
      .from(sourceSegments)
      .leftJoin(sources, eq(sourceSegments.sourceId, sources.id))
      .where(eq(sourceSegments.id, activity.segmentIds[0]))
      .limit(1);

    if (seg) {
      if (seg.startSeconds !== null) startSec = seg.startSeconds;
      if (seg.endSeconds !== null) endSec = seg.endSeconds;
      if (seg.url) videoUrl = seg.url;
      if (seg.transcriptContent) rawTranscript = seg.transcriptContent;
    }
  }

  const transcriptSegments = parseTranscriptLines(rawTranscript);

  const questionsList = loadListeningQuestions(activity).map((q) => ({
    id: q.id as string,
    prompt: q.prompt as string,
    options: Array.isArray(q.options)
      ? (q.options as Array<{ id: string; text: string }>).map((opt) => ({
          id: opt.id,
          text: opt.text,
        }))
      : [],
  }));

  // Khoá transcript: chỉ trả khi đã reveal hoặc đã có submission cho session này
  const [existingSubmission] = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(
      and(
        eq(submissions.sessionId, sessionId),
        eq(submissions.learnerId, learnerId),
        isNull(submissions.deletedAt)
      )
    )
    .limit(1);

  const transcriptOpen = canRevealTranscript({
    hasRevealEvent,
    hasSubmission: !!existingSubmission,
  });

  return {
    videoUrl,
    startSeconds: startSec,
    endSeconds: endSec,
    questions: questionsList,
    transcriptSegments: transcriptOpen ? transcriptSegments : [],
    isTranscriptRevealed: transcriptOpen,
  };
}
