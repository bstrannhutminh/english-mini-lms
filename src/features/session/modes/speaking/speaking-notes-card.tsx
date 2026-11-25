"use client";

/** Ô ghi chú/dàn ý của Speaking — cũng là đường nộp text-only hợp lệ. */
export function SpeakingNotesCard({
  value,
  disabled,
  showTextOnlyHint,
  onChange,
}: {
  value: string;
  disabled: boolean;
  showTextOnlyHint: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6 lg:mt-5">
      <p className="eyebrow">Tuỳ chọn</p>
      <label htmlFor="speaking-notes" className="text-lg font-semibold text-text">
        Ghi chú dàn ý nói
      </label>
      <textarea
        id="speaking-notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="Ghi nhanh vài từ khoá dự kiến nói..."
        rows={3}
        className="mt-3 box-border w-full resize-y rounded-xl border border-border-strong bg-surface p-4 text-base leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      />
      {showTextOnlyHint && (
        <p className="mt-2 text-sm leading-5 text-text-muted">
          Khi không tiện ghi âm, bạn vẫn có thể nộp nội dung gõ tay — AI sẽ
          góp ý từ vựng & cấu trúc và ghi nhận phát âm là &ldquo;chưa đánh giá
          được&rdquo;.
        </p>
      )}
    </section>
  );
}
