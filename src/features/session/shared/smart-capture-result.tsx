"use client";

import { YouGlishButton } from "@/features/vocab/youglish-button";

export interface CapturedResult {
  phrase: string;
  ipa: string;
  context_meaning: string;
  example_sentence: string;
}

interface SmartCaptureResultProps {
  data: CapturedResult;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
}

/** Kết quả tra cứu quick-capture + nút lưu vào Sổ từ (1-click). */
export function SmartCaptureResult({
  data,
  isSaving,
  isSaved,
  onSave,
}: SmartCaptureResultProps) {
  return (
    <div>
      {/* Cụm từ & Phiên âm */}
      <div className="mb-2">
        <div className="break-words text-base font-bold text-slate-900">{data.phrase}</div>
        {data.ipa && (
          <div className="font-mono text-base text-primary-dark">
            /{data.ipa.replace(/^\/|\/$/g, "")}/
          </div>
        )}
      </div>

      {/* Nghĩa chuyên ngành */}
      <div className="mb-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
        <div className="mb-0.5 text-base font-semibold text-slate-600">
          Nghĩa trong ngữ cảnh:
        </div>
        <div className="break-words text-base font-medium text-slate-800">
          {data.context_meaning}
        </div>
      </div>

      {/* Câu ví dụ */}
      {data.example_sentence && (
        <div className="mb-3 text-base italic text-slate-500">
          &ldquo;{data.example_sentence}&rdquo;
        </div>
      )}

      {/* Nghe người bản xứ nói cụm từ này (YouGlish) — mở modal, không nhúng sẵn */}
      <div className="mb-2">
        <YouGlishButton
          query={data.phrase}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-base font-medium text-primary-dark transition hover:bg-primary-soft"
        />
      </div>

      {/* Nút 1-click Lưu vào sổ */}
      <button
        onClick={onSave}
        disabled={isSaving || isSaved}
        className={`flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-base font-semibold text-white transition-colors ${
          isSaved ? "bg-primary-dark" : "bg-primary"
        } ${isSaving || isSaved ? "cursor-default" : "cursor-pointer"}`}
      >
        {isSaved ? (
          <>
            <span>✓</span> Đã lưu vào Sổ từ!
          </>
        ) : isSaving ? (
          "Đang lưu..."
        ) : (
          <>
            Lưu vào Sổ từ
          </>
        )}
      </button>
    </div>
  );
}
