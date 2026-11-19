"use client";

import { Icon, Tabs } from "@/components/ui";
import type { VocabFilter } from "./api";

const SOURCE_LABELS: Record<string, string> = {
  book: "Sách / tài liệu",
  video: "Video",
  article: "Bài báo",
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

/** Thanh tìm kiếm + lọc theo nguồn và mức độ thành thạo cho Sổ từ vựng. */
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
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm cụm từ tiếng Anh, nghĩa tiếng Việt hoặc câu gốc..."
            aria-label="Tìm kiếm trong sổ từ"
            className="min-h-11 w-full rounded-xl border border-border bg-surface-muted pl-10 pr-4 text-base text-text placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {sourceOptions.length > 1 && (
          <select
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange(e.target.value)}
            className="min-h-11 rounded-xl border border-border bg-surface-muted px-3.5 text-base font-medium text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        tabs={[
          { value: "all", label: "Tất cả", count: totalCount },
          { value: "due", label: "Đến hạn ôn", count: dueCount, icon: "clock" },
          {
            value: "mastered",
            label: "Đã thuộc",
            count: masteredCount,
            icon: "check-circle",
          },
        ]}
      />
    </div>
  );
}
