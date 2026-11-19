"use client";

import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { SessionColumns } from "../../shell/session-columns";
import { EmptyState } from "@/components/ui";
import { PassageCard } from "./passage-card";
import { ReadingParentReference } from "./parent-reference";
import type { ReadingModeState } from "./state";

const textareaClass =
  "box-border w-full resize-y rounded-xl border border-slate-300 p-3.5 text-base leading-relaxed text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60";

/**
 * Vùng làm bài mode Đọc–dịch (không chrome): cột trái = đề bài + đoạn văn
 * gốc + đối chiếu Bản 1, cột phải = 3 ô bài làm. Timer/nút nộp/gợi ý/lưu
 * nháp do shell lo. Không bao giờ hiện đoạn văn giả — thiếu segment thì
 * hiện EmptyState hướng dẫn bằng tiếng Việt.
 */
export function ReadingPanel(props: ModePanelProps) {
  const { data, busy, capture } = props;
  const { state, setState } = usePluginState<ReadingModeState>(props);
  const { activity, segment, parentData } = data;

  const set = (patch: Partial<ReadingModeState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const translationWords = state.translation.trim()
    ? state.translation.trim().split(/\s+/).length
    : 0;

  const sourceTitle = segment?.sourceTitle || activity.title;
  const sourceRef =
    segment?.page != null
      ? `${sourceTitle}, Trang ${segment.page}`
      : `Bài đọc: ${sourceTitle}`;

  const left = (
    <>
      {/* Thông tin bài & mục tiêu */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-skill-reading-soft px-2 py-0.5 text-xs font-bold text-skill-reading">
            {activity.slot || activity.id} · Đọc–dịch y khoa
          </span>
          <span className="text-xs text-slate-500">
            Mục tiêu: {activity.durationMinutes || 25} phút
          </span>
        </div>

        <h2 className="mb-1.5 text-lg font-bold text-slate-900">
          {activity.title}
        </h2>
        <p className="text-sm leading-snug text-slate-600">
          {activity.objective ||
            "Nêu ý chính, dịch sang tiếng Việt trung thành, giải thích 3 thuật ngữ."}
        </p>
      </div>

      {/* Đoạn văn gốc thật, hoặc trạng thái trống — không có nội dung giả */}
      {segment?.textContent ? (
        <PassageCard
          segment={segment}
          sourceRef={sourceRef}
          capture={capture}
        />
      ) : (
        <EmptyState
          icon="book-open"
          title="Chưa có đoạn văn gốc"
          description="Bài đọc này chưa được gắn đoạn văn trong cơ sở dữ liệu. Bạn vẫn có thể làm bài ở cột bên, nhưng hãy báo quản trị gắn source segment để AI đối chiếu đúng đoạn gốc."
          className="mb-4"
        />
      )}

      {parentData && (
        <ReadingParentReference
          parentData={parentData}
          open={state.showParentRef}
          onToggle={() => set({ showParentRef: !state.showParentRef })}
          capture={capture}
          sourceRef={sourceRef}
        />
      )}
    </>
  );

  const right = (
    <div className="flex flex-col gap-4">
      {/* Ô 1: Ý chính */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label
          htmlFor="main-idea-input"
          className="mb-1.5 block text-sm font-bold text-slate-800"
        >
          1. Ý chính của đoạn (Main Idea)
        </label>
        <textarea
          id="main-idea-input"
          value={state.mainIdea}
          onChange={(e) => set({ mainIdea: e.target.value })}
          disabled={busy}
          placeholder="Tóm tắt ý chính của đoạn văn (1-2 câu tiếng Việt hoặc tiếng Anh)..."
          rows={3}
          className={textareaClass}
        />
      </div>

      {/* Ô 2: Bản dịch — bắt buộc */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="translation-input"
            className="text-sm font-bold text-slate-800"
          >
            2. Bản dịch tiếng Việt (Translation){" "}
            <span className="text-red-600">*</span>
          </label>
          <span className="text-xs text-slate-500">{translationWords} từ</span>
        </div>
        <textarea
          id="translation-input"
          value={state.translation}
          onChange={(e) => set({ translation: e.target.value })}
          disabled={busy}
          placeholder="Dịch toàn bộ đoạn văn sang tiếng Việt chuẩn văn phong y khoa..."
          rows={9}
          className={textareaClass}
        />
      </div>

      {/* Ô 3: Thuật ngữ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label
          htmlFor="key-terms-input"
          className="mb-1.5 block text-sm font-bold text-slate-800"
        >
          3. Ba thuật ngữ tự giải thích (Key Terms)
        </label>
        <textarea
          id="key-terms-input"
          value={state.keyTerms}
          onChange={(e) => set({ keyTerms: e.target.value })}
          disabled={busy}
          placeholder={
            "Ví dụ:\n1. suprascapular nerve block: Phong bế thần kinh trên vai...\n2. superior transverse scapular ligament: Dây chằng ngang vai trên...\n3. fascial compartment: Khoang cân mạc..."
          }
          rows={4}
          className={textareaClass}
        />
      </div>
    </div>
  );

  return <SessionColumns left={left} right={right} />;
}
