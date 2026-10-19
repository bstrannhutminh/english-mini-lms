"use client";

/**
 * Wizard "Bài nghe YouTube mới" — 4 bước: Nguồn → Transcript → Câu hỏi → Kiểm tra.
 * Thu thập toàn bộ dữ liệu trước; khi duyệt mới ghi DB theo thứ tự
 * nguồn → segment → activity → approve. 409 "đã tồn tại" → PATCH cập nhật
 * (idempotent, an toàn khi bấm lại sau lỗi).
 */
import { useMemo, useState } from "react";
import { Button, Icon, useToast } from "@/components/ui";
import { ApiClientError } from "@/lib/api-client";
import { slugifyTopic } from "@/lib/topics";
import {
  createActivity,
  createSegment,
  createSource,
  updateActivity,
  updateSegment,
  updateSource,
} from "../admin-api";
import { toErrorState } from "../form-bits";
import type { FieldError } from "@/lib/content-constants";
import StepQuestions from "./step-questions";
import StepReview, { type SubmitPhase } from "./step-review";
import StepSource from "./step-source";
import StepTranscript from "./step-transcript";
import {
  draftToQuestion,
  newQuestionDraft,
  suggestActivityId,
  suggestSegmentId,
  suggestSourceId,
  validateQuestionsStep,
  validateSourceStep,
  validateTranscriptStep,
  type WizardData,
} from "./wizard-types";

const STEPS = [
  { key: "source", label: "1. Nguồn" },
  { key: "transcript", label: "2. Transcript" },
  { key: "questions", label: "3. Câu hỏi" },
  { key: "review", label: "4. Kiểm tra" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

const intOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

function initialData(existingIds: string[]): WizardData {
  const sourceId = suggestSourceId("bai-nghe-moi");
  return {
    mode: "listening",
    title: "",
    topic: "",
    durationMinutes: "",
    youtubeUrl: "",
    startSeconds: "",
    endSeconds: "",
    sourceId,
    segmentId: suggestSegmentId(sourceId),
    activityId: suggestActivityId("listening", existingIds),
    idsTouched: false,
    transcript: "",
    verifiedTranscript: false,
    questions: [newQuestionDraft(0)],
  };
}

/** Tạo mới; nếu đã tồn tại (409) thì PATCH nội dung — an toàn để bấm lại. */
async function upsert(
  createFn: (body: unknown) => Promise<unknown>,
  updateFn: (id: string, body: unknown) => Promise<unknown>,
  id: string,
  body: Record<string, unknown>
): Promise<void> {
  try {
    await createFn({ ...body, id });
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 409) {
      await updateFn(id, body);
      return;
    }
    throw err;
  }
}

export default function LessonWizard({
  existingActivityIds,
  onDone,
  onCancel,
}: {
  existingActivityIds: string[];
  /** Gọi sau khi duyệt thành công (để reload danh sách). */
  onDone: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [data, setData] = useState<WizardData>(() =>
    initialData(existingActivityIds)
  );
  const [step, setStep] = useState<StepKey>("source");
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<FieldError[]>([]);

  const patch = (p: Partial<WizardData>) => setData((d) => ({ ...d, ...p }));

  const stepErrors = useMemo(() => {
    if (step === "source") return validateSourceStep(data);
    if (step === "transcript") return validateTranscriptStep(data);
    if (step === "questions") return validateQuestionsStep(data);
    return [];
  }, [step, data]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const canNext = stepErrors.length === 0;

  function goBack() {
    setStep(STEPS[Math.max(0, stepIndex - 1)].key);
  }
  function goNext() {
    if (!canNext) return;
    setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].key);
  }

  async function approve() {
    setError(null);
    setErrorDetails([]);
    const title = data.title.trim();
    const url = data.youtubeUrl.trim();
    const transcript = data.transcript.trim();
    const topic = data.topic.trim() ? slugifyTopic(data.topic) : null;

    try {
      setPhase("source");
      await upsert(createSource, updateSource, data.sourceId, {
        title,
        kind: "video",
        url,
        locatorType: "seconds",
        permission: "personal-study",
      });

      setPhase("segment");
      await upsert(createSegment, updateSegment, data.segmentId, {
        sourceId: data.sourceId,
        startSeconds: intOrNull(data.startSeconds),
        endSeconds: intOrNull(data.endSeconds),
        transcriptContent: transcript,
        verifiedTranscript: data.verifiedTranscript,
        language: "en",
      });

      setPhase("activity");
      await upsert(createActivity, updateActivity, data.activityId, {
        mode: data.mode,
        title,
        durationMinutes: intOrNull(data.durationMinutes),
        difficulty: "beginner",
        purpose: "practice",
        answerReveal: "after_submit",
        segmentIds: [data.segmentId],
        questions: data.questions.map(draftToQuestion),
        topic,
      });

      setPhase("approve");
      await updateSource(data.sourceId, { reviewState: "approved" });
      await updateActivity(data.activityId, { reviewState: "approved" });

      setPhase("done");
      toast.success("Đã duyệt bài học", `"${title}" đã lên Thư viện.`);
      onDone();
    } catch (err) {
      const e = toErrorState(err);
      setError(e.message);
      setErrorDetails(e.fields);
      setPhase("idle");
      toast.error("Duyệt thất bại", e.message);
    }
  }

  function reset() {
    setData(initialData(existingActivityIds));
    setStep("source");
    setPhase("idle");
    setError(null);
    setErrorDetails([]);
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">
          ＋ Bài nghe YouTube mới
        </h2>
        {phase === "idle" && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <Icon name="x" className="h-4 w-4" /> Đóng
          </Button>
        )}
      </div>

      {/* Stepper */}
      <ol className="flex flex-wrap gap-2" aria-label="Các bước tạo bài">
        {STEPS.map((s, i) => (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => i <= stepIndex && setStep(s.key)}
              disabled={i > stepIndex}
              aria-current={s.key === step ? "step" : undefined}
              className={`min-h-11 rounded-lg px-3 text-sm font-medium transition ${
                s.key === step
                  ? "bg-indigo-600 text-white"
                  : i < stepIndex
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      {step === "source" && (
        <StepSource data={data} existingActivityIds={existingActivityIds} onChange={patch} />
      )}
      {step === "transcript" && <StepTranscript data={data} onChange={patch} />}
      {step === "questions" && <StepQuestions data={data} onChange={patch} />}
      {step === "review" && (
        <StepReview
          data={data}
          phase={phase}
          error={error}
          errorDetails={errorDetails}
          onApprove={approve}
          onReset={reset}
        />
      )}

      {/* Điều hướng bước */}
      {step !== "review" && phase === "idle" && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
            <Icon name="arrow-left" className="h-4 w-4" /> Quay lại
          </Button>
          <Button variant="primary" onClick={goNext} disabled={!canNext}>
            Tiếp tục <Icon name="arrow-right" className="h-4 w-4" />
          </Button>
        </div>
      )}
      {step === "review" && phase === "idle" && (
        <Button variant="outline" onClick={goBack}>
          <Icon name="arrow-left" className="h-4 w-4" /> Quay lại chỉnh sửa
        </Button>
      )}
    </section>
  );
}
