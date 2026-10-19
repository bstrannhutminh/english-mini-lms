"use client";

import Link from "next/link";
import type { DeckFilterMode } from "./use-flashcard-deck";

interface DeckTopBarProps {
  currentIndex: number;
  total: number;
  filterMode: DeckFilterMode;
  onModeChange: (mode: DeckFilterMode) => void;
  onFinishEarly: () => void;
}

/** Thanh trên của màn flashcard: quay lại, đếm thẻ, toggle chế độ, nút kết thúc. */
export function DeckTopBar({
  currentIndex,
  total,
  filterMode,
  onModeChange,
  onFinishEarly,
}: DeckTopBarProps) {
  const progressPercent = Math.round((currentIndex / total) * 100);

  return (
    <div className="flex-none space-y-2 mb-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/vocab"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
            title="Quay lại Sổ từ vựng"
            aria-label="Quay lại Sổ từ vựng"
          >
            ←
          </Link>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <span>🃏</span>
            <span>
              Thẻ {currentIndex + 1} / {total}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Chế độ Đến hạn / Ôn tự do */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              onClick={() => onModeChange("due")}
              className={`px-2 py-1 rounded-md transition ${
                filterMode === "due"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Đến hạn
            </button>
            <button
              onClick={() => onModeChange("all")}
              className={`px-2 py-1 rounded-md transition ${
                filterMode === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ôn tự do
            </button>
          </div>

          {/* Nút Kết thúc & Lưu sớm */}
          <button
            onClick={onFinishEarly}
            className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition min-h-[36px]"
            title="Kết thúc phiên và lưu kết quả hiện tại"
          >
            Kết thúc
          </button>
        </div>
      </div>

      {/* Thanh tiến độ */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
