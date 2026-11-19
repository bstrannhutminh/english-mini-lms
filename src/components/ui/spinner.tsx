import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

export interface SpinnerProps {
  size?: keyof typeof SIZES;
  /** Nhãn cho screen reader — mặc định "Đang tải". */
  label?: string;
  className?: string;
}

/** Vòng quay chờ — SVG thuần, màu theo currentColor. */
export function Spinner({ size = "md", label = "Đang tải", className }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={cn("animate-spin", SIZES[size], className)}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
