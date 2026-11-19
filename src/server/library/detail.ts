import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { activities, sources, sourceSegments } from "@/db/schema";
import { modeSkill } from "@/lib/modes";
import { loadListeningQuestions } from "@/server/learning/listening-questions";
import type { ActivityDetail } from "./types";

/**
 * Lấy thông tin chi tiết một activity đã duyệt để hiển thị trên /library/[id].
 * Nếu không tồn tại hoặc chưa approved, trả về null.
 * An toàn: không chọn questions/rubric đưa ra ngoài — chỉ trả `questionCount`
 * (con số) cho bài nghe để UI hiển thị "N câu hỏi".
 */
export async function getActivityDetail(
  id: string
): Promise<ActivityDetail | null> {
  const [act] = await db
    .select({
      id: activities.id,
      slot: activities.slot,
      mode: activities.mode,
      title: activities.title,
      objective: activities.objective,
      durationMinutes: activities.durationMinutes,
      difficulty: activities.difficulty,
      purpose: activities.purpose,
      output: activities.output,
      topic: activities.topic,
      promptText: activities.promptText,
      feedbackGuide: activities.feedbackGuide,
      segmentIds: activities.segmentIds,
      questions: activities.questions,
      questionsFile: activities.questionsFile,
    })
    .from(activities)
    .where(
      and(
        eq(activities.id, id),
        eq(activities.reviewState, "approved")
      )
    )
    .limit(1);

  if (!act) {
    return null;
  }

  let sourceContext: ActivityDetail["sourceContext"] = null;

  // Nếu là bài reading và có segment_ids, nạp thông tin nguồn sách/trang
  if (act.mode === "reading" && act.segmentIds && act.segmentIds.length > 0) {
    const firstSegmentId = act.segmentIds[0];
    const segmentResult = await db
      .select({
        page: sourceSegments.page,
        sourceId: sourceSegments.sourceId,
        sourceTitle: sources.title,
      })
      .from(sourceSegments)
      .innerJoin(sources, eq(sourceSegments.sourceId, sources.id))
      .where(eq(sourceSegments.id, firstSegmentId))
      .limit(1);

    if (segmentResult.length > 0) {
      sourceContext = {
        sourceTitle: segmentResult[0].sourceTitle,
        page: segmentResult[0].page,
      };
    }
  }

  // Bài nghe: chỉ ĐẾM số câu hỏi (questions trong DB ưu tiên hơn file yaml).
  // Không bao giờ trả nội dung câu hỏi/đáp án ra trang chi tiết.
  const questionCount =
    modeSkill(act.mode) === "listening"
      ? loadListeningQuestions(act).length
      : 0;

  return {
    id: act.id,
    slot: act.slot,
    mode: act.mode,
    title: act.title,
    objective: act.objective,
    durationMinutes: act.durationMinutes,
    difficulty: act.difficulty,
    purpose: act.purpose,
    output: act.output,
    topic: act.topic,
    promptText: act.promptText,
    feedbackGuide: act.feedbackGuide,
    questionCount,
    sourceContext,
  };
}
