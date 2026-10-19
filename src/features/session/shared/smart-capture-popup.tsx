"use client";

import { useState, useEffect, useRef } from "react";
import {
  createVocabularyEntry,
  quickCaptureLookup,
} from "@/features/vocab/api";
import { SmartCaptureResult, type CapturedResult } from "./smart-capture-result";

interface SmartCapturePopupProps {
  selectedText: string;
  surroundingSentence: string;
  sourceRef?: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * Popup nổi khi bôi đen chữ trong phiên học: tra cứu thuật ngữ (Gemini
 * quick-capture), nghe YouGlish, lưu vào Sổ từ với câu gốc bắt buộc.
 * Vị trí tính theo tọa độ bôi đen — clamp trong viewport.
 */
export function SmartCapturePopup({
  selectedText,
  surroundingSentence,
  sourceRef,
  position,
  onClose,
  onSaved,
}: SmartCapturePopupProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CapturedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Tra cứu tự động khi bôi đen
  useEffect(() => {
    let isCancelled = false;

    async function fetchDefinition() {
      try {
        setLoading(true);
        setError(null);

        const result = await quickCaptureLookup({
          selected_text: selectedText,
          surrounding_sentence: surroundingSentence,
          source_ref: sourceRef || "Sổ tay siêu âm can thiệp tr.42",
        });

        if (isCancelled) return;
        setData(result);
      } catch (err) {
        if (!isCancelled) {
          console.error("Lỗi quick-capture:", err);
          setError(err instanceof Error ? err.message : "Không thể tra cứu thuật ngữ");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    if (selectedText.trim()) {
      fetchDefinition();
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedText, surroundingSentence, sourceRef]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      // Modal YouGlish render qua portal (ngoài popupRef trong DOM). Nếu không loại trừ,
      // bấm vào modal sẽ làm popup đóng → modal và widget biến mất.
      if (target instanceof Element && target.closest("[data-youglish-modal]")) {
        return;
      }
      if (popupRef.current && !popupRef.current.contains(target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Lưu vào sổ từ (1-click save)
  async function handleSaveToVault() {
    if (!data) return;

    try {
      setIsSaving(true);
      setError(null);

      await createVocabularyEntry({
        phrase: data.phrase,
        ipa: data.ipa,
        context_meaning: data.context_meaning,
        original_sentence:
          (surroundingSentence && surroundingSentence.trim()) ||
          selectedText.trim(), // QUY TẮC BẮT BUỘC: phải có câu gốc
        source_ref: sourceRef || "Sổ tay siêu âm can thiệp tr.42",
        source_type: "book",
        my_attempt: "",
      });

      setIsSaved(true);
      if (onSaved) onSaved();

      // Đóng popup sau 1.2s
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Lỗi khi lưu vào sổ:", err);
      setError(err instanceof Error ? err.message : "Không thể lưu vào sổ từ");
      setIsSaving(false);
    }
  }

  if (!position) return null;

  // Tính vị trí an toàn trên viewport (tránh tràn mép phải/dưới khi fixed)
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;
  const left = Math.min(Math.max(16, position.x - 140), Math.max(16, viewportWidth - 330));
  const showAbove = position.y + 300 > viewportHeight && position.y > 320;
  const top = showAbove
    ? Math.max(16, position.y - 320)
    : Math.min(position.y + 16, Math.max(16, viewportHeight - 340));

  return (
    <div
      ref={popupRef}
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-[9999] w-[310px] max-w-[92vw] animate-fade-in rounded-xl border border-slate-300 bg-white p-4 text-sm shadow-xl"
    >
      {/* Header popup */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">⚡</span>
          <span className="text-[13px] font-bold uppercase text-slate-800">
            Quick-Capture Vault
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded px-1.5 py-0.5 text-base leading-none text-slate-400"
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div className="py-4 text-center text-slate-500">
          <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <div className="text-[13px]">Đang tra cứu chuyên ngành y khoa...</div>
        </div>
      )}

      {/* Trạng thái Lỗi */}
      {error && !loading && (
        <div className="py-2">
          <div className="mb-2 text-[13px] text-red-600">{error}</div>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Kết quả Tra cứu */}
      {data && !loading && (
        <SmartCaptureResult
          data={data}
          isSaving={isSaving}
          isSaved={isSaved}
          onSave={handleSaveToVault}
        />
      )}
    </div>
  );
}
