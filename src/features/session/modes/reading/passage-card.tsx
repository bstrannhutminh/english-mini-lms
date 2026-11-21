"use client";

import { useState } from "react";
import { Icon, MarkdownText } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CaptureHelpers, SessionSegment } from "../types";

type FontScale = "base" | "lg" | "xl";

const FONT_SCALE_OPTIONS: Array<{ key: FontScale; label: string; name: string; cls: string }> =
  [
    { key: "base", label: "A-", name: "Cỡ chữ nhỏ", cls: "text-base leading-[1.75]" },
    { key: "lg", label: "A", name: "Cỡ chữ vừa", cls: "text-[17px] leading-[1.8]" },
    { key: "xl", label: "A+", name: "Cỡ chữ lớn", cls: "text-[19px] leading-[1.85]" },
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
    <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card lg:mt-5">
      {/* Header: nguồn + trang + nút cỡ chữ */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="eyebrow">
            Đoạn văn bản gốc{segment.page != null ? ` · Trang ${segment.page}` : ""}
          </p>
          {segment.sourceTitle && (
            <p className="mt-0.5 text-sm italic leading-5 text-text-secondary">{segment.sourceTitle}</p>
          )}
        </div>

        <div
          role="group"
          aria-label="Điều chỉnh cỡ chữ đoạn văn"
          className="inline-flex shrink-0 rounded-xl bg-surface-subtle p-1"
        >
          {FONT_SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFontScale(opt.key)}
              aria-pressed={fontScale === opt.key}
              aria-label={opt.name}
              className={cn(
                "pressable min-h-11 min-w-11 cursor-pointer rounded-lg px-2 text-base font-semibold",
                fontScale === opt.key
                  ? "bg-surface text-primary-dark shadow-card ring-1 ring-inset ring-border"
                  : "text-text-secondary hover:text-text"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nội dung đoạn văn — render Markdown sạch & gắn capture handlers */}
      <div
        {...capture.selectHandlers(segment.textContent ?? "", sourceRef, "book")}
        className={cn("max-w-[65ch] px-5 py-5 text-text sm:px-6 sm:py-6 [&>p+p]:mt-4", activeScale.cls)}
      >
        <MarkdownText text={segment.textContent ?? ""} />
      </div>

      {/* Gợi ý 1-Click Smart Capture */}
      <p className="flex items-start gap-2 border-t border-border bg-surface-muted px-5 py-3 text-sm leading-5 text-text-secondary sm:px-6">
        <Icon name="bookmark" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          <strong className="font-semibold text-text">Sổ từ vựng:</strong> bôi đen từ hoặc cụm thuật ngữ bất kỳ để
          tra nghĩa chuyên ngành và bấm <em>&ldquo;Lưu vào sổ&rdquo;</em> 1 chạm.
        </span>
      </p>
    </section>
  );
}
