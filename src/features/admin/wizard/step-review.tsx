"use client";

/**
 * Bước 4 — Kiểm tra: checklist tiếng Việt khớp với luật duyệt của server
 * (checkApprovalReadiness cho bài nghe) + nút "Duyệt & đưa lên Thư viện".
 * Sau khi duyệt thành công hiển thị "Xem trong Thư viện" + "Học thử ngay".
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Icon, useToast } from "@/components/ui";
import { ApiClientError } from "@/lib/api-client";
import { startSession } from "../admin-api";
import { ErrorList } from "../form-bits";
import {
  validateQuestionsStep,
  validateSourceStep,
  validateTranscriptStep,
  type WizardData,
} from "./wizard-types";

export type SubmitPhase =
  | "idle"
  | "source"
  | "segment"
  | "activity"
  | "approve"
  | "done";

const PHASE_LABEL: Record<Exclude<SubmitPhase, "idle" | "done">, string> = {
  source: "Đang tạo nguồn video…",
  segment: "Đang tạo segment & transcript…",
  activity: "Đang tạo bài học…",
  approve: "Đang duyệt & đưa lên Thư viện…",
};

interface Check {
  ok: boolean;
  label: string;
  detail: string;
}

function buildChecklist(d: WizardData): Check[] {
  const srcErr = validateSourceStep(d);
  const trErr = validateTranscriptStep(d);
  const qErr = validateQuestionsStep(d);
  const srcOk = (f: string) => !srcErr.some((e) => e.field === f);
  return [
    {
      ok: srcOk("youtubeUrl"),
      label: "Link YouTube hợp lệ",
      detail: srcErr.find((e) => e.field === "youtubeUrl")?.message ?? "video id đúng 11 ký tự",
    },
    {
      ok: srcOk("endSeconds") && srcOk("startSeconds"),
      label: "Mốc thời gian hợp lệ",
      detail: "giây kết thúc > giây bắt đầu",
    },
    {
      ok: trErr.length === 0,
      label: "Transcript đúng định dạng",
      detail: trErr[0]?.message ?? "mọi dòng dạng start|end|text",
    },
    {
      ok: qErr.length === 0,
      label: "Câu hỏi nghe hợp lệ",
      detail: qErr[0]?.message ?? `${d.questions.length} câu, mỗi câu ≥2 lựa chọn`,
    },
    {
      ok: srcOk("title") && srcOk("activityId") && srcOk("sourceId") && srcOk("segmentId"),
      label: "Tiêu đề & mã định danh hợp lệ",
      detail:
        srcErr.find(
          (e) =>
            e.field === "title" ||
            e.field === "activityId" ||
            e.field === "sourceId" ||
            e.field === "segmentId"
        )?.message ?? `${d.activityId} · ${d.sourceId} · ${d.segmentId}`,
    },
  ];
}

export default function StepReview({
  data,
  phase,
  error,
  errorDetails,
  onApprove,
  onReset,
}: {
  data: WizardData;
  phase: SubmitPhase;
  error: string | null;
  errorDetails: { field: string; message: string }[];
  onApprove: () => void;
  onReset: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [starting, setStarting] = useState(false);
  const checks = buildChecklist(data);
  const allOk = checks.every((c) => c.ok);
  const busy = phase !== "idle" && phase !== "done";

  async function handleTryNow() {
    setStarting(true);
    try {
      const { sessionId } = await startSession(data.activityId, 30);
      router.push(`/learn/${sessionId}`);
    } catch (err) {
      if (err instanceof ApiClientError && err.sessionId) {
        router.push(`/learn/${err.sessionId}`);
        return;
      }
      toast.error("Không tạo được phiên học", err instanceof Error ? err.message : "");
      setStarting(false);
    }
  }

  if (phase === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-4 text-center">
        <Icon name="check-circle" className="mx-auto h-10 w-10 text-emerald-600" />
        <div>
          <h3 className="text-lg font-bold text-emerald-900">
            Đã duyệt &amp; đưa lên Thư viện
          </h3>
          <p className="text-sm text-emerald-800">
            Bài <strong>{data.title}</strong> ({data.activityId}) đã sẵn sàng để học.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/library" className="inline-flex">
            <Button variant="primary" size="lg">
              <Icon name="book-open" className="h-4 w-4" /> Xem trong Thư viện
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            loading={starting}
            onClick={handleTryNow}
          >
            <Icon name="play" className="h-4 w-4" /> Học thử ngay
          </Button>
        </div>
        <button
          type="button"
          className="text-sm text-emerald-800 underline underline-offset-2"
          onClick={onReset}
        >
          Tạo bài khác
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 bg-white">
            <Icon
              name={c.ok ? "check-circle" : "alert-triangle"}
              className={`mt-0.5 h-5 w-5 ${c.ok ? "text-emerald-600" : "text-amber-600"}`}
            />
            <div>
              <p className="text-sm font-medium text-slate-800">{c.label}</p>
              <p className={`text-xs ${c.ok ? "text-slate-500" : "text-amber-700"}`}>
                {c.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ErrorList error={error} details={errorDetails} />

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        Khi bấm duyệt, hệ thống sẽ lần lượt: tạo nguồn video → tạo segment kèm
        transcript → tạo bài học → chuyển trạng thái sang{" "}
        <strong>Đã duyệt</strong>. Server kiểm tra lại toàn bộ trước khi bài
        xuất hiện trong Thư viện.
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!allOk}
        loading={busy}
        onClick={onApprove}
      >
        {busy ? PHASE_LABEL[phase as keyof typeof PHASE_LABEL] : "✓ Duyệt & đưa lên Thư viện"}
      </Button>
      {!allOk && (
        <p className="text-center text-xs text-amber-700">
          Sửa các mục còn thiếu ở các bước trước để mở nút duyệt.
        </p>
      )}
    </div>
  );
}
