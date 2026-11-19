"use client";

import Link from "next/link";
import { Icon, Tabs } from "@/components/ui";
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
 * (chế độ con của listening) + link đi tiếp đồng bộ Teal.
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
    submission.feedback?.observations
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
          { value: "review", label: "Đáp án & Giải thích", icon: "check-circle" },
          { value: "shadowing", label: "Luyện Shadowing từng câu", icon: "mic" },
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
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Icon name="alert-triangle" className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            <span>
              Bài đã nộp nhưng việc chấm đáp án gặp lỗi. Bạn có thể xem lại kết
              quả sau tại &ldquo;Bài của tôi&rdquo;.
            </span>
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

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <Link
          href={`/my-work/${submission.submissionId}`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-text-secondary underline underline-offset-2 hover:text-text"
        >
          Xem trong Bài của tôi
        </Link>
        <Link
          href="/today"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white no-underline shadow-xs transition hover:bg-primary-dark"
        >
          <span>Bài tiếp theo</span>
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
