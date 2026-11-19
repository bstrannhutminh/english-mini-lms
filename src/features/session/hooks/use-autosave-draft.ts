"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
 * Tự lưu nháp mỗi 30s qua POST /api/v1/sessions/[id]/drafts.
 * `getContent` trả nội dung mới nhất; "" hoặc chỉ khoảng trắng = bỏ qua.
 */
export function useAutosaveDraft(options: {
  sessionId: string;
  getContent: () => string;
  enabled?: boolean;
}): AutosaveDraft {
  const { sessionId, getContent, enabled = true } = options;
  const [draftVersion, setDraftVersion] = useState(1);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const save = useCallback(async (): Promise<boolean> => {
    const content = getContent();
    if (!content.trim()) return false;
    try {
      const res = await fetch(`/api/v1/sessions/${sessionId}/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, version: draftVersion + 1 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDraftVersion((v) => v + 1);
      setLastSavedAt(nowStamp());
      setSaveFailed(false);
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  }, [sessionId, getContent, draftVersion]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      return await save();
    } finally {
      setIsSaving(false);
    }
  }, [save]);

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      void saveRef.current();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled]);

  return { lastSavedAt, isSaving, saveFailed, saveNow };
}
