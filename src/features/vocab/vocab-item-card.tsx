"use client";

import { useState } from "react";
import { Button, Icon, useToast } from "@/components/ui";
import type { VocabularyItem } from "@/contracts/vocabulary";
import { patchVocabulary } from "./api";
import { daysUntilDue, formatMastery, isDueNow, isMastered } from "./mastery";
import { YouGlishButton } from "./youglish-button";

interface VocabItemCardProps {
  item: VocabularyItem;
  expanded: boolean;
  onToggleExpand: () => void;
  /** Báo item đã đổi (sau PATCH) để list cập nhật state. */
  onItemChange: (updated: VocabularyItem) => void;
  /** data-tour cho thẻ đầu danh sách. */
  tourTarget?: string;
}

/**
 * Một thẻ từ trong Sổ từ — hiển thị đủ tuple 6 trường khi mở rộng:
 * cụm từ, IPA + nghĩa ngữ cảnh, câu trích gốc, nguồn (trang/timestamp),
 * "câu của tôi", và trạng thái ôn SRS (mastery x/5 + đến hạn).
 */
export function VocabItemCard({
  item,
  expanded,
  onToggleExpand,
  onItemChange,
  tourTarget,
}: VocabItemCardProps) {
  const toast = useToast();
  const [attemptText, setAttemptText] = useState(item.myAttempt ?? "");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [toggling, setToggling] = useState(false);

  const mastered = isMastered(item.masteryLevel);
  const due = isDueNow(item);
  const diffDays = daysUntilDue(item.dueAt);

  // Lưu "Câu của tôi" (my_attempt) — PATCH, lỗi → toast tiếng Việt
  async function handleSaveAttempt() {
    try {
      setSaving(true);
      const data = await patchVocabulary(item.id, {
        my_attempt: attemptText,
      });
      onItemChange(data.vocabulary);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      toast.error(
        "Lỗi khi lưu câu của bạn",
        err instanceof Error ? err.message : "Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  }

  // Đánh dấu đã thuộc (4/5) / chuyển về cần ôn (0/5)
  async function handleToggleMastered() {
    try {
      setToggling(true);
      const data = await patchVocabulary(item.id, {
        mastery_level: mastered ? 0 : 4,
      });
      onItemChange(data.vocabulary);
    } catch (err) {
      toast.error(
        "Không cập nhật được trạng thái thuộc từ",
        err instanceof Error ? err.message : "Vui lòng thử lại."
      );
    } finally {
      setToggling(false);
    }
  }

  return (
    <div
      data-tour={tourTarget}
      className={`bg-white rounded-2xl transition border overflow-hidden shadow-xs hover:shadow-sm ${
        due ? "border-amber-300 ring-1 ring-amber-200/50" : "border-slate-200/80"
      }`}
    >
      {/* Hàng tóm tắt (click để mở rộng/thu gọn) */}
      <div
        onClick={onToggleExpand}
        className={`p-4 sm:p-5 cursor-pointer flex items-start justify-between gap-3 transition ${
          expanded ? "bg-slate-50/70" : "bg-white"
        }`}
      >
        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              {item.phrase}
            </span>
            {item.ipa && (
              <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-mono border border-teal-200/60">
                /{item.ipa.replace(/^\/|\/$/g, "")}/
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {item.contextMeaning || "(Chưa có nghĩa ngữ cảnh)"}
          </div>
          {/* Thang mastery thống nhất x/5 */}
          <div className="text-[11px] font-semibold text-slate-400 tabular-nums">
            Mức nhớ {formatMastery(item.masteryLevel)}
          </div>
        </div>

        {/* Trạng thái SRS & chevron */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {mastered ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Icon name="check-circle" className="w-3 h-3 text-emerald-600" />
              <span>Đã thuộc</span>
            </span>
          ) : due || diffDays <= 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
              <Icon name="clock" className="w-3 h-3 text-amber-700" />
              <span>Đến hạn</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full tabular-nums">
              Ôn sau {diffDays} ngày
            </span>
          )}

          <span
            className={`text-slate-400 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <Icon name="chevron-down" className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Chi tiết mở rộng */}
      {expanded && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-4">
          {/* 1. Câu gốc trong tài liệu */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="book-open" className="w-3 h-3 text-teal-600" />
              <span>Câu gốc trong tài liệu y khoa:</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 italic">
              &ldquo;{item.originalSentence}&rdquo;
            </div>
          </div>

          {/* 2. Nguồn tham khảo & YouGlish */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {item.sourceRef ? (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Nguồn: {item.sourceRef}
              </span>
            ) : (
              <span />
            )}
            <YouGlishButton query={item.phrase} />
          </div>

          {/* 3. Ô "Câu của tôi" (my_attempt) */}
          <div className="space-y-1.5 pt-1">
            <label
              htmlFor={`attempt-${item.id}`}
              className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
            >
              <Icon name="pen" className="w-3.5 h-3.5 text-teal-700" />
              <span>Câu của tôi (thực hành áp dụng lâm sàng / giao tiếp):</span>
            </label>
            <textarea
              id={`attempt-${item.id}`}
              value={attemptText}
              onChange={(e) => setAttemptText(e.target.value)}
              placeholder="Tự đặt một câu tiếng Anh sử dụng cụm từ này trong bối cảnh công việc / phòng khám..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition leading-relaxed"
            />
          </div>

          {/* Nút lưu & đánh dấu */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <Button
              onClick={handleSaveAttempt}
              loading={saving}
              variant="primary"
              className={savedFlash ? "bg-emerald-700 hover:bg-emerald-700" : ""}
            >
              {savedFlash ? (
                <>
                  <Icon name="check-circle" className="w-4 h-4 text-emerald-300" />
                  <span>Đã lưu câu của tôi!</span>
                </>
              ) : (
                <>
                  <Icon name="save" className="w-4 h-4" />
                  <span>Lưu câu của tôi</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleToggleMastered}
              loading={toggling}
              variant="outline"
              className={
                mastered
                  ? "text-amber-800 border-amber-200 bg-amber-50 hover:bg-amber-100"
                  : "text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              }
            >
              <Icon name="check-circle" className="w-3.5 h-3.5" />
              <span>{mastered ? "Chuyển về cần ôn" : "Đánh dấu đã thuộc"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
