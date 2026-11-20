"use client";

import { Icon, MarkdownText } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { SessionColumns } from "../../shell/session-columns";
import { WritingParentReference } from "./parent-reference";
import type { WritingModeState } from "./state";
import { resolveWordTarget } from "./word-target";

/**
 * Vùng làm bài của mode Viết: cột trái = đề bài + đối chiếu Bản 1,
 * cột phải = khung viết thoáng mắt với thanh tiến độ số từ khuyến nghị.
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

  const setText = (text: string) => setState((prev) => ({ ...prev, text }));
  const toggleParentRef = () =>
    setState((prev) => ({ ...prev, showParentRef: !prev.showParentRef }));

  const sourceRef = `${activity.title} · ${activity.slot || activity.id}`;

  const left = (
    <>
      <div className="mb-6 border-b border-border pb-6">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-skill-writing-border bg-skill-writing-soft px-2 py-0.5 text-base font-bold text-skill-writing">
            <Icon name="pen-tool" className="h-3.5 w-3.5" />
            Viết thực tế
          </span>
          {activity.durationMinutes && (
            <span className="text-base tabular-nums text-text-muted">
              Khuyến nghị {activity.durationMinutes} phút
            </span>
          )}
        </div>

        <h2 className="mb-2 text-lg font-bold text-text">{activity.title}</h2>

        {activity.objective && (
          <p className="mb-3 text-base leading-relaxed text-text-secondary">
            <strong className="text-text">Mục tiêu:</strong>{" "}
            {activity.objective}
          </p>
        )}

        {activity.promptText && (
          <div
            {...capture.selectHandlers(activity.promptText, sourceRef, "text")}
            className="max-w-prose text-base leading-relaxed text-text"
          >
            <MarkdownText text={activity.promptText} />
          </div>
        )}
      </div>

      {parentData && (
        <WritingParentReference
          parentData={parentData}
          open={state.showParentRef}
          onToggle={toggleParentRef}
          capture={capture}
          sourceRef={sourceRef}
        />
      )}
    </>
  );

  const right = (
    <div className="mb-4 rounded-xl border border-border bg-surface p-5 ">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="essay-editor"
          className="text-base font-bold text-text"
        >
          Bài viết của bạn
        </label>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-base font-semibold tabular-nums",
            inRange
              ? "bg-emerald-50 text-emerald-700"
              : aboveRange
                ? "bg-amber-50 text-amber-800"
                : "bg-slate-100 text-text-secondary"
          )}
        >
          {wordCount} từ{target ? ` (theo đề: ${target.max === null ? `ít nhất ${target.min}` : `${target.min}–${target.max}`})` : ""}
        </span>
      </div>

      {/* Thanh tiến độ số từ nhẹ nhàng */}
      {target && <div
        className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-200",
            inRange
              ? "bg-emerald-500"
              : aboveRange
                ? "bg-amber-500"
                : "bg-primary"
          )}
          style={{ width: `${progressPct}%` }}
        />
      </div>}

      <p className="mb-3 text-base text-text-secondary">Viết bản đầu bằng lời của bạn. Bạn có thể đối chiếu đề và chỉnh sửa sau khi nhận góp ý.</p>
      <textarea
        id="essay-editor"
        value={state.text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
        placeholder="Viết bài của bạn tại đây bằng tiếng Anh..."
        rows={16}
        className="box-border min-h-80 w-full resize-y rounded-lg border border-border-strong bg-surface p-4 text-base leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      />
    </div>
  );

  return <SessionColumns left={left} right={right} collapsible sourceLabel="Xem đề bài và yêu cầu" />;
}
