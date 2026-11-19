import type { ReactNode } from "react";

/**
 * Bố cục 2 cột cho vùng làm bài: ≥1024px cột trái (đề/nội dung) dính khi
 * cuộn, cột phải làm bài; dưới đó xếp dọc. Port từ components/session-grid.
 */
export function SessionColumns({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-6 lg:grid-cols-2">
      <div className="min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        {left}
      </div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}
