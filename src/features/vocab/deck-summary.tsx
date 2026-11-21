"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import type { HistoryItem } from "./use-flashcard-deck";

interface DeckSummaryProps {
  history: HistoryItem[];
  onReviewIncorrectOnly: () => void;
  onSpeak: (phrase: string) => void;
}

const SECONDARY_LINK = "pressable inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-3 text-center text-base font-medium text-text-secondary no-underline hover:bg-surface-subtle hover:text-text";

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
    <div className="mx-auto w-full max-w-md animate-fade-in py-2 sm:py-6">
      <div className="hero-wash w-full rounded-2xl border border-border p-5 text-center shadow-card sm:p-8">
        <span aria-hidden="true" className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon name="check-circle" className="h-7 w-7" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-text">
          Hoàn thành bộ thẻ!
        </h2>
        <p className="mt-1 text-base leading-relaxed text-text-secondary">
          Kết quả đã được cập nhật vào thuật toán lặp lại ngắt quãng (Spaced Repetition).
        </p>

        {/* Chỉ số kết quả */}
        <div className="my-6 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
              <Icon name="check" className="h-4 w-4" />Đã thuộc
            </span>
            <span className="mt-1 text-3xl font-semibold tabular-nums text-emerald-700">
              {knowCount}
            </span>
            <span className="mt-0.5 text-sm text-emerald-800">
              Tăng khoảng cách ôn
            </span>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 p-4">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-900">
              <Icon name="refresh" className="h-4 w-4" />Chưa thuộc
            </span>
            <span className="mt-1 text-3xl font-semibold tabular-nums text-amber-800">
              {dontKnowCount}
            </span>
            <span className="mt-0.5 text-sm text-amber-900">
              Ôn lại vào ngày mai
            </span>
          </div>
        </div>

        {/* Danh sách các từ chưa thuộc */}
        {unmasteredList.length > 0 && (
          <div className="mb-6 text-left">
            <h3 className="eyebrow mb-1">
              Các từ cần củng cố ({unmasteredList.length})
            </h3>
            <div className="max-h-56 divide-y divide-border overflow-y-auto pr-1">
              {unmasteredList.map(({ item }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold text-text">
                      <span className="break-words">{item.phrase}</span>
                      {item.ipa && (
                        <span className="break-all font-mono text-sm font-normal text-text-muted">
                          {item.ipa}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-1 text-base text-text-secondary">
                      {item.contextMeaning || "Chưa có nghĩa ngữ cảnh"}
                    </p>
                  </div>
                  <button
                    onClick={() => onSpeak(item.phrase)}
                    className="pressable inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary-dark hover:bg-primary-soft"
                    title="Nghe phát âm"
                    aria-label="Phát âm"
                  >
                    <Icon name="volume" className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hành động chuyển hướng */}
        <div className="space-y-3">
          {unmasteredList.length > 0 && (
            <Button size="lg" fullWidth onClick={onReviewIncorrectOnly} className="min-h-13 font-semibold">
              <Icon name="refresh" className="h-5 w-5" />Ôn lại {unmasteredList.length} từ chưa thuộc
            </Button>
          )}

          <Link href="/vocab/review" className={`${SECONDARY_LINK} w-full`}>
            <Icon name="lightbulb" className="h-5 w-5 shrink-0 text-amber-600" />Luyện sâu qua Micro-challenge (AI chấm)
          </Link>

          <div className="flex gap-3">
            <Link href="/vocab" className={SECONDARY_LINK}>
              <Icon name="pen" className="h-4 w-4 shrink-0" />Sổ từ vựng
            </Link>
            <Link href="/today" className={SECONDARY_LINK}>
              <Icon name="home" className="h-4 w-4 shrink-0" />Hôm nay
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
    <div className="mx-auto w-full max-w-md animate-fade-in py-2 sm:py-6">
      <div className="w-full rounded-2xl border border-red-200 bg-surface p-5 text-center shadow-card sm:p-8">
        <span aria-hidden="true" className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <Icon name="alert-triangle" className="h-7 w-7" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-red-800">
          Lưu kết quả thất bại
        </h2>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          Không thể lưu kết quả {batchCount} từ vừa ôn tập vào hệ thống (có thể
          do lỗi kết nối mạng). Hãy kiểm tra mạng và bấm Thử lại.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onRetry}
            disabled={saving}
            className="pressable flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!saving && <Icon name="refresh" className="h-5 w-5" />}
            {saving ? "Đang thử lại..." : "Thử lại ngay"}
          </button>
          <button
            onClick={onAbandon}
            className="pressable min-h-11 w-full cursor-pointer rounded-xl px-4 text-base font-medium text-text-secondary hover:bg-surface-subtle hover:text-text"
          >
            Bỏ qua và quay về Kho từ vựng
          </button>
        </div>
      </div>
    </div>
  );
}
