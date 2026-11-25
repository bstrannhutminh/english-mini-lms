"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveDraftResponseSchema } from "@/contracts/session";
import { apiFetch } from "@/lib/api-client";

export interface AutosaveDraft {
  /** "HH:mm" lần lưu gần nhất, null nếu chưa lưu. */
  lastSavedAt: string | null;
  isSaving: boolean;
  /** Lần lưu gần nhất thất bại (để shell hiện đường thử lại). */
  saveFailed: boolean;
  /** Lưu ngay lập tức; trả true nếu thành công. */
  saveNow: () => Promise<boolean>;
}

const AUTOSAVE_INTERVAL_MS = 30_000;

function nowStamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Quyết định autosave (thuần — tách để unit test):
 *  - "empty": nội dung trống → bỏ qua, coi như CHƯA lưu.
 *  - "unchanged": trùng nội dung lần lưu thành công cuối → bỏ qua POST
 *    (server đã giữ đúng bản này) nhưng coi như ĐÃ lưu — save-and-exit
 *    không cần bắn request khi không có gì mới.
 *  - "dirty": cần POST.
 */
export function draftSaveAction(
  content: string,
  lastSavedContent: string
): "empty" | "unchanged" | "dirty" {
  if (!content.trim()) return "empty";
  return content === lastSavedContent ? "unchanged" : "dirty";
}

/**
 * Tự lưu nháp mỗi 30s qua POST /api/v1/sessions/[id]/drafts.
 * `getContent` trả nội dung mới nhất; "" hoặc chỉ khoảng trắng = bỏ qua.
 * `initialSavedContent` = nháp server đang giữ lúc mở phiên — nhờ đó phiên
 * mở ra mà không gõ gì thêm sẽ không bắn POST nào (kể cả lần tick đầu).
 */
export function useAutosaveDraft(options: {
  sessionId: string;
  getContent: () => string;
  enabled?: boolean;
  /** Nội dung server đã lưu trước khi phiên mở (nháp tải về). */
  initialSavedContent?: string;
}): AutosaveDraft {
  const { sessionId, getContent, enabled = true, initialSavedContent = "" } = options;
  const [draftVersion, setDraftVersion] = useState(1);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  // Nội dung của lần POST thành công gần nhất — khởi đầu là nháp server đang giữ.
  // Chỉ cập nhật KHI lưu thành công: lưu hỏng thì tick sau vẫn thử lại.
  const lastSavedContentRef = useRef(initialSavedContent);

  const save = useCallback(async (): Promise<boolean> => {
    const content = getContent();
    const action = draftSaveAction(content, lastSavedContentRef.current);
    if (action === "empty") return false;
    if (action === "unchanged") return true;
    try {
      const saved = await apiFetch(
        `/api/v1/sessions/${sessionId}/drafts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, version: draftVersion + 1 }),
        },
        saveDraftResponseSchema
      );
      // Chụp đúng nội dung đã POST (không phải nội dung tại thời điểm response
      // về — người học có thể đang gõ dở; phần mới sẽ được tick sau lưu tiếp).
      lastSavedContentRef.current = content;
      setDraftVersion(saved.version);
      setLastSavedAt(nowStamp());
      setSaveFailed(false);
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  }, [sessionId, getContent, draftVersion]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    // An exit/save request must capture fresh input after an older autosave finishes.
    while (inFlightRef.current) await inFlightRef.current;
    setIsSaving(true);
    const pending = save().finally(() => {
      setIsSaving(false);
      inFlightRef.current = null;
    });
    inFlightRef.current = pending;
    return pending;
  }, [save]);

  const saveRef = useRef(saveNow);
  useEffect(() => {
    saveRef.current = saveNow;
  }, [saveNow]);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      void saveRef.current();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled]);

  return { lastSavedAt, isSaving, saveFailed, saveNow };
}
