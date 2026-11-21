"use client";

import { useRef, useState, type ReactNode } from "react";
import { Icon, SegmentedControl, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useSessionHintSlot } from "./session-hint-slot";

type Pane = "prompt" | "reference" | "answer";

interface SessionColumnsProps {
  /** Đề bài / nguồn (cột trái ở desktop). */
  left: ReactNode;
  /** Vùng làm bài (cột phải ở desktop). */
  right: ReactNode;
  /** Bản trước + góp ý ưu tiên của phiên sửa lại — tab riêng trên mobile, đầu cột trái ở desktop. */
  reference?: ReactNode;
  /** "tabs": mobile chuyển Đề bài ⇄ Bài làm; "stack": xếp chồng (nghe — trình phát luôn hiện). */
  mobileLayout?: "tabs" | "stack";
  promptLabel?: string;
  answerLabel?: string;
  referenceLabel?: string;
  promptIcon?: IconName;
  answerIcon?: IconName;
  /** Chấm trạng thái nhỏ cạnh nhãn tab bài làm (vd. đang ghi âm). */
  answerBadge?: ReactNode;
  /** Nhãn nút cuối đề bài chuyển sang tab làm bài (mobile). */
  startLabel?: string;
  /** Đã có nháp/bài làm hoặc là bản sửa → mở thẳng tab bài làm trên mobile. */
  startOnAnswer?: boolean;
}

const GRID = "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8";
/** Cột trái dính dưới header ở desktop và tự cuộn khi đề dài hơn màn hình. */
const STICKY_LEFT =
  "lg:sticky lg:top-[calc(var(--studio-header)+1.5rem)] lg:-mx-2 lg:max-h-[calc(100dvh-var(--studio-header)-var(--studio-action)-2.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:px-2 lg:pb-3 lg:[scrollbar-width:thin]";

/**
 * Bố cục 2 vùng của màn Học. Desktop: hai cột cạnh nhau, cột đề bài dính.
 * Mobile "tabs": công tắc dính ngay dưới header; CẢ HAI vùng luôn được mount
 * (ẩn bằng CSS) nên nội dung đang gõ, trạng thái ghi âm và vị trí cuộn của
 * từng tab được giữ nguyên. Mobile "stack": xếp chồng, con trực tiếp của
 * `left` trở thành phần tử của cột chung (display: contents) để panel tự đặt
 * thứ tự/sticky (vd. trình phát bài nghe).
 */
export function SessionColumns({
  left, right, reference, mobileLayout = "tabs",
  promptLabel = "Đề bài", answerLabel = "Bài làm", referenceLabel = "Góp ý bản trước",
  promptIcon = "file-text", answerIcon = "pen", answerBadge,
  startLabel = "Bắt đầu làm bài", startOnAnswer = false,
}: SessionColumnsProps) {
  const hint = useSessionHintSlot();
  const [pane, setPane] = useState<Pane>(startOnAnswer ? "answer" : "prompt");
  const scrollByPane = useRef<Record<Pane, number>>({ prompt: 0, reference: 0, answer: 0 });

  /** Mỗi tab nhớ vị trí cuộn riêng để quay lại đúng đoạn đang đọc. */
  function switchPane(next: Pane, toTop = false) {
    if (next === pane) return;
    scrollByPane.current[pane] = window.scrollY;
    setPane(next);
    const top = toTop ? 0 : scrollByPane.current[next];
    requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" }));
  }

  if (mobileLayout === "stack") {
    return (
      <>
        {hint}
        <div className={cn("flex flex-col gap-4 pt-4 lg:pt-0", GRID)}>
          <div className={cn("contents min-w-0 lg:block", STICKY_LEFT)}>{left}</div>
          <div className="order-3 min-w-0 lg:order-none">{right}</div>
        </div>
      </>
    );
  }

  const compact = Boolean(reference);
  const tabLabel = (text: string, icon: IconName, badge?: ReactNode) => (
    <>
      {!compact && <Icon name={icon} className="h-4 w-4 max-[359px]:hidden" />}
      <span className="min-w-0 truncate">{text}</span>
      {badge}
    </>
  );
  const options = [
    { value: "prompt" as const, label: tabLabel(promptLabel, promptIcon) },
    ...(reference ? [{ value: "reference" as const, label: tabLabel(referenceLabel, "flag") }] : []),
    { value: "answer" as const, label: tabLabel(answerLabel, answerIcon, answerBadge) },
  ];

  return (
    <>
      <div className="sticky top-(--studio-header) z-20 -mx-4 mb-3 border-b border-border/70 bg-surface-muted/95 px-4 py-1.5 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <SegmentedControl
          fullWidth
          ariaLabel="Chuyển giữa đề bài và bài làm"
          options={options}
          value={pane}
          onChange={(next) => switchPane(next)}
          className={cn("[&>button]:min-w-0", compact && "[&>button]:px-2")}
        />
      </div>

      {hint}

      <div className={GRID}>
        <div className={cn("min-w-0", pane === "answer" && "hidden lg:block", STICKY_LEFT)}>
          {reference && (
            <div className={pane === "reference" ? "block" : "hidden lg:block"}>{reference}</div>
          )}
          <div className={pane === "prompt" ? "block" : "hidden lg:block"}>
            {left}
            <button
              type="button"
              onClick={() => switchPane("answer", true)}
              className="pressable mt-4 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-teal-200 bg-primary-soft px-5 text-base font-semibold text-primary-dark hover:bg-teal-100 lg:hidden"
            >
              {startLabel}
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className={cn("min-w-0", pane === "answer" ? "block" : "hidden lg:block")}>{right}</div>
      </div>
    </>
  );
}
