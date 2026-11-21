import { cn } from "@/lib/utils";
import type { LibraryStatusFilter } from "./filter-activities";

const STATUS_OPTIONS: Array<{
  value: LibraryStatusFilter;
  label: string;
}> = [
    { value: "all", label: "Mọi trạng thái" }, { value: "not_started", label: "Chưa học" }, { value: "in_progress", label: "Đang dở" }, { value: "completed", label: "Đã nộp" },
  ];

/** Ô chọn trạng thái học gọn (nhãn ẩn cho trình đọc màn hình) — dùng ở khối lọc và hàng kết quả. */
export function LibraryStatusSelect({ id, value, onChange, className }: {
  id: string;
  value: LibraryStatusFilter;
  onChange: (status: LibraryStatusFilter) => void;
  className?: string;
}) {
  return (
    <div className={cn("shrink-0", className)}>
      <label htmlFor={id} className="sr-only">Trạng thái</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as LibraryStatusFilter)}
        className={cn("h-full min-h-11 cursor-pointer rounded-xl border bg-surface px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          value === "all" ? "border-border text-text-secondary" : "border-primary font-medium text-primary-dark")}>
        {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
