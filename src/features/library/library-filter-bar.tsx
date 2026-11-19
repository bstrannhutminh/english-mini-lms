import { Icon, Tabs } from "@/components/ui";
import { SKILL_INFO } from "@/lib/modes";
import type { LibrarySkillFilter, LibraryStatusFilter } from "./filter-activities";

const STATUS_OPTIONS: Array<{ value: LibraryStatusFilter; label: string }> = [
  { value: "all", label: "Mọi trạng thái" },
  { value: "not_started", label: "Chưa học" },
  { value: "in_progress", label: "Đang dở" },
  { value: "completed", label: "Đã nộp" },
];

/** Search and filter controls share the explorer's current topic scope. */
export function LibraryFilterBar({
  query,
  status,
  skill,
  totalCount,
  countSkill,
  hasActiveFilter,
  onQueryChange,
  onStatusChange,
  onSkillChange,
  onReset,
}: {
  query: string;
  status: LibraryStatusFilter;
  skill: LibrarySkillFilter;
  totalCount: number;
  countSkill: (target: LibrarySkillFilter) => number;
  hasActiveFilter: boolean;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: LibraryStatusFilter) => void;
  onSkillChange: (skill: LibrarySkillFilter) => void;
  onReset: () => void;
}) {
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
            placeholder="Tìm tên bài học, chủ đề hoặc mục tiêu..."
            aria-label="Tìm kiếm bài học"
            className="min-h-11 w-full rounded-xl border border-border bg-surface-muted pl-10 pr-4 text-base text-text placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          aria-label="Lọc theo trạng thái học"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as LibraryStatusFilter)}
          className="min-h-11 rounded-xl border border-border bg-surface-muted px-3.5 text-base font-medium text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-xl px-3 text-xs font-semibold text-primary-dark hover:bg-teal-50"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
            Xoá lọc
          </button>
        )}
      </div>

      <Tabs
        variant="pills"
        aria-label="Lọc bài theo kỹ năng"
        value={skill}
        onValueChange={(v) => onSkillChange(v as LibrarySkillFilter)}
        className="max-w-full overflow-x-auto"
        tabs={[
          { value: "all", label: "Tất cả", count: totalCount },
          {
            value: "writing",
            label: SKILL_INFO.writing.shortLabel,
            count: countSkill("writing"),
          },
          {
            value: "reading",
            label: SKILL_INFO.reading.shortLabel,
            count: countSkill("reading"),
          },
          {
            value: "speaking",
            label: SKILL_INFO.speaking.shortLabel,
            count: countSkill("speaking"),
          },
          {
            value: "listening",
            label: SKILL_INFO.listening.shortLabel,
            count: countSkill("listening"),
          },
          ...(countSkill("ielts") > 0
            ? [{ value: "ielts", label: "IELTS", count: countSkill("ielts") }]
            : []),
        ]}
      />
    </div>
  );
}
