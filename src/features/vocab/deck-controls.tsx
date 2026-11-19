"use client";

interface DeckControlsProps {
  canUndo: boolean;
  disabled: boolean;
  onDontKnow: () => void;
  onUndo: () => void;
  onFlip: () => void;
  onKnow: () => void;
}

/** Hàng nút dưới thẻ: ✗ Chưa thuộc · Undo · Lật · ✓ Đã thuộc (+ gợi ý phím). */
export function DeckControls({
  canUndo,
  disabled,
  onDontKnow,
  onUndo,
  onFlip,
  onKnow,
}: DeckControlsProps) {
  return (
    <div className="flex-none pt-1 pb-1">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* ✗ Chưa thuộc (Vuốt trái) */}
        <button
          type="button"
          onClick={onDontKnow}
          disabled={disabled}
          className="flex-1 max-w-[130px] h-14 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-700 rounded-2xl flex flex-col items-center justify-center transition transform active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
          title="Chưa thuộc [Phím ← hoặc A]"
        >
          <span className="text-lg font-black leading-none">✗</span>
          <span className="text-[10px] font-bold mt-1">Chưa thuộc (←)</span>
        </button>

        {/* Hoàn tác */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl flex flex-col items-center justify-center transition transform active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Hoàn tác thẻ trước [Phím Z]"
          aria-label="Hoàn tác thẻ trước"
        >
          <span className="text-base leading-none">↩️</span>
          <span className="text-[9px] font-semibold text-slate-500 mt-0.5">Undo</span>
        </button>

        {/* Lật thẻ */}
        <button
          type="button"
          onClick={onFlip}
          disabled={disabled}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex flex-col items-center justify-center transition transform active:scale-90 disabled:opacity-30 cursor-pointer"
          title="Lật thẻ [Phím Space]"
          aria-label="Lật thẻ"
        >
          <span className="text-base leading-none">🔄</span>
          <span className="text-[9px] font-semibold text-slate-500 mt-0.5">Lật</span>
        </button>

        {/* ✓ Đã thuộc (Vuốt phải) */}
        <button
          type="button"
          onClick={onKnow}
          disabled={disabled}
          className="flex-1 max-w-[130px] h-14 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-700 rounded-2xl flex flex-col items-center justify-center transition transform active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
          title="Đã thuộc [Phím → hoặc D]"
        >
          <span className="text-lg font-black leading-none">✓</span>
          <span className="text-[10px] font-bold mt-1">Đã thuộc (→)</span>
        </button>
      </div>

      {/* Hướng dẫn phím tắt mờ trên Desktop */}
      <div className="hidden sm:flex justify-center items-center gap-4 text-[11px] text-slate-400 mt-2">
        <span>[← / A] Chưa thuộc</span>
        <span>•</span>
        <span>[Space] Lật thẻ</span>
        <span>•</span>
        <span>[Z] Hoàn tác</span>
        <span>•</span>
        <span>[→ / D] Đã thuộc</span>
      </div>
    </div>
  );
}
