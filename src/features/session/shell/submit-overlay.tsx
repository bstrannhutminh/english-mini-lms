"use client";
import { Modal, Spinner } from "@/components/ui";

/** Overlay toàn màn hình trong lúc chờ AI chấm (port từ writing view). */
export function SubmitOverlay({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Modal open title={title} description={description} showClose={false}>
      <div role="status" className="flex items-center gap-3 text-base text-text-secondary">
        <Spinner size="md" label="Đang gửi bài" />
        Giữ trang mở trong lúc gửi bài. Nếu có lỗi, nội dung sẽ được giữ để thử lại.
      </div>
    </Modal>
  );
}
