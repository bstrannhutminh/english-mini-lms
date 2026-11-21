"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  createVocabularyResponseSchema,
} from "@/contracts/vocabulary";
import { Button, Icon, Modal, Spinner, useToast } from "@/components/ui";
import { buildCapturedVocabulary, type CaptureSourceType } from "@/features/session/shared/capture-context";
import { usePhraseLookup } from "./use-phrase-lookup";

interface SavePhraseButtonProps {
  /** Cụm từ/câu mẫu muốn lưu (thường là obs.example hoặc suggestion). */
  text: string;
  /** Câu ngữ cảnh bao quanh — bắt buộc tối thiểu bằng text (rule Sổ từ). */
  sentence?: string;
  /** Nguồn tham chiếu, ví dụ "feedback: <activity title>". */
  sourceRef?: string;
  sourceType?: CaptureSourceType;
}

/**
 * "Lưu cụm từ" — tra nghĩa nhanh qua vocabulary/quick-capture (Gemini) rồi
 * cho phép lưu 1 chạm vào Sổ từ (POST /api/v1/vocabulary).
 * Giống luồng SmartCapture trong phiên học nhưng từ góp ý AI.
 */
export function SavePhraseButton({
  text,
  sentence,
  sourceRef,
  sourceType = "feedback",
}: SavePhraseButtonProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const effectiveSentence = (sentence && sentence.trim()) || text.trim();

  const { result, loading, lookupError, prepareLookup, retryLookup } = usePhraseLookup({
    open, text, sentence: effectiveSentence, sourceRef,
  });

  async function handleSave() {
    if (!result || saving) return;
    setSaving(true);
    try {
      await apiFetch(
        "/api/v1/vocabulary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildCapturedVocabulary({
            phrase: result.phrase,
            ipa: result.ipa,
            contextMeaning: result.context_meaning,
            selectedText: text,
            surroundingSentence: effectiveSentence,
            sourceRef,
            sourceType,
          })),
        },
        createVocabularyResponseSchema
      );
      setSaved(true);
      toast.success("Đã lưu vào Sổ từ", `"${result.phrase}" sẽ vào lịch ôn tập.`);
      setTimeout(() => setOpen(false), 900);
    } catch (err) {
      toast.error(
        "Không thể lưu vào Sổ từ",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          // Đặt sẵn trạng thái trước khi effect chạy fetch (không setState trong effect)
          setSaved(false);
          prepareLookup();
          setOpen(true);
        }}
        title="Tra nghĩa nhanh và lưu cụm từ này vào Sổ từ"
        className="pressable -mr-2 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-base text-text-muted hover:bg-primary-soft hover:text-primary-dark sm:mr-0"
      >
        <Icon name="bookmark" className="h-4 w-4" />
        Lưu cụm từ
      </button>

      <Modal
        open={open}
        onClose={saving ? undefined : () => setOpen(false)}
        title="Lưu cụm từ vào Sổ từ"
        size="sm"
        footer={
          result ? (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Đóng
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
                disabled={saved}
                className="w-full sm:w-auto"
              >
                {saved ? "Đã lưu!" : "Lưu vào Sổ từ"}
              </Button>
            </>
          ) : undefined
        }
      >
        <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-base italic text-text-secondary">
          &quot;{text}&quot;
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-base text-text-secondary">
            <Spinner size="sm" label="Đang tra cứu" />
            Đang tra nghĩa trong ngữ cảnh…
          </div>
        ) : lookupError ? (
          <div className="space-y-3">
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800">{lookupError}</p>
            <Button variant="outline" onClick={retryLookup}>Tra cứu lại</Button>
          </div>
        ) : result ? (
          <div className="space-y-2 text-base">
            <p className="font-bold text-text">{result.phrase}</p>
            {result.ipa ? (
              <p className="font-mono text-base text-indigo-600">
                /{result.ipa.replace(/^\/|\/$/g, "")}/
              </p>
            ) : null}
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-text">
              {result.context_meaning}
            </p>
            {result.example_sentence ? (
              <p className="text-base italic text-text-muted">
                &ldquo;{result.example_sentence}&rdquo;
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
