"use client";

import { AutoResizeTextarea, MarkdownText } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { SessionColumns } from "../../shell/session-columns";
import { PROMPT_TEXT_CLASS, SessionBriefCard } from "../../shared/session-brief-card";
import { WritingParentReference } from "./parent-reference";
import type { WritingModeState } from "./state";
import { resolveWordTarget } from "./word-target";

/**
 * Vùng làm bài của mode Viết: cột trái = đề bài (+ đối chiếu Bản 1 khi sửa lại),
 * cột phải = khung viết cao, thoáng với tiến độ số từ theo đề. Trên mobile hai
 * vùng là hai tab (đề bài ⇄ bài làm) — khung viết luôn được mount.
 */
export function WritingPanel(props: ModePanelProps) {
  const { data, busy, capture } = props;
  const { state, setState } = usePluginState<WritingModeState>(props);
  const { activity, parentData } = data;

  const wordCount = state.text.trim()
    ? state.text.trim().split(/\s+/).length
    : 0;

  const target = resolveWordTarget(activity.promptText);
  const inRange = target && wordCount >= target.min && (target.max === null || wordCount <= target.max);
  const aboveRange = target?.max != null && wordCount > target.max;
  const progressPct = target ? Math.min(100, Math.round((wordCount / (target.max ?? target.min)) * 100)) : 0;
  const targetLabel = target ? (target.max === null ? `ít nhất ${target.min}` : `${target.min}–${target.max}`) : "";
  const countNote = !target
    ? null
    : inRange
      ? "Đã đạt độ dài theo đề."
      : aboveRange && target.max != null
        ? `Vượt ${wordCount - target.max} từ so với đề — cân nhắc lược bớt.`
        : wordCount === 0
          ? `Theo đề: ${targetLabel} từ.`
          : `Còn ${target.min - wordCount} từ nữa để đạt mức tối thiểu theo đề.`;

  const setText = (text: string) => setState((prev) => ({ ...prev, text }));
  const toggleParentRef = () =>
    setState((prev) => ({ ...prev, showParentRef: !prev.showParentRef }));

  const sourceRef = `${activity.title} · ${activity.slot || activity.id}`;

  const left = (
    <SessionBriefCard
      eyebrow="Đề bài · Viết thực tế"
      title="Yêu cầu bài viết"
      durationMinutes={activity.durationMinutes}
      objective={activity.objective}
    >
      {activity.promptText && (
        <div
          {...capture.selectHandlers(activity.promptText, sourceRef, "text")}
          className={PROMPT_TEXT_CLASS}
        >
          <MarkdownText text={activity.promptText} />
        </div>
      )}
    </SessionBriefCard>
  );

  const reference = parentData ? (
    <WritingParentReference
      parentData={parentData}
      open={state.showParentRef}
      onToggle={toggleParentRef}
      capture={capture}
      sourceRef={sourceRef}
    />
  ) : undefined;

  const right = (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <p className="eyebrow">Bài làm</p>
          <label htmlFor="essay-editor" className="text-lg font-semibold text-text">
            Bài viết của bạn
          </label>
        </div>
        <p
          className={cn(
            "text-base font-semibold tabular-nums",
            inRange ? "text-emerald-700" : aboveRange ? "text-amber-800" : "text-text",
          )}
        >
          {wordCount}
          <span className="font-normal text-text-muted">{target ? ` / ${targetLabel} từ` : " từ"}</span>
        </p>
      </div>

      {/* Tiến độ số từ theo đề (chỉ hiện khi đề nêu rõ số từ) */}
      {target && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle" aria-hidden="true">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-200",
              inRange ? "bg-emerald-500" : aboveRange ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
      {countNote && <p className="mt-2 text-sm text-text-secondary">{countNote}</p>}

      <AutoResizeTextarea
        id="essay-editor"
        value={state.text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
        placeholder="Viết bài của bạn tại đây bằng tiếng Anh..."
        rows={12}
        className="mt-3 box-border min-h-[45dvh] w-full rounded-xl border border-border-strong bg-surface p-4 text-base leading-7 text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 lg:min-h-[max(24rem,calc(100dvh-27rem))]"
      />
      <p className="mt-2 text-sm leading-5 text-text-muted">
        {data.parentId
          ? "Đây là bản trước của bạn — sửa trực tiếp theo góp ý. Bản mới được lưu riêng, bản cũ giữ nguyên."
          : "Viết bản đầu bằng lời của bạn. Bạn có thể đối chiếu đề và chỉnh sửa sau khi nhận góp ý."}
      </p>
    </section>
  );

  return (
    <SessionColumns
      left={left}
      right={right}
      reference={reference}
      referenceLabel={parentData ? `Góp ý bản ${parentData.submission.revision}` : undefined}
      startOnAnswer={Boolean(data.initialDraft || data.parentId)}
    />
  );
}
