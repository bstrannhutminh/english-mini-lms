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

export function DeckControls({ canUndo, disabled, onDontKnow, onUndo, onFlip, onKnow }: DeckControlsProps) {
  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" disabled={disabled} onClick={onDontKnow}><Icon name="x" className="h-4 w-4" />Chưa thuộc</Button>
      <Button disabled={disabled} onClick={onKnow}><Icon name="check" className="h-4 w-4" />Đã thuộc</Button>
    </div>
    <div className="flex justify-center gap-3">
      <Button variant="ghost" disabled={!canUndo || disabled} onClick={onUndo}>Hoàn tác</Button>
      <Button variant="ghost" disabled={disabled} onClick={onFlip}>Lật thẻ</Button>
    </div>
    <p className="hidden text-center text-base text-text-muted sm:block">← Chưa thuộc · → Đã thuộc · Space lật · Z hoàn tác</p>
  </div>;
}
