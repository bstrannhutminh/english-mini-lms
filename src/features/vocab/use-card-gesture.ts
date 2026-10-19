"use client";

/**
 * useCardGesture — cử chỉ kéo-thả của thẻ flashcard (giữ nguyên từ bản cũ):
 *  - PointerDown/Move/Up bằng setPointerCapture → kéo ngang mượt cả touch lẫn chuột
 *  - Kéo > 8px mới tính là drag; kéo ngang > 80px → quyết định (phải/trái)
 *  - Chạm ngắn không di chuyển → lật thẻ
 *  - Khoá scroll dọc khi kéo ngang chủ đạo (touch-action: pan-y ở flashcard.tsx)
 */
import { useState, useRef, useCallback } from "react";

const SWIPE_THRESHOLD_PX = 80;
const DRAG_START_PX = 8;

export interface CardGestureOptions {
  /** Khoá cử chỉ (đang lưu batch / đang bay thẻ / đã kết thúc). */
  disabled: boolean;
  /** Chạm ngắn → lật thẻ. */
  onTapFlip: () => void;
  /** Vuốt phải → "Đã thuộc". */
  onSwipeRight: () => void;
  /** Vuốt trái → "Chưa thuộc". */
  onSwipeLeft: () => void;
}

export function useCardGesture({
  disabled,
  onTapFlip,
  onSwipeRight,
  onSwipeLeft,
}: CardGestureOptions) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);

  /** Đưa thẻ về vị trí gốc (gọi sau khi hiệu ứng bay kết thúc hoặc undo). */
  const resetDrag = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    dragStartRef.current = null;
    hasMovedRef.current = false;
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > DRAG_START_PX) hasMovedRef.current = true;
    // Khoá scroll dọc khi đang kéo ngang chủ đạo
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragOffset({ x: dx, y: dy * 0.15 });
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Bỏ qua nếu capture đã mất
    }

    if (!hasMovedRef.current) {
      // Nhấn chạm ngắn → lật thẻ
      onTapFlip();
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    // Ngưỡng vuốt ngang
    if (dragOffset.x > SWIPE_THRESHOLD_PX) {
      onSwipeRight();
    } else if (dragOffset.x < -SWIPE_THRESHOLD_PX) {
      onSwipeLeft();
    }
    // Snap offset về 0: khi vuốt thành công, transform "bay" (flyDirection)
    // đã nhận điều khiển vị trí thẻ nên việc reset không gây giật hình;
    // khi chưa đạt ngưỡng, transition CSS đưa thẻ trượt về giữa.
    setDragOffset({ x: 0, y: 0 });
    dragStartRef.current = null;
  };

  const onPointerCancel = () => {
    resetDrag();
  };

  return {
    dragOffset,
    isDragging,
    resetDrag,
    cardHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
