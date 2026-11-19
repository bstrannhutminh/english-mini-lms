"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

/** Video minh hoạ khi bài chưa gắn nguồn thật (giữ hành vi view cũ). */
const DEMO_VIDEO_URL = "https://www.youtube.com/watch?v=uVSiFJ85EtM";

/**
 * Vùng làm bài mode Nghe (không chrome): trái = đề + player + transcript khoá,
 * phải = câu hỏi; sau nộp = đáp án + chế độ con Shadowing.
 * Invariant transcript: chỉ render segments server trả — reveal ghi
 * session_events trước (fail → lỗi Việt + retry, không mở), nộp xong
 * router.refresh() để nhận transcript đã mở khoá.
 */
export function ListeningPanel(props: ModePanelProps) {
  const { data, busy, postEvent, capture, submission } = props;
  const { state, setState } = usePluginState<ListeningModeState>(props);
  const router = useRouter();
  const [seekTo, setSeekTo] = useState<number | null>(null);

  const listening = data.listening;
  const playerControlRef = useRef<YouTubePlayerHandle>(null);
  useListeningHotkeys(playerControlRef);

  const submitted = Boolean(submission);
  const revealed =
    state.revealed || Boolean(listening?.isTranscriptRevealed) || submitted;
  // Đang chờ server trả segments sau khi đã ghi event reveal / đã nộp
  // (isTranscriptRevealed chỉ lật true khi getSessionDetails chạy lại).
  const transcriptPending =
    !Boolean(listening?.isTranscriptRevealed) && (state.revealed || submitted);

  // Nộp xong → khoá nộp lại trong state + làm mới data để nhận transcript mở khoá
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

  // Đã ghi event reveal → làm mới để server trả transcriptSegments
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
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
        ⚠️ <strong>Chưa thể mở bài nghe.</strong> Bài này chưa có dữ liệu đoạn
        nghe (source segment hoặc câu hỏi). Vui lòng báo quản trị để kiểm tra.
      </div>
    );
  }

  const sourceRef = `Bài nghe: ${data.activity.slot || data.activity.id}`;

  /** Mở transcript trước nộp → ghi event reveal (server sẽ tính assisted). */
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
    // seekTo cùng giá trị 2 lần liên tiếp vẫn phải seek lại → về null rồi set.
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
      {/* Thông tin bài */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-skill-listening-soft px-2 py-0.5 text-xs font-bold text-skill-listening">
            🎧 {data.activity.slot || data.activity.id} · Nghe & Shadowing
          </span>
          {submitted && (
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                submission?.assisted
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {submission?.assisted ? "💡 Có trợ giúp" : "⭐ Tự làm độc lập"}
            </span>
          )}
        </div>
        <h2 className="mb-1.5 text-lg font-bold leading-snug text-slate-900">
          {data.activity.title}
        </h2>
        {data.activity.objective && (
          <p className="m-0 text-sm leading-snug text-slate-600">
            🎯 <strong>Mục tiêu:</strong> {data.activity.objective}
          </p>
        )}
      </div>

      {/* Cảnh báo thiếu video thật */}
      {!listening.videoUrl && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-3.5 py-2.5 text-[13px] text-yellow-800">
          <span>⚠️</span>
          <span>
            <strong>
              Bài này thiếu đoạn trích/video thật — nội dung demo tạm
            </strong>{" "}
            (đang phát video minh hoạ mặc định).
          </span>
        </div>
      )}

      {/* Trình phát YouTube: start/end giây, 0.75x, fallback link khi chặn nhúng */}
      <YouTubePlayer
        videoUrl={listening.videoUrl || DEMO_VIDEO_URL}
        startSeconds={listening.startSeconds}
        endSeconds={listening.endSeconds}
        seekTo={seekTo}
        controlRef={playerControlRef}
      />

      <p className="mb-4 hidden text-xs text-slate-500 lg:block">
        ⌨️ Phím tắt:{" "}
        <kbd className="rounded border border-slate-300 bg-white px-1.5">
          Space
        </kbd>{" "}
        phát/dừng ·{" "}
        <kbd className="rounded border border-slate-300 bg-white px-1.5">←</kbd>{" "}
        <kbd className="rounded border border-slate-300 bg-white px-1.5">→</kbd>{" "}
        tua 5 giây (bấm ra ngoài khung video trước khi dùng).
      </p>

      {/* Transcript bị khoá cho đến khi nộp (mở sớm = có trợ giúp) */}
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
