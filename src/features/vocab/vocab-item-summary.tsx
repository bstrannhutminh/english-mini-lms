import type { VocabularyItem } from "@/contracts/vocabulary";
import { Badge, Icon } from "@/components/ui";
import { MASTERY_SCALE } from "@/lib/vocabulary-schedule";
import { clampMastery, daysUntilDue, formatMastery, isDueNow, isMastered } from "./mastery";

/** Hàng tóm tắt của thẻ từ: cụm từ, IPA, nghĩa, thanh mức nhớ và chip hạn ôn. Bấm để mở rộng. */
export function VocabItemSummary({ item, expanded, onToggle }: {
  item: VocabularyItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dueDays = daysUntilDue(item.dueAt);
  const mastered = isMastered(item.masteryLevel);
  const due = !mastered && (isDueNow(item) || dueDays <= 0);
  const status = mastered ? "Đã thuộc" : due ? "Đến hạn ôn" : `Ôn sau ${dueDays} ngày`;
  const level = clampMastery(item.masteryLevel);
  return (
    <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={`vocab-detail-${item.id}`}
      className="flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-2xl p-4 text-left transition-colors hover:bg-surface-muted sm:p-5">
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="break-words text-lg font-semibold leading-snug text-text">{item.phrase}</span>
          {item.ipa && <span className="break-all font-mono text-sm text-text-muted">/{item.ipa.replace(/^\/|\/$/g, "")}/</span>}
        </span>
        <span className="mt-1 block break-words text-base leading-relaxed text-text-secondary">{item.contextMeaning || "Chưa có nghĩa ngữ cảnh"}</span>
        <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Badge tone={mastered ? "success" : due ? "warning" : "neutral"}>
            {mastered ? <Icon name="check" className="h-3.5 w-3.5" /> : <Icon name="clock" className="h-3.5 w-3.5" />}{status}
          </Badge>
          <span className="inline-flex items-center gap-2 text-sm text-text-muted">
            <span aria-hidden="true" className="inline-flex gap-1">
              {Array.from({ length: MASTERY_SCALE }, (_, index) => (
                <span key={index} className={`h-1.5 w-4 rounded-full ${index < level ? (mastered ? "bg-emerald-500" : "bg-primary") : "bg-slate-200"}`} />
              ))}
            </span>
            <span className="tabular-nums"><span className="sr-only sm:not-sr-only">Mức nhớ </span>{formatMastery(item.masteryLevel)}</span>
          </span>
        </span>
      </span>
      <Icon name="chevron-down" className={`mt-1 h-5 w-5 shrink-0 text-text-secondary transition-transform ${expanded ? "rotate-180" : ""}`} />
    </button>
  );
}
