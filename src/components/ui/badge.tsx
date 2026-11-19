import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/modes";
import type { HTMLAttributes } from "react";

/**
 * Tone của Badge: trạng thái chung hoặc tên kỹ năng
 * ("writing" | "reading" | "speaking" | "listening" — trùng --color-skill-*).
 */
export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info"
  | Skill;

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  writing: "border-skill-writing-border bg-skill-writing-soft text-skill-writing",
  reading: "border-skill-reading-border bg-skill-reading-soft text-skill-reading",
  speaking: "border-skill-speaking-border bg-skill-speaking-soft text-skill-speaking",
  listening: "border-skill-listening-border bg-skill-listening-soft text-skill-listening",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/**
 * Nhãn/chip nhỏ. Dùng với MODE_META: `<Badge tone={meta.tone}>…</Badge>`
 * và `isIelts` → `<Badge tone="neutral">IELTS</Badge>` đi kèm.
 */
export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        TONE_CLASSES[tone],
        className
      )}
      {...rest}
    />
  );
}
