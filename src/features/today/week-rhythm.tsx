import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { WeekDayActivityContract } from "@/contracts/today";

export interface WeekRhythmProps {
  days: WeekDayActivityContract[];
  streakDays: number;
  weekMinutes: number;
}

/**
 * Nhịp 7 ngày gần nhất: ngày nào có phiên hoàn thành, chuỗi ngày liên tiếp và
 * tổng phút học. Chỉ phản ánh thói quen — không suy ra trình độ.
 */
export function WeekRhythm({ days, streakDays, weekMinutes }: WeekRhythmProps) {
  if (days.length === 0) return null;
  const studiedCount = days.filter((day) => day.studied).length;
  return (
    <section aria-label="Nhịp học 7 ngày gần nhất" className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-text">Nhịp học tuần này</h2>
        <p className="text-sm tabular-nums text-text-muted">{studiedCount}/7 ngày</p>
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-1">
        {days.map((day) => (
          <li key={day.date} className="flex flex-col items-center gap-1.5">
            <span className={cn("text-sm", day.isToday ? "font-semibold text-primary-dark" : "text-text-muted")}>{day.label}</span>
            <span className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full",
              day.studied ? "bg-primary text-white" : "bg-surface-subtle text-text-muted",
              day.isToday && !day.studied && "ring-2 ring-primary ring-offset-2 ring-offset-surface"
            )}>
              {day.studied ? <Icon name="check" className="h-4 w-4" /> : <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
            </span>
            <span className="sr-only">{day.studied ? "đã học" : "chưa học"}{day.isToday ? ", hôm nay" : ""}</span>
          </li>
        ))}
      </ol>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Icon name="flame" className={cn("h-5 w-5", streakDays > 0 ? "text-accent" : "text-text-muted")} />
          <div>
            <dd className="text-base font-semibold tabular-nums text-text">{streakDays} ngày</dd>
            <dt className="text-sm text-text-muted">liên tiếp</dt>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="clock" className="h-5 w-5 text-text-muted" />
          <div>
            <dd className="text-base font-semibold tabular-nums text-text">{weekMinutes} phút</dd>
            <dt className="text-sm text-text-muted">7 ngày qua</dt>
          </div>
        </div>
      </dl>
    </section>
  );
}
