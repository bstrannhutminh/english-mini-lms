"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState, Icon } from "@/components/ui";
import type { VocabularyItem } from "@/contracts/vocabulary";
import { type VocabFilter } from "./api";
import { PageContainer } from "@/components/layout";
import { isDueNow, isMastered } from "./mastery";
import { DueTodayCard } from "./due-today-card";
import { VocabFilterBar } from "./vocab-filter-bar";
import { VocabItemCard } from "./vocab-item-card";
import { VocabPageHeader } from "./vocab-page-header";

interface VocabListViewProps {
  initialItems: VocabularyItem[];
}

/**
 * VocabList — Sổ từ vựng theo ngữ cảnh:
 * thẻ "Ôn hôm nay", tìm kiếm tức thì theo cụm từ/nghĩa, lọc mastery & nguồn,
 * nhóm theo ngày lưu với hệ nút hành động gọn mắt.
 */
export function VocabListView({ initialItems }: VocabListViewProps) {
  const [items, setItems] = useState<VocabularyItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<VocabFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isLoadingFilter = false;

  const now = useMemo(() => new Date(), []);

  const dueCount = items.filter((i) => isDueNow(i, now)).length;
  const masteredCount = items.filter((i) => isMastered(i.masteryLevel)).length;

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const i of items) set.add(i.sourceType || "");
    return [...set].sort();
  }, [items]);

  const trimmedQuery = query.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    if (sourceFilter !== "all" && (item.sourceType || "") !== sourceFilter) {
      return false;
    }
    if (activeFilter === "due" && !isDueNow(item, now)) return false;
    if (activeFilter === "mastered" && !isMastered(item.masteryLevel)) {
      return false;
    }
    if (trimmedQuery) {
      const text = [
        item.phrase,
        item.contextMeaning ?? "",
        item.originalSentence ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!text.includes(trimmedQuery)) return false;
    }
    return true;
  });

  function handleFilterChange(filter: string) {
    setActiveFilter(filter === "due" || filter === "mastered" ? filter : "all");
  }

  function handleItemChange(updated: VocabularyItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

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
    <PageContainer className="space-y-4 sm:space-y-5">
      <VocabPageHeader totalCount={items.length} dueCount={dueCount} masteredCount={masteredCount} />

      <DueTodayCard dueCount={dueCount} totalCount={items.length} />

      <VocabFilterBar
        query={query}
        onQueryChange={setQuery}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        sourceOptions={sourceOptions}
        totalCount={items.length}
        dueCount={dueCount}
        masteredCount={masteredCount}
      />

      {isLoadingFilter && (
        <div className="py-10 text-center text-base font-medium text-text-muted">
          Đang lọc danh sách thuật ngữ...
        </div>
      )}

      {!isLoadingFilter && filteredItems.length === 0 && (
        <EmptyState
          icon="book-open"
          className="rounded-2xl border border-dashed border-border bg-surface"
          title={
            trimmedQuery
              ? "Không tìm thấy cụm từ khớp từ khoá"
              : activeFilter === "due"
                ? "Tuyệt vời! Không có từ nào đang đến hạn ôn."
                : activeFilter === "mastered"
                  ? "Chưa có từ nào đạt mốc Đã thuộc."
                  : "Sổ từ vựng đang trống"
          }
          description="Khi luyện Đọc–dịch y khoa, bôi đen cụm từ bất kỳ để tra nghĩa chuyên ngành và bấm Lưu vào sổ 1 chạm."
          action={
            <Link
              href="/library"
              className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white no-underline hover:bg-primary-dark"
            >
              <span>Luyện đọc ngay</span>
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          }
        />
      )}

      {!isLoadingFilter &&
        Object.entries(groupedByDate).map(([dateStr, dateItems]) => (
          <div key={dateStr} className="space-y-3">
            <h2 className="eyebrow flex items-center gap-2 pl-1">
              <Icon name="calendar" className="h-4 w-4" />
              <span>Ngày lưu: {dateStr}</span>
              <span className="tabular-nums">· {dateItems.length} cụm từ</span>
            </h2>

            <div className="grid grid-cols-1 items-start gap-3 sm:gap-4 lg:grid-cols-2">
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
    </PageContainer>
  );
}
