"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { Modal } from "./modal";

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  /** Mô tả/cảnh báo — giải thích hậu quả hành động. */
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" cho hành động huỷ/xoá/đăng xuất. */
  tone?: "default" | "danger";
  /** Đang xử lý sau khi bấm xác nhận — khoá cả hai nút. */
  loading?: boolean;
  onConfirm: () => void;
  /** Bắt buộc: đóng/huỷ dialog (ESC + nút Huỷ + click nền đều gọi đây). */
  onCancel: () => void;
}

/**
 * Hộp xác nhận thay cho window.confirm — luôn có đường huỷ rõ ràng.
 * Dùng: `const [open, setOpen] = useState(false)` + ConfirmDialog open={open}.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
