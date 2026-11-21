"use client";
import { StartControls } from "./start-controls";

export interface TodayHeroProps {
  displayName?: string;
  /** Lời chào theo buổi, tính ở server (giờ VN). */
  greeting?: string;
  /** Dòng ngày, ví dụ "Thứ Bảy, 21 tháng 11". */
  dateLabel?: string;
  targetMinutes: 30 | 45;
  onSelectMinutes: (mins: 30 | 45) => void;
  selectingDisabled?: boolean;
}

/** Đầu trang Hôm nay: ngày, lời chào và bộ chọn thời lượng gọn. */
export function TodayHero({ displayName, greeting = "Chào", dateLabel, targetMinutes, onSelectMinutes, selectingDisabled }: TodayHeroProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0">
        {dateLabel && <p className="eyebrow">{dateLabel}</p>}
        <h1 className="mt-1 break-words text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl">
          {displayName ? `${greeting}, ${displayName}` : `${greeting}!`}
        </h1>
        <p className="mt-1 text-base text-text-secondary">Hôm nay bạn có bao nhiêu thời gian cho tiếng Anh?</p>
      </div>
      <StartControls targetMinutes={targetMinutes} onSelect={onSelectMinutes} disabled={selectingDisabled} />
    </header>
  );
}
