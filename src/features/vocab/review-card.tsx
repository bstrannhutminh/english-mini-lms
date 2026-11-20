"use client";

import type { ReviewVocabItem } from "@/contracts/vocabulary";
import { formatMastery } from "./mastery";

export type ResponseMode = "text" | "voice";

interface ReviewCardProps {
  item: ReviewVocabItem;
  responseMode: ResponseMode;
  userText: string;
  submitting: boolean;
  onModeChange: (mode: ResponseMode) => void;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
}

/** Thẻ thử thách micro-challenge: prompt + toggle Gõ chữ/Giọng nói + nộp. */
export function ReviewCard({
  item,
  responseMode,
  userText,
  submitting,
  onModeChange,
  onTextChange,
  onSubmit,
}: ReviewCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6  space-y-5">
      <div className="border-b pb-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-base uppercase font-semibold tracking-wider text-slate-400">
            Thử thách Micro-challenge
          </span>
          <span className="text-base bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
            Mức nhớ {formatMastery(item.masteryLevel)}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-semibold text-slate-900">{item.phrase}</h2>
          {item.ipa && (
            <span className="text-base text-slate-500 font-mono">{item.ipa}</span>
          )}
        </div>
        {item.contextMeaning && (
          <p className="text-base text-indigo-700 font-medium">
            Nghĩa ngữ cảnh: {item.contextMeaning}
          </p>
        )}
      </div>

      {/* Ngữ cảnh gốc */}
      {item.originalSentence && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-base text-slate-600">
          <span className="font-semibold text-slate-700 block mb-1">
            Câu gốc đã lưu:
          </span>
          <p className="italic font-sans text-slate-700">
            &quot;{item.originalSentence}&quot;
          </p>
        </div>
      )}

      {/* Đề bài thử thách */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-base text-blue-900 space-y-1">
        <div className="font-semibold flex items-center gap-1 text-blue-800">
          <span>🎯</span> Yêu cầu thử thách:
        </div>
        <p className="leading-relaxed">
          Dùng cụm từ <strong className="underline">{item.phrase}</strong> trong
          1 câu tiếng Anh về bối cảnh công việc thực tế (khám bệnh, trao đổi ca
          bệnh, hoặc hội nghị chuyên môn).
        </p>
      </div>

      {/* Form nhập câu trả lời */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-base">
          <span className="font-semibold text-slate-700">Câu trả lời của bạn:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              disabled={submitting}
              onClick={() => onModeChange("text")}
              className={`px-2.5 py-1 rounded text-base font-semibold transition min-h-11 ${
                responseMode === "text"
                  ? "bg-white text-slate-800 "
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Gõ chữ ✍️
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onModeChange("voice")}
              className={`px-2.5 py-1 rounded text-base font-semibold transition min-h-11 ${
                responseMode === "voice"
                  ? "bg-white text-slate-800 "
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Đọc chính tả
            </button>
          </div>
        </div>

        <textarea
          id={`review-response-${item.id}`}
          aria-label="Câu trả lời của bạn"
          disabled={submitting}
          value={userText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`Ví dụ: The patient presented with ${item.phrase} following acute trauma...`}
          rows={3}
          className="w-full text-base p-3 border border-border-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
        />

        {responseMode === "voice" && (
          <p className="text-base text-slate-500 italic">
            💡 Mẹo: Bạn có thể dùng tính năng đọc chính tả (Dictation / Mic)
            tích hợp sẵn trên bàn phím điện thoại để nói trực tiếp vào ô văn
            bản trên.
          </p>
        )}

        <button
          onClick={onSubmit}
          disabled={submitting || !userText.trim()}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-xl text-base transition   disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="animate-spin">⏳</span> Gemini đang nhận xét
              cách dùng từ...
            </>
          ) : (
            <>
              <span>🚀</span> Gửi câu trả lời để chấm
            </>
          )}
        </button>
      </div>
    </div>
  );
}
