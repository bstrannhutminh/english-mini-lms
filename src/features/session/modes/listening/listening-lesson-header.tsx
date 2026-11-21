import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { StepProgress } from "../../shared/step-progress";
import type { SessionData, SubmissionResult } from "../types";

const STAGES = ["Nghe & trả lời", "Đáp án & transcript", "Shadowing"] as const;

/**
 * Present lesson context without exposing transcript or answer data.
 * Gọn trên mobile (một dòng chặng + mục tiêu) để trình phát lên sớm; ≥sm hiện
 * đủ thanh 3 chặng.
 */
export function ListeningLessonHeader({
  activity,
  submission,
  currentStage,
  className,
}: {
  activity: SessionData["activity"];
  submission: SubmissionResult | null | undefined;
  currentStage: number;
  className?: string;
}) {
  const submitted = Boolean(submission);

  return (
    <section className={cn("rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="eyebrow">
          <span className="hidden sm:inline">Nghe &amp; Shadowing</span>
          <span className="sm:hidden">Chặng {currentStage}/3 · {STAGES[currentStage - 1]}</span>
        </p>
        {submitted && (
          <Badge tone={submission?.assisted ? "warning" : "success"}>
            {submission?.assisted ? "Có hỗ trợ" : "Tự làm độc lập"}
          </Badge>
        )}
      </div>
      <h2 className="mt-1 hidden text-xl font-semibold tracking-tight text-text sm:block">
        Nghe và nắm bắt ý chính
      </h2>
      {activity.objective && (
        <p className="mt-1 text-base leading-relaxed text-text-secondary sm:mt-3">
          <strong className="font-semibold text-text">Mục tiêu:</strong>{" "}
          {activity.objective}
        </p>
      )}

      {/* 3 chặng học bài nghe */}
      <StepProgress steps={STAGES} current={currentStage} className="mt-5 hidden sm:flex" />
    </section>
  );
}
