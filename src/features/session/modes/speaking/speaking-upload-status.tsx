import { Icon } from "@/components/ui";
import type { MediaUploadStatus } from "./state";

/** Show storage readiness and retry only for an existing, completed take. */
export function SpeakingUploadStatus({
  mediaStatus,
  mediaError,
  busy,
  onRetryUpload,
}: {
  mediaStatus: MediaUploadStatus;
  mediaError: string | null;
  busy: boolean;
  onRetryUpload: () => void;
}) {
  return (
    <>
      {mediaStatus === "uploading" && (
        <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50/70 px-3.5 py-2.5 text-base font-medium text-primary-dark">
          Đang tải file ghi âm lên hệ thống lưu trữ an toàn...
        </div>
      )}
      {mediaStatus === "ready" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-base font-medium text-emerald-800">
          <Icon name="check-circle" className="h-4 w-4 shrink-0" />
          <span>File ghi âm đã sẵn sàng để nộp.</span>
        </div>
      )}
      {mediaStatus === "error" && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-base text-red-700"
        >
          <span>{mediaError || "Không tải được file ghi âm lên."}</span>
          <button
            type="button"
            onClick={onRetryUpload}
            disabled={busy}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-lg border border-red-300 bg-white px-3 text-base font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            Thử lại
          </button>
        </div>
      )}
    </>
  );
}
