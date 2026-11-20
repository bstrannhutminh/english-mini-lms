"use client";

import { useState } from "react";
import { useToast } from "@/components/ui";
import type { VocabularyItem } from "@/contracts/vocabulary";
import { patchVocabulary } from "./api";
import { isDueNow, isMastered } from "./mastery";
import { VocabItemSummary } from "./vocab-item-summary";
import { VocabItemEditor } from "./vocab-item-editor";

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

  // Lưu "Câu của tôi" (my_attempt) — PATCH, lỗi → toast tiếng Việt
  async function handleSaveAttempt() {
    if (saving || toggling) return;
    setSavedFlash(false);
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
    <article data-tour={tourTarget} className={`overflow-hidden rounded-xl border bg-surface ${due ? "border-amber-200" : "border-border"}`}>
      <VocabItemSummary item={item} expanded={expanded} onToggle={onToggleExpand} />
      {expanded && <VocabItemEditor item={item} attemptText={attemptText} saving={saving} saved={savedFlash}
        toggling={toggling} mastered={mastered} onTextChange={setAttemptText} onSave={handleSaveAttempt} onToggleMastered={handleToggleMastered} />}
    </article>
  );
}
