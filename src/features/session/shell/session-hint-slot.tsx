"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Slot gợi ý của shell: SessionShell dựng <HintBar> (giữ nguyên logic ghi event
 * hint) rồi đưa qua context để SessionColumns đặt NGAY DƯỚI công tắc Đề bài/Bài
 * làm trên mobile và trên lưới 2 cột ở desktop. Panel nào có `plugin.Hint` phải
 * dùng SessionColumns (hoặc tự render `useSessionHintSlot()`) thì gợi ý mới hiện.
 */
const SessionHintSlotContext = createContext<ReactNode>(null);

export const SessionHintSlotProvider = SessionHintSlotContext.Provider;

export function useSessionHintSlot(): ReactNode {
  return useContext(SessionHintSlotContext);
}
