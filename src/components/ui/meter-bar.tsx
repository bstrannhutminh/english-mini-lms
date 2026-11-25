import { cn } from "@/lib/utils";

export interface MeterBarProps {
  /** Phần trăm đoạn chính (0–100). */
  percent: number;
  /** Đoạn phụ nối tiếp ngay sau đoạn chính (0–100), ví dụ "có hỗ trợ". */
  secondaryPercent?: number;
  /** Lớp fill cho đoạn chính, mặc định primary. */
  fillClass?: string;
  /** Lớp fill cho đoạn phụ, mặc định amber. */
  secondaryFillClass?: string;
  /**
   * Nhãn ngữ nghĩa cho trình đọc màn hình. Có label → role="meter" với
   * aria-valuenow/min/max; bỏ trống = thanh trang trí thuần (aria-hidden)
   * khi số liệu đã hiển thị bằng chữ ngay cạnh.
   */
  label?: string;
  className?: string;
}

/**
 * Thanh đo dạng SVG nền nhạt + đoạn fill — dùng chung cho thanh điểm
 * (my-work) và thanh tần suất/tỉ lệ (progress). Thuần SVG nên nhẹ,
 * không cần client state; chiều cao chỉnh qua className (h-1.5, h-2…).
 */
export function MeterBar({
  percent,
  secondaryPercent = 0,
  fillClass = "fill-primary",
  secondaryFillClass = "fill-amber-400",
  label,
  className,
}: MeterBarProps) {
  const main = Math.min(100, Math.max(0, percent));
  const secondary = Math.min(100 - main, Math.max(0, secondaryPercent));

  // Có nhãn → đo lường có ngữ nghĩa; không nhãn → trang trí, ẩn khỏi AT.
  const a11yProps = label
    ? {
        role: "meter" as const,
        "aria-label": label,
        "aria-valuenow": Math.round(main),
        "aria-valuemin": 0,
        "aria-valuemax": 100,
      }
    : { "aria-hidden": true as const };

  return (
    <svg {...a11yProps} className={cn("block h-1.5 w-full overflow-hidden rounded-full", className)}>
      <rect width="100%" height="100%" className="fill-surface-subtle" />
      <rect width={`${main}%`} height="100%" rx="3" className={fillClass} />
      {secondary > 0 ? (
        <rect x={`${main}%`} width={`${secondary}%`} height="100%" rx="3" className={secondaryFillClass} />
      ) : null}
    </svg>
  );
}
