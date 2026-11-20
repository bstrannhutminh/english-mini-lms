"use client";
import { StartControls } from "./start-controls";
export interface TodayHeroProps {
  displayName?: string;
  streakDays?: number | null;
  targetMinutes: 30 | 45;
  onSelectMinutes: (mins: 30 | 45) => void;
  selectingDisabled?: boolean;
}
export function TodayHero({ displayName, streakDays, targetMinutes, onSelectMinutes, selectingDisabled }: TodayHeroProps) {
  return (<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

    <div className="min-w-0">

      <p className="mb-1 break-words text-base text-text-secondary">Buổi học của {displayName || "Bác sĩ Minh"}</p>

      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Hôm nay</h1>

      <p className="mt-2 text-base text-text-secondary">
        Học một bài, đọc góp ý, thử lại.
        {typeof streakDays === "number" && streakDays > 0 && <span className="ml-2">{streakDays} ngày học liên tiếp.</span>}
      </p>

    </div>

    <StartControls targetMinutes={targetMinutes} onSelect={onSelectMinutes} disabled={selectingDisabled} />

  </header>);
}
