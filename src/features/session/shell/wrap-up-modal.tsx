"use client";

/**
 * Modal khi hết giờ phiên (shell dùng — bản cũ ở learn/[sessionId]/
 * session-wrap-up-modal.tsx vẫn phục vụ các view fallback).
 * Có gợi ý bước kế tiếp: nộp bài → góp ý → "Sửa lại ngay".
 */
export function SessionWrapUpModal({
  targetMinutes,
  isOpen,
  onSaveAndExit,
  onSubmit,
  onExtend,
  isSaving = false,
  canSubmit = true,
}: {
  targetMinutes: number;
  isOpen: boolean;
  onSaveAndExit: () => void;
  onSubmit?: () => void;
  onExtend: () => void;
  isSaving?: boolean;
  canSubmit?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700 shadow-inner">
            ⏱️
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Đã đạt mốc {targetMinutes} phút cam kết!
          </h3>
          <p className="text-xs leading-relaxed text-slate-600">
            Phiên học đã tự động tạm dừng đồng hồ. Bạn có thể lưu nháp để khép
            lại phiên hôm nay mà{" "}
            <strong>hoàn toàn không bị mất nội dung</strong>, hoặc nộp bài để
            nhận góp ý.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={!canSubmit || isSaving}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              <span>🚀</span> Nộp bài & Nhận nhận xét ngay
            </button>
          )}

          <button
            onClick={onSaveAndExit}
            disabled={isSaving}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span> Đang lưu nháp an toàn...
              </>
            ) : (
              <>
                <span>💾</span> Lưu nháp an toàn & Khép phiên hôm nay
              </>
            )}
          </button>

          <button
            onClick={onExtend}
            disabled={isSaving}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <span>⏳</span> Học thêm 5 phút nữa
          </button>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          💡 Bước kế tiếp sau khi nộp: đọc góp ý rồi bấm{" "}
          <strong>&ldquo;Sửa lại ngay&rdquo;</strong> để viết Bản 2. Bản nháp luôn
          được bảo lưu trên máy chủ.
        </p>
      </div>
    </div>
  );
}
