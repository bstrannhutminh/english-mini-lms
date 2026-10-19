"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState, Icon, Tabs } from "@/components/ui";
import type { VocabularyItem } from "@/contracts/vocabulary";
import { fetchVocabularyList, type VocabFilter } from "./api";
import { isDueNow, isMastered } from "./mastery";
import { DueTodayCard } from "./due-today-card";
import { VocabItemCard } from "./vocab-item-card";

interface VocabListViewProps {
  initialItems: VocabularyItem[];
}

/** Nhãn loại nguồn (source_type) — bộ lọc "chủ đề/nguồn" của Sổ từ. */
const SOURCE_LABELS: Record<string, string> = {
  book: "Sách / tài liệu",
  video: "Video",
  article: "Bài báo",
};

function sourceLabel(sourceType: string | null): string {
  if (!sourceType) return "Nguồn khác";
  return SOURCE_LABELS[sourceType] ?? sourceType;
}

/**
 * VocabList — Sổ từ vựng: thẻ "Ôn hôm nay" đầu trang, lọc theo trạng thái
 * mastery (Tất cả / Đến hạn / Đã thuộc) + lọc theo nguồn, nhóm theo ngày lưu.
 */
export function VocabListView({ initialItems }: VocabListViewProps) {
  const [items, setItems] = useState<VocabularyItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<VocabFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(
    initialItems.length > 0 ? initialItems[0].id : null
  );
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);

  const now = useMemo(() => new Date(), []);

  const dueCount = items.filter((i) => isDueNow(i, now)).length;
  const masteredCount = items.filter((i) => isMastered(i.masteryLevel)).length;

  // Các loại nguồn hiện có trong sổ (cho select lọc theo nguồn)
  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const i of items) set.add(i.sourceType || "");
    return [...set].sort();
  }, [items]);

  const filteredItems = items.filter((item) => {
    if (sourceFilter !== "all" && (item.sourceType || "") !== sourceFilter) {
      return false;
    }
    if (activeFilter === "due") return isDueNow(item, now);
    if (activeFilter === "mastered") return isMastered(item.masteryLevel);
    return true;
  });

  // Chuyển tab lọc — hỏi server theo filter rồi lọc nguồn phía client
  async function handleFilterChange(filter: string) {
    const next = (filter === "due" || filter === "mastered" ? filter : "all") as VocabFilter;
    setActiveFilter(next);
    try {
      setIsLoadingFilter(true);
      const data = await fetchVocabularyList(next);
      setItems(data.items);
    } catch (err) {
      console.error("Lỗi tải danh sách từ:", err);
    } finally {
      setIsLoadingFilter(false);
    }
  }

  function handleItemChange(updated: VocabularyItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  // Nhóm các mục theo ngày lưu
  const groupedByDate: Record<string, VocabularyItem[]> = {};
  for (const item of filteredItems) {
    const dateStr = new Date(item.createdAt).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    (groupedByDate[dateStr] ??= []).push(item);
  }

  return (
    <div className="mx-auto w-full max-w-3xl lg:max-w-5xl px-4 pt-6 pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0">
              <Icon name="bookmark" className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Sổ từ vựng Y khoa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-10.5">
            Ngữ cảnh lâm sàng • 1-Chạm Quick-Capture • Spaced Repetition
          </p>
        </div>

        {/* Nút hành động nhanh */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/vocab/flashcards"
            data-tour="vocab-flashcards"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer min-h-[44px]"
          >
            <Icon name="cards" className="w-4 h-4" />
            <span>Ôn nhanh Flashcard</span>
          </Link>
          <Link
            href="/vocab/review"
            data-tour="vocab-review"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer min-h-[44px]"
          >
            <Icon name="sparkles" className="w-4 h-4" />
            <span>Thử thách câu</span>
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer min-h-[44px]"
          >
            <Icon name="book-open" className="w-4 h-4 text-slate-500" />
            <span>Đọc tra từ</span>
          </Link>
        </div>
      </div>

      {/* Ôn hôm nay — block trên cùng */}
      <DueTodayCard dueCount={dueCount} />

      {/* Tabs lọc theo mastery + select lọc theo nguồn */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 flex-wrap">
        <Tabs
          variant="pills"
          aria-label="Lọc theo mức thành thạo"
          value={activeFilter}
          onValueChange={handleFilterChange}
          tabs={[
            { value: "all", label: "Tất cả", count: items.length },
            { value: "due", label: "Đến hạn ôn", count: dueCount, icon: "clock" },
            {
              value: "mastered",
              label: "Đã thuộc",
              count: masteredCount,
              icon: "check-circle",
            },
          ]}
        />

        {sourceOptions.length > 1 && (
          <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Nguồn:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
              aria-label="Lọc theo nguồn"
            >
              <option value="all">Tất cả nguồn</option>
              {sourceOptions.map((s) => (
                <option key={s || "other"} value={s}>
                  {sourceLabel(s)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Trạng thái tải bộ lọc */}
      {isLoadingFilter && (
        <div className="text-center py-10 text-slate-400 text-sm font-medium">
          Đang lọc danh sách thuật ngữ...
        </div>
      )}

      {/* Danh sách rỗng */}
      {!isLoadingFilter && filteredItems.length === 0 && (
        <EmptyState
          icon="book-open"
          className="max-w-lg mx-auto"
          title={
            activeFilter === "due"
              ? "Tuyệt vời! Không có từ nào đang đến hạn ôn tập."
              : activeFilter === "mastered"
                ? "Chưa có từ nào được đánh dấu là Đã thuộc."
                : "Sổ từ vựng đang trống."
          }
          description="Khi luyện Đọc–dịch y khoa, bôi đen cụm từ bất kỳ để tra cứu chuyên ngành và lưu 1-chạm vào Sổ từ vựng!"
          action={
            <Link
              href="/library"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700"
            >
              Luyện đọc ngay →
            </Link>
          }
        />
      )}

      {/* Danh sách gom theo ngày */}
      {!isLoadingFilter &&
        Object.entries(groupedByDate).map(([dateStr, dateItems]) => (
          <div key={dateStr} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              <Icon name="calendar" className="w-3.5 h-3.5 text-slate-400" />
              <span>Ngày lưu: {dateStr}</span>
              <span className="text-[11px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-semibold tabular-nums">
                {dateItems.length}
              </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              {dateItems.map((item) => (
                <VocabItemCard
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                  onItemChange={handleItemChange}
                  tourTarget={
                    item.id === filteredItems[0]?.id ? "vocab-item" : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
