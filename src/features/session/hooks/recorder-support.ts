/**
 * Hàm thuần phát hiện khả năng/bối cảnh ghi âm của trình duyệt —
 * tách khỏi use-recorder để hook chỉ giữ logic trạng thái.
 */

/** MIME ưu tiên opus webm; iOS Safari chỉ hiểu audio/mp4. */
export function pickRecorderMimeType(): string {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4"; // iOS Safari
  if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
    return "audio/ogg;codecs=opus";
  }
  return "audio/webm";
}

/** Trình duyệt in-app (Zalo/FB/Line) thường chặn/không hỗ trợ micro đúng chuẩn. */
export function isInAppUserAgent(userAgent: string): boolean {
  return /Zalo/i.test(userAgent) || /FBAV|FBAN|Line/i.test(userAgent);
}
