import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  learningSessions,
  activities,
  sourceSegments,
  sources,
  drafts,
} from "@/db/schema";
import { modeSkill } from "@/lib/modes";
import {
  loadListeningSessionData,
  type ListeningSessionData,
} from "./listening-session-data";

export interface SessionDetailsResult {
  session: {
    id: string;
    activityId: string;
    targetMinutes: number;
    status: string;
    activeSeconds: number | null;
    createdAt: Date;
  };
  // activities.id là FK notNull từ session → luôn tồn tại trong thực tế;
  // giữ non-null như typing cũ (page vẫn kiểm `!data.activity` cho an toàn).
  activity: {
    id: string;
    slot: string | null;
    mode: string;
    title: string;
    objective: string | null;
    durationMinutes: number | null;
    promptText: string | null;
    feedbackGuide: string | null;
    output: string | null;
    segmentIds: string[] | null;
    questionsFile: string | null;
    questions: unknown;
  };
  segment: {
    id: string;
    page: number | null;
    textContent: string | null;
    sourceId: string;
    sourceTitle: string | null;
  } | null;
  listening: ListeningSessionData | null;
  draft: {
    content: string | null;
    version: number;
    updatedAt: Date;
  } | null;
}

/**
 * Lấy thông tin phiên học chi tiết cho trang /learn/[sessionId].
 * Trả về dữ liệu chuyên biệt theo SKILL (modeSkill), không theo mode thô —
 * bài ielts-reading nhận `segment`, bài ielts-listening nhận `listening`
 * giống bản thường (sửa lỗi: trước đây so `mode === "reading"` literal).
 */
export async function getSessionDetails(
  sessionId: string,
  learnerId: string
): Promise<SessionDetailsResult | null> {
  const [session] = await db
    .select({
      id: learningSessions.id,
      activityId: learningSessions.activityId,
      targetMinutes: learningSessions.targetMinutes,
      status: learningSessions.status,
      activeSeconds: learningSessions.activeSeconds,
      createdAt: learningSessions.createdAt,
    })
    .from(learningSessions)
    .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
    .limit(1);

  if (!session) {
    return null;
  }

  const [activity] = await db
    .select({
      id: activities.id,
      slot: activities.slot,
      mode: activities.mode,
      title: activities.title,
      objective: activities.objective,
      durationMinutes: activities.durationMinutes,
      promptText: activities.promptText,
      feedbackGuide: activities.feedbackGuide,
      output: activities.output,
      segmentIds: activities.segmentIds,
      questionsFile: activities.questionsFile,
      questions: activities.questions,
    })
    .from(activities)
    .where(eq(activities.id, session.activityId))
    .limit(1);

  // Kỹ năng gốc của mode — "ielts-*" quy về 4 skill chuẩn.
  const skill = activity ? modeSkill(activity.mode) : null;

  // 1. Dữ liệu Reading Mode (reading + ielts-reading)
  let segment: SessionDetailsResult["segment"] = null;

  if (activity && skill === "reading" && activity.segmentIds && activity.segmentIds.length > 0) {
    const [seg] = await db
      .select({
        id: sourceSegments.id,
        page: sourceSegments.page,
        textContent: sourceSegments.textContent,
        sourceId: sourceSegments.sourceId,
        sourceTitle: sources.title,
      })
      .from(sourceSegments)
      .leftJoin(sources, eq(sourceSegments.sourceId, sources.id))
      .where(eq(sourceSegments.id, activity.segmentIds[0]))
      .limit(1);

    if (seg) {
      segment = seg;
    }
  }

  // 2. Dữ liệu Listening Mode (listening + ielts-listening).
  //    Transcript chỉ mở sau nộp hoặc sau sự kiện reveal (xem
  //    listening-session-data.ts — bất biến "không lộ transcript trước nộp").
  let listening: ListeningSessionData | null = null;
  if (activity && skill === "listening") {
    listening = await loadListeningSessionData(activity, sessionId, learnerId);
  }

  // 3. Bản nháp gần nhất
  const [draft] = await db
    .select({
      content: drafts.content,
      version: drafts.version,
      updatedAt: drafts.updatedAt,
    })
    .from(drafts)
    .where(and(eq(drafts.sessionId, sessionId), eq(drafts.learnerId, learnerId)))
    .limit(1);

  return {
    session,
    activity,
    segment,
    listening,
    draft: draft || null,
  };
}
