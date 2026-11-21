import { Icon, Spinner } from "@/components/ui";
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
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-base font-medium text-primary-dark">
          <Spinner size="sm" label="Đang tải lên" />
          <span>Đang tải file ghi âm lên hệ thống lưu trữ an toàn...</span>
        </div>
      )}
      {mediaStatus === "ready" && (
        <div role="status" className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-800">
          <Icon name="check-circle" className="h-4 w-4 shrink-0" />
          <span>File ghi âm đã sẵn sàng để nộp.</span>
        </div>
      )}
      {mediaStatus === "error" && (
        <div
          role="alert"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800"
        >
          <span>{mediaError || "Không tải được file ghi âm lên."}</span>
          <button
            type="button"
            onClick={onRetryUpload}
            disabled={busy}
            className="pressable inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-xl border border-red-300 bg-surface px-3 text-base font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60"
          >
            Thử lại
          </button>
        </div>
      )}
    </>
  );
}
