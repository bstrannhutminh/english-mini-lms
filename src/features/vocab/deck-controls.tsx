"use client";
import { Button, Icon } from "@/components/ui";

interface DeckControlsProps {
  canUndo: boolean;
  disabled: boolean;
  onDontKnow: () => void;
  onUndo: () => void;
  onFlip: () => void;
  onKnow: () => void;
}

/** Nút chấm thẻ cỡ lớn (Chưa thuộc / Đã thuộc) + hàng phụ Hoàn tác / Lật thẻ. */
export function DeckControls({ canUndo, disabled, onDontKnow, onUndo, onFlip, onKnow }: DeckControlsProps) {
  return <div className="space-y-2">
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" size="lg" className="min-h-16 whitespace-nowrap rounded-2xl border-border-strong bg-surface px-2 text-base font-semibold text-text hover:bg-surface-subtle sm:px-5" disabled={disabled} onClick={onDontKnow}><Icon name="x" className="h-5 w-5 text-red-600" />Chưa thuộc</Button>
      <Button size="lg" className="min-h-16 whitespace-nowrap rounded-2xl px-2 text-base font-semibold sm:px-5" disabled={disabled} onClick={onKnow}><Icon name="check" className="h-5 w-5" />Đã thuộc</Button>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Button variant="ghost" className="min-h-12 rounded-xl" disabled={!canUndo || disabled} onClick={onUndo}><Icon name="arrow-left" className="h-4 w-4" />Hoàn tác</Button>
      <Button variant="ghost" className="min-h-12 rounded-xl" disabled={disabled} onClick={onFlip}><Icon name="refresh" className="h-4 w-4" />Lật thẻ</Button>
    </div>
    <p className="hidden text-center text-sm text-text-muted sm:block">← Chưa thuộc · → Đã thuộc · Space lật · Z hoàn tác</p>
  </div>;
}
