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
        <div className="text-base font-bold text-slate-900">{data.phrase}</div>
        {data.ipa && (
          <div className="font-mono text-[13px] text-indigo-500">
            /{data.ipa.replace(/^\/|\/$/g, "")}/
          </div>
        )}
      </div>

      {/* Nghĩa chuyên ngành */}
      <div className="mb-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
        <div className="mb-0.5 text-xs font-semibold text-slate-600">
          Nghĩa cơ xương khớp / lâm sàng:
        </div>
        <div className="text-sm font-medium text-slate-800">
          {data.context_meaning}
        </div>
      </div>

      {/* Câu ví dụ */}
      {data.example_sentence && (
        <div className="mb-3 text-xs italic text-slate-500">
          &ldquo;{data.example_sentence}&rdquo;
        </div>
      )}

      {/* Nghe người bản xứ nói cụm từ này (YouGlish) — mở modal, không nhúng sẵn */}
      <div className="mb-2">
        <YouGlishButton
          query={data.phrase}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        />
      </div>

      {/* Nút 1-click Lưu vào sổ */}
      <button
        onClick={onSave}
        disabled={isSaving || isSaved}
        className={`flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white transition-colors ${
          isSaved ? "bg-green-600" : "bg-indigo-600"
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
            <span>📥</span> Lưu vào sổ (1 ngày ôn)
          </>
        )}
      </button>
    </div>
  );
}
