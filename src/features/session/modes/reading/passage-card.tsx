"use client";

import type { CaptureHelpers, SessionSegment } from "../types";

/**
 * Thẻ đoạn văn gốc (source_segments) của mode Đọc–dịch.
 * Bôi đen bất kỳ đoạn nào → shell mở Smart Capture (Vocabulary Vault).
 * Không render khi segment thiếu — panel hiện EmptyState thay vì nội dung giả.
 */
export function PassageCard({
  segment,
  sourceRef,
  capture,
}: {
  segment: SessionSegment;
  sourceRef: string;
  capture: CaptureHelpers;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      {/* Header: nhãn + số trang + tên nguồn */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <span aria-hidden>📖</span>
            <span className="text-sm font-bold text-slate-800">
              ĐOẠN VĂN BẢN GỐC
            </span>
          </div>
          {segment.page != null && (
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              Trang {segment.page}
            </span>
          )}
        </div>
        {segment.sourceTitle && (
          <div className="mt-1 text-xs italic text-slate-500">
            {segment.sourceTitle}
          </div>
        )}
      </div>

      {/* Banner hướng dẫn Smart Capture */}
      <div className="flex items-start gap-2 border-b border-green-100 bg-green-50 px-4 py-2.5 text-[13px] leading-snug text-green-800">
        <span aria-hidden>💡</span>
        <span>
          <strong>Vocabulary Vault:</strong> bôi đen từ/cụm từ trong đoạn văn để
          tra nghĩa và bấm <em>&ldquo;Lưu vào sổ&rdquo;</em> một chạm.
        </span>
      </div>

      {/* Nội dung đoạn văn — vùng bôi đen gắn capture handlers */}
      <div
        {...capture.selectHandlers(segment.textContent ?? "", sourceRef)}
        className="whitespace-pre-line px-5 py-5 text-base leading-[1.75] text-slate-900"
      >
        {segment.textContent}
      </div>
    </div>
  );
}
