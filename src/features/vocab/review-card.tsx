"use client";

import type { ReviewVocabItem } from "@/contracts/vocabulary";
import { Spinner } from "@/components/ui";
import { formatMastery } from "./mastery";

export type ResponseMode = "text" | "voice";

interface ReviewCardProps {
  item: ReviewVocabItem;
  responseMode: ResponseMode;
  userText: string;
  submitting: boolean;
  onModeChange: (mode: ResponseMode) => void;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
}

const MODES: ReadonlyArray<{ value: ResponseMode; label: string }> = [
  { value: "text", label: "Gõ chữ" },
  { value: "voice", label: "Đọc chính tả" },
];

/** Thẻ thử thách micro-challenge: prompt + toggle Gõ chữ/Giọng nói + nộp. */
export function ReviewCard({
  item,
  responseMode,
  userText,
  submitting,
  onModeChange,
  onTextChange,
  onSubmit,
}: ReviewCardProps) {
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-8">
      <div className="space-y-1.5 border-b border-border pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow text-primary-dark">
            Thử thách Micro-challenge
          </span>
          <span className="inline-flex items-center rounded-lg bg-surface-subtle px-2.5 py-1 text-sm font-medium tabular-nums text-text-secondary">
            Mức nhớ {formatMastery(item.masteryLevel)}
          </span>
        </div>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h2 className="min-w-0 max-w-full break-words text-2xl font-semibold tracking-tight text-text sm:text-3xl">{item.phrase}</h2>
          {item.ipa && (
            <span className="min-w-0 max-w-full break-words font-mono text-base text-text-muted">{item.ipa}</span>
          )}
        </div>
        {item.contextMeaning && (
          <p className="text-base leading-relaxed text-text-secondary">
            Nghĩa ngữ cảnh: {item.contextMeaning}
          </p>
        )}
      </div>

      {/* Ngữ cảnh gốc */}
      {item.originalSentence && (
        <div className="rounded-xl bg-surface-muted p-4 text-base leading-relaxed">
          <span className="eyebrow mb-1 block">Câu gốc đã lưu</span>
          <p className="text-text">
            &quot;{item.originalSentence}&quot;
          </p>
        </div>
      )}

      {/* Đề bài thử thách */}
      <div className="space-y-1 text-base leading-relaxed text-text">
        <div className="font-semibold text-primary-dark">
          Yêu cầu thử thách:
        </div>
        <p className="leading-relaxed">
          Dùng cụm từ <strong className="underline decoration-primary/50 underline-offset-4">{item.phrase}</strong> trong
          1 câu tiếng Anh về bối cảnh công việc thực tế (khám bệnh, trao đổi ca
          bệnh, hoặc hội nghị chuyên môn).
        </p>
      </div>

      {/* Form nhập câu trả lời */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-base">
          <span className="font-semibold text-text">Câu trả lời của bạn:</span>
          <div className="inline-flex items-center gap-1 rounded-xl bg-surface-subtle p-1">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                disabled={submitting}
                aria-pressed={responseMode === mode.value}
                onClick={() => onModeChange(mode.value)}
                className={`pressable min-h-11 cursor-pointer rounded-lg px-3 text-base font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                  responseMode === mode.value
                    ? "bg-surface text-primary-dark shadow-card ring-1 ring-inset ring-border"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id={`review-response-${item.id}`}
          aria-label="Câu trả lời của bạn"
          disabled={submitting}
          value={userText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`Ví dụ: The patient presented with ${item.phrase} following acute trauma...`}
          rows={3}
          className="field-control min-h-32 resize-y font-sans"
        />

        {responseMode === "voice" && (
          <p className="text-base leading-relaxed text-text-secondary">
            Mẹo: Bạn có thể dùng tính năng đọc chính tả (Dictation / Mic)
            tích hợp sẵn trên bàn phím điện thoại để nói trực tiếp vào ô văn
            bản trên.
          </p>
        )}

        <button
          onClick={onSubmit}
          disabled={submitting || !userText.trim()}
          className="pressable flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white shadow-card hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Spinner size="sm" label="Đang chấm" /> Gemini đang nhận xét
              cách dùng từ...
            </>
          ) : (
            <>
              Gửi câu trả lời để chấm
            </>
          )}
        </button>
      </div>
    </div>
  );
}
