import { notFound, redirect } from "next/navigation";
import { getCurrentLearner } from "@/server/auth";
import {
  getSessionDetails,
  getSubmissionWithFeedback,
} from "@/server/learning/service";
import { modeSkill, isIeltsMode } from "@/lib/modes";
import { SessionRoot } from "@/features/session/shell/session-root";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ parentId?: string }>;
}

export default async function LearnSessionPage({ params, searchParams }: PageProps) {
  const learner = await getCurrentLearner();
  if (!learner) redirect("/login");

  const { sessionId } = await params;
  const { parentId } = await searchParams;

  // parentId biết ngay từ search params nên luồng revision chạy song song
  // với tải session thay vì chờ xong mới bắt đầu (trước: waterfall 2 tầng).
  const [data, parentRes] = await Promise.all([
    getSessionDetails(sessionId, learner.id),
    parentId ? getSubmissionWithFeedback(parentId, learner.id) : Promise.resolve(null),
  ]);
  if (!data || !data.activity) notFound();

  let parentData = null;
  if (parentRes) {
    parentData = {
      submission: {
        id: parentRes.submission.id,
        revision: parentRes.submission.revision,
        body: parentRes.submission.body,
        assisted: parentRes.submission.assisted,
        submittedAt: parentRes.submission.submittedAt,
        audioUrl: parentRes.submission.audioUrl,
      },
      feedback: parentRes.feedback,
    };
  }

  // Định tuyến theo SKILL (modeSkill): ielts-* → cùng plugin skill + badge
  // IELTS. Resolve nhẹ ở đây (không import plugin — session-root dynamic
  // import đúng chunk skill trong client); mode lạ → 404.
  const skill = modeSkill(data.activity.mode);
  if (!skill) notFound();

  return (
    <SessionRoot
      skill={skill}
      isIelts={isIeltsMode(data.activity.mode)}
      data={{
        sessionId,
        targetMinutes: data.session.targetMinutes,
        activity: {
          id: data.activity.id,
          slot: data.activity.slot,
          title: data.activity.title,
          mode: data.activity.mode,
          objective: data.activity.objective,
          promptText: data.activity.promptText,
          feedbackGuide: data.activity.feedbackGuide,
          durationMinutes: data.activity.durationMinutes,
        },
        initialDraft: data.draft?.content || "",
        segment: data.segment,
        listening: data.listening,
        parentId,
        parentData,
      }}
    />
  );
}
