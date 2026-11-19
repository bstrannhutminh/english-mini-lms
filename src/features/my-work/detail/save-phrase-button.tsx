"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  quickCaptureRequestSchema,
  quickCaptureResponseSchema,
  createVocabularyResponseSchema,
  type QuickCaptureResponse,
} from "@/contracts/vocabulary";
import { Button, Icon, Modal, Spinner, useToast } from "@/components/ui";

interface SavePhraseButtonProps {
  /** Cụm từ/câu mẫu muốn lưu (thường là obs.example hoặc suggestion). */
  text: string;
  /** Câu ngữ cảnh bao quanh — bắt buộc tối thiểu bằng text (rule Sổ từ). */
  sentence?: string;
  /** Nguồn tham chiếu, ví dụ "feedback: <activity title>". */
  sourceRef?: string;
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
}: SavePhraseButtonProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCaptureResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const effectiveSentence = (sentence && sentence.trim()) || text.trim();

  // Tra cứu khi mở modal — setState chỉ trong callback promise (rule react-hooks).
  // Trạng thái "đang tra" được đặt sẵn từ click mở modal.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const body = quickCaptureRequestSchema.parse({
      selected_text: text.trim(),
      surrounding_sentence: effectiveSentence,
      source_ref: sourceRef,
    });
    apiFetch(
      "/api/v1/vocabulary/quick-capture",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      quickCaptureResponseSchema
    )
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLookupError(
            err instanceof Error ? err.message : "Không thể tra cứu thuật ngữ"
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, text, effectiveSentence, sourceRef]);

  async function handleSave() {
    if (!result || saving) return;
    setSaving(true);
    try {
      await apiFetch(
        "/api/v1/vocabulary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phrase: result.phrase,
            ipa: result.ipa,
            context_meaning: result.context_meaning,
            // Rule bắt buộc của Sổ từ: phải có câu gốc
            original_sentence: effectiveSentence,
            source_ref: sourceRef || "my-work feedback",
            source_type: "feedback",
            my_attempt: "",
          }),
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
          setResult(null);
          setLookupError(null);
          setLoading(true);
          setOpen(true);
        }}
        title="Tra nghĩa nhanh và lưu cụm từ này vào Sổ từ"
        className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-xs text-text-muted transition hover:border-teal-500 hover:text-teal-700"
      >
        <Icon name="bookmark" className="h-3 w-3" />
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
        <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-text-secondary">
          &quot;{text}&quot;
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-text-secondary">
            <Spinner size="sm" label="Đang tra cứu" />
            Đang tra cứu chuyên ngành y khoa…
          </div>
        ) : lookupError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {lookupError}
          </p>
        ) : result ? (
          <div className="space-y-2 text-sm">
            <p className="font-bold text-text">{result.phrase}</p>
            {result.ipa ? (
              <p className="font-mono text-xs text-indigo-600">
                /{result.ipa.replace(/^\/|\/$/g, "")}/
              </p>
            ) : null}
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-text">
              {result.context_meaning}
            </p>
            {result.example_sentence ? (
              <p className="text-xs italic text-text-muted">
                &ldquo;{result.example_sentence}&rdquo;
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
