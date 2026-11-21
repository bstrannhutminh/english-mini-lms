"use client";

import Link from "next/link";
import { Icon, SegmentedControl } from "@/components/ui";
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
 * Cột phải SAU khi nộp: công tắc Đáp án & giải thích ⇄ Shadowing từng câu
 * (chế độ con của listening, một hàng trên mobile) + link đi tiếp đồng bộ Teal.
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
      <SegmentedControl<ShadowingTab>
        fullWidth
        ariaLabel="Chế độ sau khi nộp bài nghe"
        className="mb-4 [&>button]:min-w-0 [&>button]:px-2"
        value={state.activeTab}
        onChange={(activeTab) => setState((prev) => ({ ...prev, activeTab }))}
        options={[
          {
            value: "review",
            label: (
              <>
                <Icon name="check-circle" className="h-4 w-4" />
                <span className="truncate">Đáp án<span className="hidden sm:inline"> &amp; giải thích</span></span>
              </>
            ),
          },
          {
            value: "shadowing",
            label: (
              <>
                <Icon name="mic" className="h-4 w-4" />
                <span className="truncate">Shadowing<span className="hidden sm:inline"> từng câu</span></span>
              </>
            ),
          },
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
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-base leading-relaxed text-amber-900">
            <Icon name="alert-triangle" className="mt-1 h-4 w-4 shrink-0" />
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 sm:justify-end">
        <Link
          href={`/my-work/${submission.submissionId}`}
          className="inline-flex min-h-11 items-center text-base font-semibold text-text-secondary underline underline-offset-2 hover:text-text"
        >
          Xem trong Bài của tôi
        </Link>
        <Link
          href="/today"
          className="pressable inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white no-underline shadow-card hover:bg-primary-dark"
        >
          <span>Bài tiếp theo</span>
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
