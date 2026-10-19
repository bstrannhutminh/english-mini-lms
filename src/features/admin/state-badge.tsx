"use client";

import { Badge } from "@/components/ui";
import { reviewStateMeta } from "./labels";

/** Chip trạng thái kiểm duyệt — chỉ hiển thị nhãn tiếng Việt. */
export function StateBadge({ state }: { state: string | null | undefined }) {
  const meta = reviewStateMeta(state);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
