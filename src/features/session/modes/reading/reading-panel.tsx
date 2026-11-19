"use client";

import { EmptyState, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { SessionColumns } from "../../shell/session-columns";
import { PassageCard } from "./passage-card";
import { ReadingParentReference } from "./parent-reference";
import type { ReadingModeState } from "./state";

const textareaClass =
  "box-border w-full resize-y rounded-xl border border-border bg-surface p-3.5 text-base leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

function StepNumber({ num, done }: { num: number; done: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
      )}
    >
      {done ? <Icon name="check" className="h-3.5 w-3.5" /> : num}
    </span>
  );
}

/**
 * Vùng làm bài mode Đọc–dịch y khoa:
 * cột trái = mục tiêu + đoạn văn gốc (Markdown + cỡ chữ + Smart Capture),
 * cột phải = 3 bước làm bài rõ ràng (Ý chính → Bản dịch bắt buộc → 3 thuật ngữ).
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
      <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-skill-reading-border bg-skill-reading-soft px-2 py-0.5 text-xs font-bold text-skill-reading">
            <Icon name="book-open" className="h-3.5 w-3.5" />
            Đọc–dịch y khoa
          </span>
          <span className="text-xs tabular-nums text-text-muted">
            Khuyến nghị {activity.durationMinutes || 25} phút
          </span>
        </div>

        <h2 className="mb-1.5 text-lg font-bold text-text">{activity.title}</h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          {activity.objective ||
            "Nêu ý chính, dịch sang tiếng Việt trung thành và tự giải thích 3 thuật ngữ y khoa."}
        </p>
      </div>

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
          description="Bài đọc này chưa gắn đoạn văn trong cơ sở dữ liệu. Hãy báo quản trị bổ sung source segment để AI đối chiếu chính xác."
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
      {/* Bước 1: Ý chính */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <label
          htmlFor="main-idea-input"
          className="mb-2 flex items-center gap-2 text-sm font-bold text-text"
        >
          <StepNumber num={1} done={state.mainIdea.trim().length > 0} />
          <span>Ý chính của đoạn (Main Idea)</span>
        </label>
        <textarea
          id="main-idea-input"
          value={state.mainIdea}
          onChange={(e) => set({ mainIdea: e.target.value })}
          disabled={busy}
          placeholder="Tóm tắt ý chính trong 1–2 câu bằng tiếng Việt hoặc tiếng Anh..."
          rows={3}
          className={textareaClass}
        />
      </div>

      {/* Bước 2: Bản dịch — bắt buộc */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between gap-2">
          <label
            htmlFor="translation-input"
            className="flex items-center gap-2 text-sm font-bold text-text"
          >
            <StepNumber num={2} done={translationWords > 0} />
            <span>
              Bản dịch tiếng Việt <span className="text-red-600">*</span>
            </span>
          </label>
          <span className="text-xs font-medium tabular-nums text-text-muted">
            {translationWords} từ
          </span>
        </div>
        <textarea
          id="translation-input"
          value={state.translation}
          onChange={(e) => set({ translation: e.target.value })}
          disabled={busy}
          placeholder="Dịch đoạn văn sang tiếng Việt sát nghĩa, chuẩn văn phong y khoa..."
          rows={9}
          className={textareaClass}
        />
      </div>

      {/* Bước 3: Thuật ngữ */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <label
          htmlFor="key-terms-input"
          className="mb-2 flex items-center gap-2 text-sm font-bold text-text"
        >
          <StepNumber num={3} done={state.keyTerms.trim().length > 0} />
          <span>Ba thuật ngữ tự giải thích (Key Terms)</span>
        </label>
        <textarea
          id="key-terms-input"
          value={state.keyTerms}
          onChange={(e) => set({ keyTerms: e.target.value })}
          disabled={busy}
          placeholder={
            "Ví dụ:\n1. suprascapular nerve block: Phong bế thần kinh trên vai...\n2. fascial compartment: Khoang cân mạc..."
          }
          rows={4}
          className={textareaClass}
        />
      </div>
    </div>
  );

  return <SessionColumns left={left} right={right} />;
}
