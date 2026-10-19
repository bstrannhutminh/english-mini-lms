import { notFound, redirect } from "next/navigation";
import { getCurrentLearner } from "@/server/auth";
import {
  getSessionDetails,
  getSubmissionWithFeedback,
} from "@/server/learning/service";
import { resolvePlugin } from "@/features/session/modes/registry";
import { SessionShell } from "@/features/session/shell/session-shell";
import { WritingSessionView } from "./writing-session-view";
import { ReadingSessionView } from "./reading-session-view";
import { SpeakingSessionView } from "./speaking-session-view";
import { ListeningSessionView } from "./listening-session-view";

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

  const activity = {
    id: data.activity.id,
    slot: data.activity.slot,
    title: data.activity.title,
    mode: data.activity.mode,
    objective: data.activity.objective,
    promptText: data.activity.promptText,
    feedbackGuide: data.activity.feedbackGuide,
    durationMinutes: data.activity.durationMinutes,
  };

  // Định tuyến theo SKILL (modeSkill): ielts-* → cùng plugin skill + badge.
  // Sửa lỗi cũ: ielts-reading từng rơi vào WritingSessionView.
  const resolved = resolvePlugin(data.activity.mode);

  if (resolved?.plugin) {
    return (
      <SessionShell
        plugin={resolved.plugin}
        isIelts={resolved.isIelts}
        data={{
          sessionId,
          targetMinutes: data.session.targetMinutes,
          activity,
          initialDraft: data.draft?.content || "",
          segment: data.segment,
          parentId,
          parentData,
          // Payload mode nghe (đã gate transcript phía server); null với
          // skill khác hoặc ielts-listening tới khi B8 mở rộng service.
          listening: data.listening,
        }}
      />
    );
  }

  // Fallback: skill chưa có plugin → view cũ, vẫn theo skill (không theo mode thô)
  if (resolved?.skill === "reading") {
    return (
      <ReadingSessionView
        sessionId={sessionId}
        targetMinutes={data.session.targetMinutes}
        activity={activity}
        segment={data.segment}
        initialDraft={data.draft?.content || ""}
        parentId={parentId}
      />
    );
  }

  if (resolved?.skill === "listening") {
    // getSessionDetails chỉ đổ `listening` khi mode === "listening" (server fix: B8)
    if (!data.listening) {
      return (
        <MissingSessionData
          message="Bài nghe này chưa có dữ liệu đoạn nghe. Vui lòng báo quản trị để gắn source segment."
        />
      );
    }
    return (
      <ListeningSessionView
        sessionId={sessionId}
        targetMinutes={data.session.targetMinutes}
        activity={{ ...activity, durationMinutes: activity.durationMinutes || 15 }}
        listening={data.listening}
        parentId={parentId}
      />
    );
  }

  if (resolved?.skill === "speaking") {
    return (
      <SpeakingSessionView
        sessionId={sessionId}
        targetMinutes={data.session.targetMinutes}
        activity={{ ...activity, durationMinutes: activity.durationMinutes || 15 }}
        parentId={parentId}
        parentData={parentData}
      />
    );
  }

  // Mode lạ (skill = null) → giữ hành vi cũ: render view viết
  return (
    <WritingSessionView
      sessionId={sessionId}
      targetMinutes={data.session.targetMinutes}
      activity={activity}
      initialDraft={data.draft?.content || ""}
      parentId={parentId}
      parentData={parentData}
    />
  );
}

function MissingSessionData({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-[768px] px-4 pt-10">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
        ⚠️ <strong>Chưa thể mở bài học.</strong> {message}
      </div>
    </div>
  );
}
