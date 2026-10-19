"use client";

import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { SessionColumns } from "../../shell/session-columns";
import { WritingParentReference } from "./parent-reference";
import type { WritingModeState } from "./state";

/**
 * Vùng làm bài của mode Viết (không chrome): cột trái = đề bài + đối chiếu
 * Bản 1, cột phải = khung soạn email. Timer/nút nộp/gợi ý/lưu do shell lo.
 */
export function WritingPanel(props: ModePanelProps) {
  const { data, busy, capture } = props;
  const { state, setState } = usePluginState<WritingModeState>(props);
  const { activity, parentData } = data;

  const wordCount = state.text.trim()
    ? state.text.trim().split(/\s+/).length
    : 0;

  const setText = (text: string) =>
    setState((prev) => ({ ...prev, text }));
  const toggleParentRef = () =>
    setState((prev) => ({ ...prev, showParentRef: !prev.showParentRef }));

  const sourceRef = `Bài viết: ${activity.slot || activity.id}`;

  const left = (
    <>
      {/* Thông tin bài & đề bài */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
            {activity.slot || activity.id} · Viết thực tế
          </span>
        </div>

        <h2 className="mb-2.5 text-lg font-bold text-slate-900">
          {activity.title}
        </h2>

        {activity.objective && (
          <p className="mb-2.5 text-sm leading-snug text-slate-600">
            <strong>Mục tiêu:</strong> {activity.objective}
          </p>
        )}

        {activity.promptText && (
          <div
            {...capture.selectHandlers(activity.promptText, sourceRef)}
            className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700"
          >
            {activity.promptText}
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
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor="essay-editor"
          className="text-[15px] font-semibold text-slate-900"
        >
          Bài viết của bạn:
        </label>
        <span
          className={`text-[13px] font-semibold ${
            wordCount >= 120 && wordCount <= 150
              ? "text-green-600"
              : "text-slate-500"
          }`}
        >
          {wordCount} từ (khuyến nghị: 120–150)
        </span>
      </div>

      <textarea
        id="essay-editor"
        value={state.text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
        placeholder="Viết email của bạn tại đây bằng tiếng Anh..."
        rows={12}
        className="box-border w-full resize-y rounded-xl border border-slate-300 p-3.5 text-base leading-relaxed text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />
    </div>
  );

  return <SessionColumns left={left} right={right} />;
}
