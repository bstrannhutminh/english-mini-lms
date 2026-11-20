import { Card, Icon } from "@/components/ui";
import Link from "next/link";
import { StructuredBody } from "./structured-body";
import type { MyWorkFeedback, ParentRevision, SubmissionDetail } from "../types";

interface CompareViewProps {
  current: SubmissionDetail;
  currentFeedback: MyWorkFeedback | null;
  parent: ParentRevision;
}

/**
 * So sánh Bản gốc vs Bản sửa — xếp DỌC trên mobile, 2 cột từ md trở lên.
 * Cột gốc kèm góp ý của bản 1 để đối chiếu khi đọc bản 2.
 */
export function CompareView({ current, currentFeedback, parent }: CompareViewProps) {
  return (
    <div className="mb-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <CompareColumn
        title={`Bản ${parent.submission.revision} · trước khi sửa`}
        submissionId={parent.submission.id}
        audioUrl={parent.submission.audioUrl}
        pronunciation={parent.feedback?.pronunciation ?? null}
        body={parent.submission.body}
        accent="muted"
        observations={parent.feedback?.observations ?? []}
      />
      <CompareColumn
        title={`Bản ${current.revision} (Đã sửa)`}
        submissionId={current.id}
        audioUrl={current.audioUrl}
        pronunciation={currentFeedback?.pronunciation ?? null}
        body={current.body}
        accent="primary"
        observations={[]}
      />
    </div>
  );
}

interface CompareColumnProps {
  title: string;
  submissionId: string;
  audioUrl?: string | null;
  pronunciation: { status: "assessed" | "not_assessable"; notes: string } | null;
  body: string | null;
  accent: "muted" | "primary";
  observations: MyWorkFeedback["observations"];
}

function CompareColumn({
  title,
  submissionId,
  audioUrl,
  pronunciation,
  body,
  accent,
  observations,
}: CompareColumnProps) {
  const isPrimary = accent === "primary";
  return (
    <Card
      padded={false}
      className={`flex flex-col gap-3 p-3.5 ${
        isPrimary ? "border-primary" : ""
      }`}
    >
      <p
        className={`border-b border-slate-100 pb-1.5 text-base font-bold ${
          isPrimary ? "text-teal-700" : "text-text-secondary"
        }`}
      >
        {title}
      </p>

      {audioUrl ? (
        <div>
          <p className="mb-1 text-base font-semibold text-text-muted">
              Bản ghi âm
          </p>
          <audio controls src={audioUrl} className="h-11 w-full" />
        </div>
      ) : null}

      {pronunciation ? (
        <div
          className={`rounded-lg border px-2.5 py-2 text-base ${
            isPrimary
              ? "border-teal-200 bg-teal-50 text-teal-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          <strong>Phát âm:</strong> {pronunciation.notes}
        </div>
      ) : null}

      <div className="text-base leading-relaxed text-text">
        <StructuredBody body={body} />
      </div>

      {observations.length > 0 ? (
        <div className="mt-1 border-t border-dashed border-slate-300 pt-3">
          <p className="mb-2 flex items-center gap-1 text-base font-bold text-amber-800">
            <Icon name="alert-triangle" className="h-3.5 w-3.5" />
            Góp ý ở bản trước ({observations.length})
          </p>
          <div className="flex flex-col gap-2">
            {observations.map((obs, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-base text-amber-900"
              >
                <p className="mb-0.5 font-bold">
                  {obs.location}
                  {obs.category ? ` · ${obs.category}` : ""}
                </p>
                <p className="mb-1 italic text-rose-800">&quot;{obs.original}&quot;</p>
                <p>
                  <strong>Cách sửa:</strong> {obs.suggestion}
                </p>
                {obs.example ? (
                  <p className="mt-0.5 text-emerald-800">
                    <strong>Mẫu:</strong> &quot;{obs.example}&quot;
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <Link href={`/my-work/${submissionId}`} className="inline-flex min-h-11 items-center text-base font-medium text-primary-dark underline underline-offset-4">Mở bài và góp ý của bản này</Link>
    </Card>
  );
}
