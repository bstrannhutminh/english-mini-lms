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
 *
 * Đã parallel-hoá (trước: chuỗi 5–6 roundtrip nối tiếp):
 *  - session + activity gom thành 1 LEFT JOIN (activityId là FK notNull),
 *    chạy song song với truy vấn draft (chỉ cần sessionId/learnerId);
 *  - segment (reading) và payload listening chỉ phụ thuộc activity nên
 *    cũng chạy song song nhau ở đợt hai (bên trong listening-session-data
 *    các truy vấn độc lập đã Promise.all sẵn).
 */
export async function getSessionDetails(
  sessionId: string,
  learnerId: string
): Promise<SessionDetailsResult | null> {
  // Đợt 1: session+activity (join) song song với draft.
  const [joinedRows, draftRows] = await Promise.all([
    db
      .select({
        // session
        sessionId: learningSessions.id,
        sessionActivityId: learningSessions.activityId,
        targetMinutes: learningSessions.targetMinutes,
        status: learningSessions.status,
        activeSeconds: learningSessions.activeSeconds,
        createdAt: learningSessions.createdAt,
        // activity (null khi join trượt — FK notNull nên thực tế luôn có)
        activityId: activities.id,
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
      // innerJoin: activityId là FK notNull — join trượt thì coi như không có
      // session (page 404), tương đương hành vi cũ trả activity rỗng → 404.
      .from(learningSessions)
      .innerJoin(activities, eq(learningSessions.activityId, activities.id))
      .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.learnerId, learnerId)))
      .limit(1),
    db
      .select({
        content: drafts.content,
        version: drafts.version,
        updatedAt: drafts.updatedAt,
      })
      .from(drafts)
      .where(and(eq(drafts.sessionId, sessionId), eq(drafts.learnerId, learnerId)))
      .limit(1),
  ]);

  const row = joinedRows[0];
  if (!row) {
    return null;
  }

  const session = {
    id: row.sessionId,
    activityId: row.sessionActivityId,
    targetMinutes: row.targetMinutes,
    status: row.status,
    activeSeconds: row.activeSeconds,
    createdAt: row.createdAt,
  };

  const activity: SessionDetailsResult["activity"] = {
    id: row.activityId,
    slot: row.slot,
    mode: row.mode,
    title: row.title,
    objective: row.objective,
    durationMinutes: row.durationMinutes,
    promptText: row.promptText,
    feedbackGuide: row.feedbackGuide,
    output: row.output,
    segmentIds: row.segmentIds,
    questionsFile: row.questionsFile,
    questions: row.questions,
  };

  // Kỹ năng gốc của mode — "ielts-*" quy về 4 skill chuẩn.
  const skill = activity ? modeSkill(activity.mode) : null;

  // Đợt 2: segment (reading) song song payload listening — độc lập nhau.
  const needSegment =
    activity && skill === "reading" && activity.segmentIds && activity.segmentIds.length > 0;

  const segmentPromise = needSegment
    ? db
        .select({
          id: sourceSegments.id,
          page: sourceSegments.page,
          textContent: sourceSegments.textContent,
          sourceId: sourceSegments.sourceId,
          sourceTitle: sources.title,
        })
        .from(sourceSegments)
        .leftJoin(sources, eq(sourceSegments.sourceId, sources.id))
        .where(eq(sourceSegments.id, activity.segmentIds![0]))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    : Promise.resolve(null);

  // Transcript chỉ mở sau nộp hoặc sau sự kiện reveal (xem
  // listening-session-data.ts — bất biến "không lộ transcript trước nộp").
  const listeningPromise =
    activity && skill === "listening"
      ? loadListeningSessionData(activity, sessionId, learnerId)
      : Promise.resolve(null);

  const [segment, listening] = await Promise.all([segmentPromise, listeningPromise]);

  return {
    session,
    activity,
    segment,
    listening,
    draft: draftRows[0] || null,
  };
}
