import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SessionData, SubmissionResult } from "../types";

/** Present lesson context without exposing transcript or answer data. */
export function ListeningLessonHeader({
  activity,
  submission,
  currentStage,
}: {
  activity: SessionData["activity"];
  submission: SubmissionResult | null | undefined;
  currentStage: number;
}) {
  const submitted = Boolean(submission);

  return (
    <div className="mb-4 rounded-xl border border-border bg-surface p-4 ">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-skill-listening-border bg-skill-listening-soft px-2 py-0.5 text-base font-bold text-skill-listening">
          <Icon name="headphones" className="h-3.5 w-3.5" />
          Nghe &amp; Shadowing
        </span>
        {submitted && (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-base font-bold",
              submission?.assisted
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            )}
          >
            {submission?.assisted ? "Có hỗ trợ" : "Tự làm độc lập"}
          </span>
        )}
      </div>
      <h2 className="mb-1.5 text-lg font-bold leading-snug text-text">
        {activity.title}
      </h2>
      {activity.objective && (
        <p className="m-0 text-base leading-relaxed text-text-secondary">
          <strong className="text-text">Mục tiêu:</strong>{" "}
          {activity.objective}
        </p>
      )}

      {/* 3 chặng học bài nghe */}
      <ol className="mt-3.5 grid grid-cols-3 gap-1.5 text-center text-base">
        {[
          { num: 1, label: "Nghe & Trả lời" },
          { num: 2, label: "Đáp án & Transcript" },
          { num: 3, label: "Shadowing" },
        ].map((st) => (
          <li
            key={st.num}
            className={cn(
              "rounded-lg border px-2 py-1.5 font-semibold",
              currentStage === st.num
                ? "border-primary bg-teal-50 text-primary-dark"
                : currentStage > st.num
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-700"
                  : "border-border-subtle bg-surface-muted text-text-muted"
            )}
          >
            {st.num}. {st.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
