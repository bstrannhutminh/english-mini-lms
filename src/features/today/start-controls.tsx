"use client";
import { SegmentedControl } from "@/components/ui";

export interface StartControlsProps {
  targetMinutes: 30 | 45;
  onSelect: (mins: 30 | 45) => void;
  disabled?: boolean;
}

const OPTIONS = [
  { value: 30, label: "30 phút" },
  { value: 45, label: "45 phút" },
] as const;

/** Chọn thời lượng buổi học — 30 hoặc 45 phút (khóa khi đang mở bài). */
export function StartControls({ targetMinutes, onSelect, disabled = false }: StartControlsProps) {
  return (
    <SegmentedControl options={OPTIONS} value={targetMinutes} onChange={onSelect}
      ariaLabel="Chọn thời lượng học mục tiêu" disabled={disabled} className="shrink-0" />
  );
}
