import type { VocabularyItem } from "@/contracts/vocabulary";
import { Icon } from "@/components/ui";
import { daysUntilDue, formatMastery, isDueNow, isMastered } from "./mastery";

export function VocabItemSummary({ item, expanded, onToggle }: {
  item: VocabularyItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dueDays = daysUntilDue(item.dueAt);
  const status = isMastered(item.masteryLevel) ? "Đã thuộc" : isDueNow(item) || dueDays <= 0 ? "Đến hạn ôn" : `Ôn sau ${dueDays} ngày`;
  return (
    <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={`vocab-detail-${item.id}`}
      className="flex min-h-11 w-full items-start gap-3 p-5 text-left transition-colors hover:bg-surface-muted">
      <span className="min-w-0 flex-1 space-y-2">
        <span className="block break-words text-lg font-semibold leading-snug text-text">{item.phrase}</span>
        {item.ipa && <span className="block text-base font-mono text-text-secondary">/{item.ipa.replace(/^\/|\/$/g, "")}/</span>}
        <span className="block break-words text-base leading-relaxed text-text-secondary">{item.contextMeaning || "Chưa có nghĩa ngữ cảnh"}</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1 text-base text-text-muted">
          <span className="tabular-nums">Mức nhớ {formatMastery(item.masteryLevel)}</span>
          <span>{status}</span>
        </span>
      </span>
      <Icon name="chevron-down" className={`mt-1 h-5 w-5 shrink-0 text-text-secondary transition-transform ${expanded ? "rotate-180" : ""}`} />
    </button>
  );
}
