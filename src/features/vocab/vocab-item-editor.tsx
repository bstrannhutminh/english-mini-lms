import type { VocabularyItem } from "@/contracts/vocabulary";
import { Button, Icon } from "@/components/ui";
import { YouGlishButton } from "./youglish-button";

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
    <div id={`vocab-detail-${item.id}`} className="space-y-5 border-t border-border p-5">
      <section className="space-y-2">
        <h3 className="text-base font-medium text-text">Câu gốc đã lưu</h3>
        <p className="break-words rounded-lg bg-surface-muted p-4 text-base leading-relaxed text-text-secondary">
          {item.originalSentence || "Chưa có câu gốc."}
        </p>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {item.sourceRef && <p className="min-w-0 break-words text-base text-text-secondary">Nguồn: {item.sourceRef}</p>}
        <YouGlishButton query={item.phrase} />
      </div>
      <div className="space-y-2">
        <label htmlFor={`attempt-${item.id}`} className="block text-base font-medium text-text">Câu của tôi</label>
        <p className="text-base leading-relaxed text-text-secondary">Dùng cụm từ này trong một câu về công việc hoặc giao tiếp của bạn.</p>
        <textarea id={`attempt-${item.id}`} value={attemptText} disabled={saving}
          onChange={(event) => onTextChange(event.target.value)} rows={3}
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
