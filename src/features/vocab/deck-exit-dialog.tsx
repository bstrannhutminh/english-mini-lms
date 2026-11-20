import { Button, Modal } from "@/components/ui";

export function DeckExitDialog({ open, count, saving, failed, onSave, onDiscard, onCancel }: {
  open: boolean;
  count: number;
  saving: boolean;
  failed: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={saving ? undefined : onCancel} title="Giữ kết quả đợt ôn này?"
      description={`Bạn đã ôn ${count} từ. Chọn cách xử lý trước khi chuyển màn hoặc đổi bộ thẻ.`}
      footer={<>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Ôn tiếp</Button>
        <Button variant="outline" onClick={onDiscard} disabled={saving}>Bỏ kết quả</Button>
        <Button onClick={onSave} loading={saving}>Lưu và tiếp tục</Button>
      </>}>
      {failed && <p role="alert" className="text-base text-error">Chưa xác nhận lưu được kết quả. Bạn có thể thử lưu lại hoặc ở lại đợt ôn.</p>}
    </Modal>
  );
}
