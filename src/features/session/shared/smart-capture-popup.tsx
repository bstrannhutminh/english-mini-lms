"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Modal, Spinner } from "@/components/ui";
import { createVocabularyEntry, quickCaptureLookup } from "@/features/vocab/api";
import { buildCapturedVocabulary, type CaptureSourceType } from "./capture-context";
import { SmartCaptureResult, type CapturedResult } from "./smart-capture-result";

interface SmartCapturePopupProps {
  selectedText: string;
  surroundingSentence: string;
  sourceRef?: string;
  sourceType?: CaptureSourceType;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSaved?: () => void;
}

/** A focused capture dialog keeps the original sentence and caller provenance intact. */
export function SmartCapturePopup({
  selectedText, surroundingSentence, sourceRef, sourceType = "text", position, onClose, onSaved,
}: SmartCapturePopupProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CapturedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    quickCaptureLookup({
      selected_text: selectedText,
      surrounding_sentence: surroundingSentence,
      source_ref: sourceRef,
    }).then(result => {
      if (!cancelled) setData(result);
    }).catch(err => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tra cứu cụm từ.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedText, surroundingSentence, sourceRef, lookupAttempt]);

  useEffect(() => () => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, []);

  async function handleSaveToVault() {
    if (!data || isSaving || isSaved) return;
    setIsSaving(true);
    setError(null);
    try {
      await createVocabularyEntry(buildCapturedVocabulary({
        phrase: data.phrase,
        ipa: data.ipa,
        contextMeaning: data.context_meaning,
        selectedText,
        surroundingSentence,
        sourceRef,
        sourceType,
      }));
      setIsSaved(true);
      onSaved?.();
      savedTimerRef.current = setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa lưu được cụm từ. Hãy thử lưu lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal open={Boolean(position)} onClose={isSaving ? undefined : onClose} title="Lưu cụm từ" size="sm">
      <p className="mb-2 text-lg font-semibold text-text">{selectedText}</p>
      <blockquote className="mb-3 border-l-2 border-border px-3 text-base leading-relaxed text-text-secondary">{surroundingSentence || selectedText}</blockquote>
      <p className="mb-4 break-words text-base text-text-secondary">Nguồn: {sourceRef || "Chưa được ghi nhận"}</p>
      {loading ? (
        <div role="status" className="flex items-center gap-3 py-5 text-base text-text-secondary"><Spinner size="sm" label="Đang tra cứu" />Đang tra nghĩa trong ngữ cảnh…</div>
      ) : (
        <>
          {error && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800">{error}</p>}
          {data ? <SmartCaptureResult data={data} isSaving={isSaving} isSaved={isSaved} onSave={() => void handleSaveToVault()} /> : (
            <Button variant="outline" onClick={() => { setError(null); setLoading(true); setLookupAttempt(value => value + 1); }}>Tra cứu lại</Button>
          )}
        </>
      )}
    </Modal>
  );
}
