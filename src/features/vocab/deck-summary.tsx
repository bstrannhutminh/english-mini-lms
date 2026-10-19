"use client";

import Link from "next/link";
import type { HistoryItem } from "./use-flashcard-deck";

interface DeckSummaryProps {
  history: HistoryItem[];
  onReviewIncorrectOnly: () => void;
  onSpeak: (phrase: string) => void;
}

/** Màn tổng kết sau khi hết bộ thẻ (kết quả đã lưu SRS). */
export function DeckSummary({
  history,
  onReviewIncorrectOnly,
  onSpeak,
}: DeckSummaryProps) {
  const knowCount = history.filter((h) => h.result === "know").length;
  const dontKnowCount = history.length - knowCount;
  const unmasteredList = history.filter((h) => h.result === "dont_know");

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] animate-fade-in">
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Hoàn thành bộ thẻ!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kết quả đã được cập nhật vào thuật toán lặp lại ngắt quãng (Spaced Repetition).
        </p>

        {/* Chỉ số kết quả */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Đã thuộc ✓
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-1">
              {knowCount}
            </span>
            <span className="text-[11px] text-emerald-700 mt-0.5">
              Tăng khoảng cách ôn
            </span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Chưa thuộc ✗
            </span>
            <span className="text-3xl font-black text-rose-600 mt-1">
              {dontKnowCount}
            </span>
            <span className="text-[11px] text-rose-700 mt-0.5">
              Ôn lại vào ngày mai
            </span>
          </div>
        </div>

        {/* Danh sách các từ chưa thuộc */}
        {unmasteredList.length > 0 && (
          <div className="text-left mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📝</span> Các từ cần củng cố ({unmasteredList.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {unmasteredList.map(({ item }) => (
                <div
                  key={item.id}
                  className="pt-2 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{item.phrase}</span>
                      {item.ipa && (
                        <span className="text-xs font-mono text-slate-400 font-normal">
                          {item.ipa}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {item.contextMeaning || "Chưa có nghĩa ngữ cảnh"}
                    </p>
                  </div>
                  <button
                    onClick={() => onSpeak(item.phrase)}
                    className="p-1 text-slate-400 hover:text-blue-600 text-xs transition"
                    title="Nghe phát âm"
                    aria-label="Phát âm"
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hành động chuyển hướng */}
        <div className="space-y-2.5">
          {unmasteredList.length > 0 && (
            <button
              onClick={onReviewIncorrectOnly}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔁</span> Ôn lại {unmasteredList.length} từ chưa thuộc
            </button>
          )}

          <Link
            href="/vocab/review"
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <span>💡</span> Luyện sâu qua Micro-challenge (AI chấm)
          </Link>

          <div className="flex gap-2 pt-1">
            <Link
              href="/vocab"
              className="flex-1 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-center text-xs transition"
            >
              📚 Sổ từ vựng
            </Link>
            <Link
              href="/today"
              className="flex-1 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-center text-xs transition"
            >
              🏠 Trang chủ hôm nay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeckSaveFailedProps {
  batchCount: number;
  saving: boolean;
  onRetry: () => void;
  onAbandon: () => void;
}

/** Màn lỗi khi lưu batch thất bại — có nút thử lại và đường thoát có xác nhận. */
export function DeckSaveFailed({
  batchCount,
  saving,
  onRetry,
  onAbandon,
}: DeckSaveFailedProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] animate-fade-in">
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-200 text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <h2 className="text-2xl font-black text-rose-700 tracking-tight">
          Lưu kết quả thất bại
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Không thể lưu kết quả {batchCount} từ vừa ôn tập vào hệ thống (có thể
          do lỗi kết nối mạng). Hãy kiểm tra mạng và bấm Thử lại.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onRetry}
            disabled={saving}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Đang thử lại..." : "🔄 Thử lại ngay"}
          </button>
          <button
            onClick={onAbandon}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
          >
            Bỏ qua và quay về Kho từ vựng
          </button>
        </div>
      </div>
    </div>
  );
}
