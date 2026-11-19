import { notFound, redirect } from "next/navigation";
import { getCurrentLearner } from "@/server/auth";
import {
  getSessionDetails,
  getSubmissionWithFeedback,
} from "@/server/learning/service";
import { resolvePlugin } from "@/features/session/modes/registry";
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

  const data = await getSessionDetails(sessionId, learner.id);
  if (!data || !data.activity) notFound();

  let parentData = null;
  if (parentId) {
    const res = await getSubmissionWithFeedback(parentId, learner.id);
    if (res) {
      parentData = {
        submission: {
          id: res.submission.id,
          revision: res.submission.revision,
          body: res.submission.body,
          assisted: res.submission.assisted,
          submittedAt: res.submission.submittedAt,
          audioUrl: res.submission.audioUrl,
        },
        feedback: res.feedback,
      };
    }
  }

  // Định tuyến theo SKILL (modeSkill): ielts-* → cùng plugin skill + badge
  // IELTS. Mọi skill đều có plugin; mode lạ → 404.
  const resolved = resolvePlugin(data.activity.mode);
  if (!resolved?.plugin) notFound();

  return (
    <SessionRoot
      skill={resolved.skill}
      isIelts={resolved.isIelts}
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
