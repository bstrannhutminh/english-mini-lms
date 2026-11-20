"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { SessionColumns } from "../../shell/session-columns";
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
} from "../../shared/youtube-player";
import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import type { ListeningModeState } from "./state";
import { useListeningHotkeys } from "./use-listening-hotkeys";
import { ListeningQuestionsCard } from "./listening-questions-card";
import { ListeningTranscriptCard } from "./listening-transcript-card";
import { ListeningAfterSubmit } from "./listening-after-submit";
import { ListeningLessonHeader } from "./listening-lesson-header";

/**
 * Vùng làm bài mode Nghe & Shadowing với tiến trình 3 chặng rõ ràng:
 * 1. Nghe & Trả lời → 2. Đối chiếu đáp án & Transcript → 3. Shadowing từng câu.
 * Invariant transcript: chỉ render segments server trả sau reveal/nộp bài.
 */
export function ListeningPanel(props: ModePanelProps) {
  const { data, busy, postEvent, capture, submission } = props;
  const { state, setState } = usePluginState<ListeningModeState>(props);
  const router = useRouter();
  const [seekTo, setSeekTo] = useState<number | null>(null);

  const listening = data.listening;
  const playerControlRef = useRef<YouTubePlayerHandle>(null);
  useListeningHotkeys(playerControlRef, !busy);

  const submitted = Boolean(submission);
  const revealed =
    state.revealed || Boolean(listening?.isTranscriptRevealed) || submitted;
  const transcriptPending =
    !Boolean(listening?.isTranscriptRevealed) && (state.revealed || submitted);

  useEffect(() => {
    if (submission && !state.submittedId) {
      setState((prev) => ({
        ...prev,
        submittedId: submission.submissionId,
        activeTab: "review",
      }));
      router.refresh();
    }
  }, [submission, state.submittedId, setState, router]);

  useEffect(() => {
    if (
      state.revealed &&
      !submitted &&
      listening &&
      !listening.isTranscriptRevealed
    ) {
      router.refresh();
    }
  }, [state.revealed, submitted, listening, router]);

  if (!listening) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-base text-amber-900">
        <Icon name="alert-triangle" className="mt-0.5 h-5 w-5 shrink-0" />
        <span>
          <strong>Chưa thể mở bài nghe.</strong> Bài này chưa có dữ liệu đoạn
          nghe (source segment hoặc câu hỏi). Vui lòng báo quản trị để kiểm tra.
        </span>
      </div>
    );
  }

  const sourceRef = `${data.activity.title} · ${listening.videoUrl || "Nguồn video chưa được ghi nhận"} · ${listening.startSeconds}–${listening.endSeconds}s`;
  const currentStage = !submitted
    ? 1
    : state.activeTab === "shadowing"
      ? 3
      : 2;

  async function handleReveal() {
    if (revealed || state.isRevealing) return;
    setState((prev) => ({ ...prev, isRevealing: true, revealError: null }));
    const ok = await postEvent("reveal", { target: "listening_transcript" });
    if (ok) {
      setState((prev) => ({ ...prev, isRevealing: false, revealed: true }));
    } else {
      setState((prev) => ({
        ...prev,
        isRevealing: false,
        revealError:
          "Không ghi nhận được sự kiện mở transcript (mất kết nối?). Transcript vẫn đang khoá — hãy thử lại.",
      }));
    }
  }

  function handleSeek(seconds: number) {
    setSeekTo(null);
    setTimeout(() => setSeekTo(seconds), 0);
  }

  function handleSelectOption(questionId: string, optionId: string) {
    if (submitted) return;
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: optionId },
    }));
  }

  const left = (
    <>
      <ListeningLessonHeader
        activity={data.activity}
        submission={submission}
        currentStage={currentStage}
      />

      {!listening.videoUrl && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-base text-amber-900">
          <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Chưa có video nguồn.</strong> Hãy báo quản trị bổ sung video đã duyệt cho bài này.
          </span>
        </div>
      )}

      {listening.videoUrl && <YouTubePlayer
        videoUrl={listening.videoUrl}
        startSeconds={listening.startSeconds}
        endSeconds={listening.endSeconds}
        seekTo={seekTo}
        controlRef={playerControlRef}
      />}

      <p className="mb-4 hidden text-base text-text-muted lg:block">
        Phím tắt:{" "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">
          Space
        </kbd>{" "}
        phát/dừng ·{" "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">
          ←
        </kbd>{" "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">
          →
        </kbd>{" "}
        tua 5 giây (bấm ra ngoài khung video trước khi dùng).
      </p>

      {!submitted && (
        <ListeningTranscriptCard
          revealed={revealed}
          isRevealing={state.isRevealing}
          revealError={state.revealError}
          loadingTranscript={transcriptPending}
          segments={listening.transcriptSegments}
          onReveal={() => void handleReveal()}
          onSeek={handleSeek}
          capture={capture}
          sourceRef={sourceRef}
        />
      )}
    </>
  );

  const right = submission ? (
    <ListeningAfterSubmit
      submission={submission}
      listening={listening}
      state={state}
      setState={setState}
      sessionId={data.sessionId}
      onSeek={handleSeek}
      capture={capture}
      sourceRef={sourceRef}
    />
  ) : (
    <ListeningQuestionsCard
      questions={listening.questions}
      answers={state.answers}
      disabled={busy}
      onSelectOption={handleSelectOption}
      capture={capture}
      sourceRef={sourceRef}
    />
  );

  return <SessionColumns left={left} right={right} />;
}
