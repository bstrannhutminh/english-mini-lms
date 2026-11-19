"use client";

import type { FlashcardDeckItem } from "./api";
import { formatMastery } from "./mastery";

interface FlashcardProps {
  item: FlashcardDeckItem;
  isFlipped: boolean;
  dragOffset: { x: number; y: number };
  isDragging: boolean;
  flyDirection: "left" | "right" | null;
  /** Có thẻ tiếp theo để render lớp nền "xếp chồng". */
  hasNext: boolean;
  onSpeak: (phrase: string, e?: React.MouseEvent) => void;
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
  };
}

/**
 * Thẻ flashcard tương tác: kéo ngang để quyết định (phải = thuộc,
 * trái = chưa thuộc), chạm để lật mặt trước/sau. Toàn bộ cử chỉ và
 * trạng thái được truyền từ useFlashcardDeck — component này chỉ render.
 */
export function Flashcard({
  item,
  isFlipped,
  dragOffset,
  isDragging,
  flyDirection,
  hasNext,
  onSpeak,
  handlers,
}: FlashcardProps) {
  // Độ xoay + độ mờ badge theo khoảng kéo
  const dragRotation = dragOffset.x * 0.08;
  const knowBadgeOpacity = Math.min(1, Math.max(0, dragOffset.x / 70));
  const dontKnowBadgeOpacity = Math.min(1, Math.max(0, -dragOffset.x / 70));

  // Viền thẻ đổi màu nhẹ khi quẹt
  let cardBorderColor = "rgba(226, 232, 240, 1)"; // slate-200
  if (dragOffset.x > 30) {
    cardBorderColor = "rgba(16, 185, 129, 0.8)"; // emerald-500
  } else if (dragOffset.x < -30) {
    cardBorderColor = "rgba(244, 63, 94, 0.8)"; // rose-500
  }

  return (
    <div className="flex-1 flex items-center justify-center relative my-1 min-h-[360px] max-h-[70vh]">
      {/* Thẻ phụ phía dưới tạo hiệu ứng xếp lớp 3D */}
      {hasNext && (
        <div
          className="absolute inset-x-2 sm:inset-x-4 top-4 bottom-0 bg-white rounded-3xl border border-slate-200/80 shadow-md opacity-40 pointer-events-none transform scale-95 translate-y-2 z-0"
          aria-hidden="true"
        />
      )}

      {/* THẺ CHÍNH — giữ nguyên touch/pointer handlers từ bản cũ */}
      <div
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerCancel}
        style={{
          transform: flyDirection
            ? `translateX(${flyDirection === "right" ? "120%" : "-120%"}) rotate(${
                flyDirection === "right" ? "25deg" : "-25deg"
              })`
            : `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragRotation}deg)`,
          borderColor: cardBorderColor,
          transition: isDragging
            ? "none"
            : "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s ease",
          touchAction: "pan-y",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        className="relative z-10 w-full h-full max-h-[520px] rounded-3xl bg-white shadow-xl border-2 p-5 sm:p-6 flex flex-col justify-between overflow-hidden"
      >
        {/* OVERLAY BADGE KHI QUẸT PHẢI (ĐÃ THUỘC) */}
        <div
          style={{ opacity: knowBadgeOpacity }}
          className="absolute top-5 left-5 pointer-events-none z-30 transition-opacity bg-emerald-600 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full border-2 border-white shadow-md tracking-wider transform -rotate-12"
        >
          ✓ ĐÃ THUỘC
        </div>

        {/* OVERLAY BADGE KHI QUẸT TRÁI (CHƯA THUỘC) */}
        <div
          style={{ opacity: dontKnowBadgeOpacity }}
          className="absolute top-5 right-5 pointer-events-none z-30 transition-opacity bg-rose-600 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full border-2 border-white shadow-md tracking-wider transform rotate-12"
        >
          ✗ CHƯA THUỘC
        </div>

        {/* 3D FLIP CONTAINER */}
        <div className="w-full h-full relative" style={{ perspective: "1000px" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* ── MẶT TRƯỚC: PHRASE + IPA + NÚT LOA ── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
              className="flex flex-col justify-between items-center text-center p-1"
            >
              <div className="w-full flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  Mức nhớ {formatMastery(item.masteryLevel)}
                </span>
                {item.sourceRef && (
                  <span className="text-[11px] font-medium truncate max-w-[150px] text-slate-400">
                    {item.sourceRef}
                  </span>
                )}
              </div>

              <div className="my-auto py-4 flex flex-col items-center space-y-4">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug px-2">
                  {item.phrase}
                </h3>

                {item.ipa && (
                  <span className="text-sm sm:text-base font-mono font-medium text-slate-500 bg-slate-100/70 px-3 py-1 rounded-lg">
                    {item.ipa}
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => onSpeak(item.phrase, e)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="mt-2 w-12 h-12 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xl transition transform active:scale-95 shadow-xs cursor-pointer"
                  title="Nghe phát âm chuẩn (US)"
                  aria-label="Phát âm từ"
                >
                  🔊
                </button>
              </div>

              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 bg-slate-50/80 px-3 py-1 rounded-full">
                <span>🔄</span> Chạm thẻ để xem nghĩa & câu gốc
              </div>
            </div>

            {/* ── MẶT SAU: CONTEXT MEANING + ORIGINAL SENTENCE ── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              className="flex flex-col justify-between text-left p-1 overflow-y-auto"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {item.phrase}
                    </span>
                    {item.ipa && (
                      <span className="text-[11px] font-mono text-slate-400 ml-1.5">
                        {item.ipa}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => onSpeak(item.phrase, e)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-1 text-slate-400 hover:text-blue-600 text-sm transition"
                    title="Nghe phát âm"
                    aria-label="Phát âm từ"
                  >
                    🔊
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Nghĩa trong ngữ cảnh
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 leading-snug">
                    {item.contextMeaning || "Chưa có định nghĩa ngữ cảnh"}
                  </p>
                </div>

                {item.originalSentence && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Câu gốc:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      &ldquo;{item.originalSentence}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 text-center text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                <span>🔄</span> Chạm để quay lại mặt từ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
