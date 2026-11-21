import { cn } from "@/lib/utils";
import { modeMeta } from "@/lib/modes";
import { Icon } from "./icons";

export interface SkillTileProps {
  /** Activity mode ("writing", "ielts-reading"…) — màu/icon lấy từ MODE_META. */
  mode: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: { box: "h-9 w-9 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-11 w-11 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7" },
} as const;

/** Ô icon kỹ năng: nền nhạt + icon đậm theo màu skill — điểm nhận diện bài học. */
export function SkillTile({ mode, size = "md", className }: SkillTileProps) {
  const meta = modeMeta(mode);
  const dims = SIZE_CLASSES[size];
  return (
    <span aria-hidden="true" className={cn("inline-flex shrink-0 items-center justify-center", dims.box, meta.softBgClass, meta.iconClass, className)}>
      <Icon name={meta.icon} className={dims.icon} />
    </span>
  );
}
