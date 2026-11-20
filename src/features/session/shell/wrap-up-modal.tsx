"use client";

import { Button, Icon, Modal } from "@/components/ui";

/** Khép khung học hoặc học thêm; không báo nháp đã lưu trước khi server xác nhận. */
export function SessionWrapUpModal({
  targetMinutes, isOpen, onSaveAndExit, onSubmit, onExtend,
  isSaving = false, canSubmit = true,
}: {
  targetMinutes: number;
  isOpen: boolean;
  onSaveAndExit: () => void;
  onSubmit?: () => void;
  onExtend: () => void;
  isSaving?: boolean;
  canSubmit?: boolean;
}) {
  return (
    <Modal
      open={isOpen}
      title={`Đã đến mốc ${targetMinutes} phút`}
      description="Đồng hồ đã dừng. Bạn có thể lưu nháp để học tiếp sau, nộp bài để nhận góp ý hoặc học thêm. Nếu lưu chưa thành công, hãy giữ trang và thử lại."
      showClose={false}
    >
      <div className="space-y-2.5">
        {onSubmit && (
          <Button fullWidth size="lg" onClick={onSubmit} disabled={!canSubmit || isSaving}>
            <Icon name="send" className="h-4 w-4" />
            Nộp bài & Nhận nhận xét
          </Button>
        )}
        <Button fullWidth size="lg" variant="secondary" onClick={onSaveAndExit} loading={isSaving}>
          {!isSaving && <Icon name="save" className="h-4 w-4" />}
          {isSaving ? "Đang lưu nháp..." : "Lưu nháp & Khép phiên"}
        </Button>
        <Button fullWidth variant="outline" onClick={onExtend} disabled={isSaving}>
          <Icon name="clock" className="h-4 w-4" />
          Học thêm 5 phút
        </Button>
      </div>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        Sau khi nộp, đọc góp ý rồi chọn <strong>Sửa lại ngay</strong> để tạo Bản 2.
      </p>
    </Modal>
  );
}
