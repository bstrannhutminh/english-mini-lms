import { Icon } from "@/components/ui";
import { SKILL_INFO } from "@/lib/modes";
import { cn } from "@/lib/utils";
import type { LibrarySkillFilter, LibraryStatusFilter } from "./filter-activities";
import { LibraryStatusSelect } from "./library-status-select";

const SKILLS: Array<{
  value: LibrarySkillFilter;
  label: string;
}> = [
    { value: "all", label: "Tất cả" }, ...(["writing", "reading", "speaking", "listening"] as const).map((value) => ({ value, label: SKILL_INFO[value].shortLabel })), { value: "ielts", label: "IELTS" },
  ];

/**
 * Khối lọc gọn của Thư viện: ô tìm kiếm (≥48px) + chọn trạng thái (≥sm, trên
 * mobile nằm ở hàng kết quả) và MỘT hàng tab kỹ năng cuộn ngang kèm số bài.
 */
export function LibraryFilterBar({ query, status, skill, totalCount, countSkill, onQueryChange, onStatusChange, onSkillChange }: {
  query: string;
  status: LibraryStatusFilter;
  skill: LibrarySkillFilter;
  totalCount: number;
  countSkill: (target: LibrarySkillFilter) => number;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: LibraryStatusFilter) => void;
  onSkillChange: (skill: LibrarySkillFilter) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="library-search" className="sr-only">Tìm bài học</label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input id="library-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm tên bài, chủ đề hoặc mục tiêu…"
            className="min-h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-base text-text shadow-card placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <LibraryStatusSelect id="library-status" value={status} onChange={onStatusChange} className="hidden min-h-12 sm:block" />
      </div>

      <div role="group" aria-label="Lọc bài theo kỹ năng" className="scroll-strip -mx-5 flex gap-1 border-b border-border px-5 sm:mx-0 sm:px-0">
        {SKILLS.map((item) => {
          const selected = skill === item.value;
          return (
            <button key={item.value} type="button" onClick={() => onSkillChange(item.value)} aria-pressed={selected}
              className={cn("-mb-px inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-base font-medium transition-colors",
                selected ? "border-primary text-primary-dark" : "border-transparent text-text-secondary hover:text-text")}>
              <span>{item.label}</span>
              <span className={cn("rounded-full px-1.5 text-xs font-semibold leading-5 tabular-nums", selected ? "bg-primary-soft text-primary-dark" : "bg-surface-subtle text-text-muted")}>
                {item.value === "all" ? totalCount : countSkill(item.value)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
