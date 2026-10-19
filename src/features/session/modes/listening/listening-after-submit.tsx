"use client";

import Link from "next/link";
import { Tabs } from "@/components/ui";
import { buildListeningReview } from "@/lib/listening-answer-checking";
import type { SpeakingFeedback } from "@/contracts/submission";
import type {
  CaptureHelpers,
  SessionListeningData,
  SubmissionResult,
} from "../types";
import type { ListeningModeState, ShadowingTab } from "./state";
import { ListeningReview } from "./listening-review";
import { ListeningShadowing } from "./listening-shadowing";

/**
 * Cột phải SAU khi nộp: tab Đáp án & Giải thích ⇄ Luyện Shadowing
 * (chế độ con của listening) + link đi tiếp. Chỉ render khi có submission.
 */
export function ListeningAfterSubmit({
  submission,
  listening,
  state,
  setState,
  sessionId,
  onSeek,
  capture,
  sourceRef,
}: {
  submission: SubmissionResult;
  listening: SessionListeningData;
  state: ListeningModeState;
  setState: (updater: (prev: ListeningModeState) => ListeningModeState) => void;
  sessionId: string;
  onSeek: (seconds: number) => void;
  capture: CaptureHelpers;
  sourceRef: string;
}) {
  const questionsReview = buildListeningReview(
    listening.questions,
    state.answers,
    submission.feedback?.observations,
  );

  return (
    <div>
      <Tabs
        aria-label="Chế độ sau khi nộp bài nghe"
        variant="pills"
        className="mb-4 w-full"
        value={state.activeTab}
        onValueChange={(v) =>
          setState((prev) => ({ ...prev, activeTab: v as ShadowingTab }))
        }
        tabs={[
          { value: "review", label: "📝 Đáp án & Giải thích" },
          { value: "shadowing", label: "🎙️ Luyện Shadowing từng câu" },
        ]}
      />

      {state.activeTab === "review" ? (
        submission.feedback ? (
          <ListeningReview
            assisted={Boolean(submission.assisted)}
            review={questionsReview}
            fallbackTimestamp={listening.startSeconds}
            onSeek={onSeek}
          />
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            ⚠️ Bài đã nộp nhưng việc chấm đáp án gặp lỗi. Bạn có thể xem lại kết
            quả sau tại &ldquo;Bài của tôi&rdquo;.
          </div>
        )
      ) : (
        <ListeningShadowing
          sessionId={sessionId}
          segments={listening.transcriptSegments}
          results={state.shadowingResults}
          onResult={(index: number, feedback: SpeakingFeedback) =>
            setState((prev) => ({
              ...prev,
              shadowingResults: { ...prev.shadowingResults, [index]: feedback },
            }))
          }
          onSeek={onSeek}
          capture={capture}
          sourceRef={sourceRef}
        />
      )}

      {/* Điều hướng sau nộp */}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <Link
          href={`/my-work/${submission.submissionId}`}
          className="text-sm font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-800"
        >
          Xem trong Bài của tôi
        </Link>
        <Link
          href="/today"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700"
        >
          Bài tiếp theo →
        </Link>
      </div>
    </div>
  );
}
