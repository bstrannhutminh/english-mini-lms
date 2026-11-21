"use client";

import { Badge, EmptyState, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ModePanelProps } from "../types";
import { usePluginState } from "../types";
import { SessionColumns } from "../../shell/session-columns";
import { SessionBriefCard } from "../../shared/session-brief-card";
import { PassageCard } from "./passage-card";
import { ReadingParentReference } from "./parent-reference";
import type { ReadingModeState } from "./state";

const textareaClass =
  "box-border w-full resize-y rounded-xl border border-border-strong bg-surface p-4 text-base leading-relaxed text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";
const stepClass = "mt-5 border-t border-border pt-5";

function StepNumber({ num, done }: { num: number; done: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
        done ? "bg-emerald-600 text-white" : "bg-surface-subtle text-text-secondary"
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
 * Mobile: hai tab "Đoạn gốc" ⇄ "Bài dịch", cả hai luôn được mount.
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
      <SessionBriefCard
        eyebrow="Đề bài · Đọc–dịch y khoa"
        title="Đọc và diễn đạt lại"
        durationMinutes={activity.durationMinutes || 25}
        objective={
          activity.objective ||
          "Nêu ý chính, dịch sang tiếng Việt trung thành và tự giải thích 3 thuật ngữ y khoa."
        }
      />

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
          className="mt-4"
        />
      )}
    </>
  );

  const reference = parentData ? (
    <ReadingParentReference
      parentData={parentData}
      open={state.showParentRef}
      onToggle={() => set({ showParentRef: !state.showParentRef })}
      capture={capture}
      sourceRef={sourceRef}
    />
  ) : undefined;

  const right = (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <p className="eyebrow">Bài làm</p>
      <h2 className="text-lg font-semibold text-text">Bản đọc–dịch của bạn</h2>

      {/* Bước 1: Ý chính */}
      <div className={stepClass}>
        <label
          htmlFor="main-idea-input"
          className="mb-2 flex items-center gap-2.5 text-base font-semibold text-text"
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
      <div className={stepClass}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="translation-input"
            className="flex items-center gap-2.5 text-base font-semibold text-text"
          >
            <StepNumber num={2} done={translationWords > 0} />
            <span>
              Bản dịch tiếng Việt <span className="text-red-600">*</span>
            </span>
          </label>
          <span className="flex items-center gap-2">
            {translationWords === 0 && <Badge tone="warning">Bắt buộc</Badge>}
            <span className="text-sm font-medium tabular-nums text-text-muted">
              {translationWords} từ
            </span>
          </span>
        </div>
        <textarea
          id="translation-input"
          value={state.translation}
          onChange={(e) => set({ translation: e.target.value })}
          disabled={busy}
          placeholder="Dịch đoạn văn sang tiếng Việt sát nghĩa, chuẩn văn phong y khoa..."
          rows={9}
          className={cn(textareaClass, "min-h-[36dvh] lg:min-h-64")}
        />
      </div>

      {/* Bước 3: Thuật ngữ */}
      <div className={stepClass}>
        <label
          htmlFor="key-terms-input"
          className="mb-2 flex items-center gap-2.5 text-base font-semibold text-text"
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
    </section>
  );

  return (
    <SessionColumns
      left={left}
      right={right}
      reference={reference}
      referenceLabel={parentData ? `Góp ý bản ${parentData.submission.revision}` : undefined}
      promptLabel="Đoạn gốc"
      answerLabel="Bài dịch"
      promptIcon="book-open"
      startLabel="Bắt đầu dịch"
      startOnAnswer={Boolean(data.initialDraft || data.parentId)}
    />
  );
}
