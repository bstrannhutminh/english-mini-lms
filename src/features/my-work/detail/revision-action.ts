import { modeSkill } from "@/lib/modes";
import type { IconName } from "@/components/ui";

export interface RevisionAction {
  /** Nhãn nút, ví dụ "Sửa ngay (Bản 2)". */
  label: string;
  icon: IconName;
}

/**
 * Nhãn + icon của hành động "làm bản tiếp theo" theo kỹ năng:
 * Viết → "Sửa ngay", Nói → "Nói lại", còn lại → "Làm lại".
 * Dùng chung cho CTA trong thẻ tóm tắt và thanh dính đáy trên mobile.
 */
export function revisionAction(mode: string, currentRevision: number): RevisionAction {
  const skill = modeSkill(mode);
  const verb = skill === "speaking" ? "Nói lại" : skill === "writing" ? "Sửa ngay" : "Làm lại";
  return {
    label: `${verb} (Bản ${currentRevision + 1})`,
    icon: skill === "speaking" ? "mic" : "pen",
  };
}

/** Nhãn khối "bản gốc của người học" trong thẻ góp ý, theo kỹ năng. */
export function originalEvidenceLabel(mode: string): string {
  switch (modeSkill(mode)) {
    case "speaking":
      return "Câu bạn đã nói";
    case "reading":
      return "Câu bạn đã dịch";
    case "listening":
      return "Câu trả lời của bạn";
    default:
      return "Câu bạn đã viết";
  }
}
