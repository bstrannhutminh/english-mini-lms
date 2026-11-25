import type { VocabularyItem } from "@/contracts/vocabulary";
import { AutoResizeTextarea, Button, Icon } from "@/components/ui";
import { YouGlishButton } from "./youglish-button";

/** Phần mở rộng của thẻ từ: câu gốc + nguồn, nghe YouGlish, "Câu của tôi" và đánh dấu đã thuộc. */
export function VocabItemEditor({ item, attemptText, saving, saved, toggling, mastered, onTextChange, onSave, onToggleMastered }: {
  item: VocabularyItem;
  attemptText: string;
  saving: boolean;
  saved: boolean;
  toggling: boolean;
  mastered: boolean;
  onTextChange: (text: string) => void;
  onSave: () => void;
  onToggleMastered: () => void;
}) {
  return (
    <div id={`vocab-detail-${item.id}`} className="space-y-4 border-t border-border p-4 sm:p-5">
      <section className="space-y-2">
        <h3 className="eyebrow">Câu gốc đã lưu</h3>
        <p className="break-words rounded-xl bg-surface-muted p-4 text-base leading-relaxed text-text">
          {item.originalSentence || "Chưa có câu gốc."}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {item.sourceRef && <p className="min-w-0 break-words text-sm text-text-muted">Nguồn: {item.sourceRef}</p>}
          <YouGlishButton query={item.phrase} />
        </div>
      </section>
      <div className="space-y-2 border-t border-border pt-4">
        <label htmlFor={`attempt-${item.id}`} className="eyebrow block">Câu của tôi</label>
        <p className="text-base leading-relaxed text-text-secondary">Dùng cụm từ này trong một câu về công việc hoặc giao tiếp của bạn.</p>
        <AutoResizeTextarea id={`attempt-${item.id}`} value={attemptText} disabled={saving}
          onChange={(event) => onTextChange(event.target.value)} rows={2} maxHeight={240}
          placeholder="Viết câu tiếng Anh của bạn…" className="field-control w-full leading-relaxed" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onSave} loading={saving} disabled={toggling}>
          <Icon name={saved ? "check-circle" : "save"} className="h-4 w-4" />
          {saved ? "Đã lưu câu" : "Lưu câu của tôi"}
        </Button>
        <Button onClick={onToggleMastered} loading={toggling} disabled={saving} variant="outline">
          {mastered ? "Chuyển về cần ôn" : "Đánh dấu đã thuộc"}
        </Button>
      </div>
    </div>
  );
}
