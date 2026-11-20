import { Icon } from "@/components/ui";
import { SKILL_INFO } from "@/lib/modes";
import { cn } from "@/lib/utils";
import type { LibrarySkillFilter, LibraryStatusFilter } from "./filter-activities";
const STATUS_OPTIONS: Array<{
  value: LibraryStatusFilter;
  label: string;
}> = [
    { value: "all", label: "Mọi trạng thái" }, { value: "not_started", label: "Chưa học" }, { value: "in_progress", label: "Đang dở" }, { value: "completed", label: "Đã nộp" },
  ];
const SKILLS: Array<{
  value: LibrarySkillFilter;
  label: string;
}> = [
    { value: "all", label: "Tất cả" }, ...(["writing", "reading", "speaking", "listening"] as const).map((value) => ({ value, label: SKILL_INFO[value].shortLabel })), { value: "ielts", label: "IELTS" },
  ];
export function LibraryFilterBar({ query, status, skill, totalCount, countSkill, hasActiveFilter, onQueryChange, onStatusChange, onSkillChange, onReset }: {
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
  return (<div className="space-y-4">

    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">

      <div className="space-y-2">
        <label htmlFor="library-search" className="block text-base font-medium text-text">Tìm bài học</label>
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
          <input id="library-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tên bài, chủ đề hoặc mục tiêu…" className="min-h-12 w-full rounded-xl border border-border-strong bg-surface pl-10 pr-4 text-base text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="library-status" className="block text-base font-medium text-text">Trạng thái</label>
        <select id="library-status" value={status} onChange={(event) => onStatusChange(event.target.value as LibraryStatusFilter)} className="min-h-12 w-full rounded-xl border border-border-strong bg-surface px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>
            {option.label}
          </option>)}
        </select>
      </div>

    </div>

    <div role="group" aria-label="Lọc bài theo kỹ năng" className="flex max-w-full gap-1 overflow-x-auto pb-1">

      {SKILLS.map((item) => <button key={item.value} type="button" onClick={() => onSkillChange(item.value)} aria-pressed={skill === item.value} className={cn("inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-base transition", skill === item.value ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary-dark")}>
        <span>
          {item.label}
        </span>
        <span className="tabular-nums">
          {item.value === "all" ? totalCount : countSkill(item.value)}
        </span>
      </button>)}

    </div>

    {hasActiveFilter && <button type="button" onClick={onReset} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-base font-medium text-primary-dark hover:bg-surface-muted"><Icon name="x" className="h-4 w-4" />Xóa bộ lọc</button>}

  </div>);
}
