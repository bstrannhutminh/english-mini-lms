/** Trạng thái làm bài của mode Viết — shell giữ opaque, plugin thu hẹp ở đây. */
export interface WritingModeState {
  /** Nội dung bài viết (khởi tạo từ draft hoặc body bản cha khi sửa lại). */
  text: string;
  /** Mở rộng khung đối chiếu Bản 1. */
  showParentRef: boolean;
}
