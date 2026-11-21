"use client";

import { Badge, Icon } from "@/components/ui";
import { feedbackCategoryLabel } from "@/lib/feedback-labels";
import { cn } from "@/lib/utils";
import { FlagButton } from "./flag-button";
import { SavePhraseButton } from "./save-phrase-button";
import type { FeedbackObservation } from "../types";

interface ObservationCardProps {
  obs: FeedbackObservation;
  /** Index thật trong feedback.observations (dùng cho API gắn cờ). */
  index: number;
  feedbackId?: string;
  sourceRef?: string;
  locallyFlagged?: boolean;
  onFlagged?: (index: number) => void;
  /** Nhãn khối bản gốc theo kỹ năng, mặc định "Câu bạn đã viết". */
  originalLabel?: string;
}

/**
 * Một góp ý của AI, đọc theo thứ tự: bản gốc (đỏ nhạt) → cách sửa + câu mẫu
 * (xanh nhạt) → vì sao → lời mời thử lại. Luôn hiện đủ 6 trường invariant
 * (location, original, issue, suggestion, example, retry_prompt); hành động phụ
 * (gắn cờ, lưu cụm từ) nằm ở chân thẻ.
 */
export function ObservationCard({
  obs,
  index,
  feedbackId,
  sourceRef,
  locallyFlagged = false,
  onFlagged,
  originalLabel = "Câu bạn đã viết",
}: ObservationCardProps) {
  const isFlagged = locallyFlagged || Boolean(obs.flagged);

  return (
    <article className={cn("rounded-2xl border bg-surface p-5 sm:p-6", isFlagged ? "border-amber-300" : "border-border")}>
      <header className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <span
          aria-label={`Góp ý số ${index + 1}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-base font-semibold tabular-nums text-primary-dark"
        >
          {index + 1}
        </span>
        <Badge tone="neutral">{feedbackCategoryLabel(obs.category)}</Badge>
        <span className="min-w-0 break-words text-base font-medium text-text-secondary">{obs.location}</span>
      </header>

      <div className="mt-4 grid items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-3">
        <div className="min-w-0 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3.5">
          <p className="eyebrow text-red-800">{originalLabel}</p>
          <blockquote className="mt-1.5 break-words text-base leading-relaxed text-text">
            &ldquo;{obs.original}&rdquo;
          </blockquote>
        </div>

        <div aria-hidden="true" className="flex items-center justify-center text-text-muted">
          <Icon name="arrow-right" className="h-5 w-5 rotate-90 md:rotate-0" />
        </div>

        <div className="min-w-0 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
          <p className="eyebrow text-emerald-800">Cách sửa</p>
          <p className="mt-1.5 break-words text-base leading-relaxed text-text">{obs.suggestion}</p>
          {obs.example ? (
            <>
              <p className="eyebrow mt-3 text-emerald-800">Câu mẫu</p>
              <p className="mt-1.5 break-words text-base font-medium leading-relaxed text-text">
                &ldquo;{obs.example}&rdquo;
              </p>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        <span className="font-semibold text-text">Vì sao cần sửa: </span>
        {obs.issue}
      </p>

      {obs.retry_prompt ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary-soft px-4 py-3.5">
          <Icon name="refresh" className="mt-0.5 h-5 w-5 shrink-0 text-primary-dark" />
          <p className="min-w-0 text-base leading-relaxed text-text">
            <span className="font-semibold text-primary-dark">Thử lại: </span>
            {obs.retry_prompt}
          </p>
        </div>
      ) : null}

      {feedbackId || obs.example ? (
        <footer className="-mb-2 mt-4 flex flex-wrap items-center justify-between gap-x-1 border-t border-border pt-2 sm:justify-end sm:gap-x-2">
          <FlagButton feedbackId={feedbackId} observationIndex={index} flagged={isFlagged} onFlagged={onFlagged} />
          {obs.example ? (
            <SavePhraseButton
              text={obs.example}
              sentence={obs.example}
              sourceRef={`${sourceRef || "Góp ý"} · ${obs.location} · câu mẫu đề xuất`}
              sourceType="feedback"
            />
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
