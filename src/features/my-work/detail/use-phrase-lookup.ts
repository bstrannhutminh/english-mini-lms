"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { quickCaptureRequestSchema, quickCaptureResponseSchema, type QuickCaptureResponse } from "@/contracts/vocabulary";

/** Cancel stale lookups when a dialog closes; explicit retries retain the selected phrase. */
export function usePhraseLookup({ open, text, sentence, sourceRef }: {
  open: boolean;
  text: string;
  sentence: string;
  sourceRef?: string;
}) {
  const [result, setResult] = useState<QuickCaptureResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const body = quickCaptureRequestSchema.parse({ selected_text: text.trim(), surrounding_sentence: sentence, source_ref: sourceRef });
    apiFetch("/api/v1/vocabulary/quick-capture", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }, quickCaptureResponseSchema).then(data => {
      if (!cancelled) setResult(data);
    }).catch(err => {
      if (!cancelled) setLookupError(err instanceof Error ? err.message : "Không thể tra cứu cụm từ.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, text, sentence, sourceRef, attempt]);

  function prepareLookup() {
    setResult(null);
    setLookupError(null);
    setLoading(true);
  }
  function retryLookup() {
    prepareLookup();
    setAttempt(value => value + 1);
  }
  return { result, loading, lookupError, prepareLookup, retryLookup };
}
