"use client";

import { Icon, Tabs } from "@/components/ui";
import type { VocabFilter } from "./api";

const SOURCE_LABELS: Record<string, string> = {
  book: "Sách / tài liệu",
  video: "Video",
  article: "Bài báo",
  text: "Bài viết",
  feedback: "Góp ý bài làm",
};

function sourceLabel(sourceType: string | null): string {
  if (!sourceType) return "Nguồn khác";
  return SOURCE_LABELS[sourceType] ?? sourceType;
}

interface VocabFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeFilter: VocabFilter;
  onFilterChange: (filter: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  sourceOptions: string[];
  totalCount: number;
  dueCount: number;
  masteredCount: number;
}

/** Thanh tìm kiếm + lọc theo nguồn và MỘT hàng tab mức độ thành thạo cho Sổ từ. */
export function VocabFilterBar({
  query,
  onQueryChange,
  activeFilter,
  onFilterChange,
  sourceFilter,
  onSourceFilterChange,
  sourceOptions,
  totalCount,
  dueCount,
  masteredCount,
}: VocabFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="relative min-w-0 flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm cụm từ, nghĩa hoặc câu gốc…"
            aria-label="Tìm kiếm trong sổ từ"
            className="min-h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-base text-text shadow-card placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {sourceOptions.length > 1 && (
          <select
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange(e.target.value)}
            className="min-h-12 max-w-[45%] cursor-pointer rounded-xl border border-border bg-surface px-3 text-base text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Lọc theo nguồn"
          >
            <option value="all">Tất cả nguồn</option>
            {sourceOptions.map((s) => (
              <option key={s || "other"} value={s}>
                {sourceLabel(s)}
              </option>
            ))}
          </select>
        )}
      </div>

      <Tabs
        variant="pills"
        aria-label="Lọc theo mức thành thạo"
        value={activeFilter}
        onValueChange={onFilterChange}
        className="scroll-strip flex w-full min-w-0 flex-nowrap lg:w-auto [&>button]:flex-1 [&>button]:justify-center [&>button]:whitespace-nowrap [&>button]:px-2 lg:[&>button]:px-4"
        tabs={[
          { value: "all", label: "Tất cả", count: totalCount },
          { value: "due", label: "Đến hạn", count: dueCount },
          { value: "mastered", label: "Đã thuộc", count: masteredCount },
        ]}
      />
    </div>
  );
}
