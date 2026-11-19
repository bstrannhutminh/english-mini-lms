"use client";

import { useState } from "react";
import { Icon, MarkdownText } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CaptureHelpers, SessionSegment } from "../types";

type FontScale = "base" | "lg" | "xl";

const FONT_SCALE_OPTIONS: Array<{ key: FontScale; label: string; cls: string }> =
  [
    { key: "base", label: "A-", cls: "text-base leading-[1.75]" },
    { key: "lg", label: "A", cls: "text-[17px] leading-[1.8]" },
    { key: "xl", label: "A+", cls: "text-[19px] leading-[1.85]" },
  ];

/**
 * Thẻ đoạn văn gốc (source_segments) của mode Đọc–dịch:
 * render Markdown sạch (không lộ dấu #), hỗ trợ đổi cỡ chữ A-/A/A+ cho văn
 * bản y khoa và giữ nguyên bôi đen → Smart Capture 1 chạm.
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
  const [fontScale, setFontScale] = useState<FontScale>("base");
  const activeScale =
    FONT_SCALE_OPTIONS.find((opt) => opt.key === fontScale) ??
    FONT_SCALE_OPTIONS[0];

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      {/* Header: nguồn + trang + nút cỡ chữ */}
      <div className="border-b border-border bg-surface-muted px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="book-open" className="h-4 w-4 text-skill-reading" />
            <span className="text-xs font-bold tracking-wider text-text uppercase">
              Đoạn văn bản gốc
            </span>
            {segment.page != null && (
              <span className="rounded-md border border-skill-reading-border bg-skill-reading-soft px-2 py-0.5 text-xs font-semibold text-skill-reading">
                Trang {segment.page}
              </span>
            )}
          </div>

          <div
            role="group"
            aria-label="Điều chỉnh cỡ chữ đoạn văn"
            className="inline-flex rounded-lg border border-border bg-surface p-0.5"
          >
            {FONT_SCALE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFontScale(opt.key)}
                aria-pressed={fontScale === opt.key}
                className={cn(
                  "min-h-11 min-w-11 cursor-pointer rounded-md px-2 text-xs font-semibold transition",
                  fontScale === opt.key
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {segment.sourceTitle && (
          <div className="mt-1 text-xs italic text-text-muted">
            {segment.sourceTitle}
          </div>
        )}
      </div>

      {/* Gợi ý 1-Click Smart Capture */}
      <div className="flex items-start gap-2 border-b border-emerald-100 bg-emerald-50/70 px-4 py-2.5 text-xs leading-snug text-emerald-900">
        <Icon name="lightbulb" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <span>
          <strong>Sổ từ vựng:</strong> bôi đen từ hoặc cụm thuật ngữ bất kỳ để
          tra nghĩa chuyên ngành và bấm <em>&ldquo;Lưu vào sổ&rdquo;</em> 1 chạm.
        </span>
      </div>

      {/* Nội dung đoạn văn — render Markdown sạch & gắn capture handlers */}
      <div
        {...capture.selectHandlers(segment.textContent ?? "", sourceRef)}
        className={cn("px-5 py-5 text-text", activeScale.cls)}
      >
        <MarkdownText text={segment.textContent ?? ""} />
      </div>
    </div>
  );
}
