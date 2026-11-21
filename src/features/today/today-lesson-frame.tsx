import type { ReactNode } from "react";
import { Icon, SkillTile } from "@/components/ui";
import { cn } from "@/lib/utils";
import { modeMeta } from "@/lib/modes";

interface TodayLessonFrameProps {
  titleId: string;
  title: string;
  label: string;
  mode: string;
  durationMinutes: number;
  slot: string | null;
  description?: string | null;
  children: ReactNode;
}

/** Shared visual hierarchy for the recommended lesson and an active session. */
export function TodayLessonFrame({ titleId, title, label, mode, durationMinutes, slot, description, children }: TodayLessonFrameProps) {
  const meta = modeMeta(mode);
  return (
    <section aria-labelledby={titleId}
      className={cn("hero-wash rounded-2xl border border-border p-5 shadow-card sm:p-7 lg:p-8", `hero-wash-${meta.skill}`)}>
      <div className="flex items-center gap-3">
        <SkillTile mode={mode} size="lg" className="bg-surface shadow-card" />
        <div className="min-w-0">
          <p className="eyebrow text-primary-dark">{label}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-base text-text-secondary">
            <span className={cn("font-medium", meta.iconClass)}>{meta.label}</span>
            {meta.isIelts && <span>· IELTS luyện tập</span>}
          </p>
        </div>
      </div>
      <h2 id={titleId} className="mt-5 max-w-3xl break-words text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 max-w-prose text-base leading-relaxed text-text-secondary">{description}</p>}
      <ul className="mt-4 flex flex-wrap gap-2 text-sm text-text-secondary">
        <li className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-3">
          <Icon name="clock" className="h-4 w-4 text-text-muted" />
          <span className="tabular-nums">{durationMinutes} phút dự kiến</span>
        </li>
        {slot && (
          <li className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-3">
            <Icon name="layers" className="h-4 w-4 text-text-muted" />Bài {slot}
          </li>
        )}
      </ul>
      {children}
    </section>
  );
}
