"use client";

import { Badge, Icon } from "@/components/ui";
import { FlagButton } from "./flag-button";
import { SavePhraseButton } from "./save-phrase-button";
import type { FeedbackObservation } from "../types";

interface ObservationCardProps {
  obs: FeedbackObservation;
  /** Index trong mảng observations gốc (server đánh dấu cờ theo index này). */
  index: number;
  feedbackId?: string;
  /** Nguồn để gắn vào cụm từ lưu Sổ từ (vd. tiêu đề bài học). */
  sourceRef?: string;
  /** Đã gắn cờ cục bộ sau khi POST thành công. */
  locallyFlagged?: boolean;
  onFlagged?: (index: number) => void;
  /** Kiểu nhỏ gọn cho khu vực Top-3 ưu tiên. */
  compact?: boolean;
}

/** Một điểm góp ý: vị trí → câu gốc → vấn đề → cách sửa → ví dụ → thử thách. */
export function ObservationCard({
  obs,
  index,
  feedbackId,
  sourceRef,
  locallyFlagged = false,
  onFlagged,
  compact = false,
}: ObservationCardProps) {
  const isFlagged = locallyFlagged || Boolean(obs.flagged);

  return (
    <div
      className={`rounded-2xl border bg-surface shadow-xs ${
        isFlagged ? "border-amber-300" : "border-border"
      } ${compact ? "p-3.5" : "p-4"}`}
    >
      {/* Vị trí + category + hành động (flag / lưu cụm từ) */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
            <Icon name="search" className="h-3 w-3" />
            {obs.location}
          </span>
          {obs.category ? <Badge tone="info">{obs.category}</Badge> : null}
        </div>
        <div className="flex items-center gap-1.5">
          <FlagButton
            feedbackId={feedbackId}
            observationIndex={index}
            flagged={isFlagged}
            onFlagged={onFlagged}
          />
          {obs.example ? (
            <SavePhraseButton text={obs.example} sentence={obs.example} sourceRef={sourceRef} />
          ) : null}
        </div>
      </div>

      <div className="mb-2.5 rounded-md border-l-2 border-rose-400 bg-rose-50 px-3 py-2 text-sm italic text-rose-900">
        &quot;{obs.original}&quot;
      </div>

      <p className="mb-1.5 text-sm text-text">
        <strong>Vấn đề:</strong> {obs.issue}
      </p>
      <p className="mb-2.5 text-sm text-emerald-800">
        <strong>Cách sửa:</strong> {obs.suggestion}
      </p>

      {obs.example ? (
        <div className="mb-2.5 rounded-md border-l-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <strong>Câu mẫu đề xuất:</strong> &quot;{obs.example}&quot;
        </div>
      ) : null}

      {obs.retry_prompt ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-surface-muted px-3 py-2 text-xs text-text-secondary">
          <strong>Thử thách bản sửa:</strong> {obs.retry_prompt}
        </div>
      ) : null}
    </div>
  );
}
