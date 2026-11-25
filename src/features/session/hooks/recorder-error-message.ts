/**
 * Map lỗi getUserMedia/MediaRecorder (DOMException name) sang hướng dẫn
 * tiếng Việt cụ thể theo nền tảng. Hàm thuần — unit-test được, không để lộ
 * thông báo tiếng Anh kỹ thuật của trình duyệt cho learner.
 */

/** Nhận diện iOS/iPadOS từ chuỗi userAgent (iPadOS 13+ giả Macintosh). */
export function isIosUserAgent(userAgent: string, maxTouchPoints = 0): boolean {
  if (/iPad|iPhone|iPod/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

/** Hướng dẫn mở lại quyền micro theo nền tảng. */
function permissionGuide(isIos: boolean): string {
  if (isIos) {
    return (
      "Bạn đang chặn quyền micro. Trên iPhone/iPad: chạm biểu tượng " +
      "\u201CaA\u201D ở thanh địa chỉ → Cài đặt trang web (Website Settings) → " +
      "chọn Cho phép Microphone, rồi tải lại trang. Nếu vẫn không được, vào " +
      "Cài đặt → Safari → Microphone và bật cho trang này."
    );
  }
  return (
    "Bạn đang chặn quyền micro. Hãy chạm biểu tượng khoá/micro trên thanh " +
    "địa chỉ của trình duyệt, chọn Cho phép micro cho trang này, rồi tải lại " +
    "trang và thử lại."
  );
}

const GENERIC_MESSAGE =
  "Không mở được micro. Hãy kiểm tra quyền micro trong cài đặt trình duyệt " +
  "rồi bấm Thử lại.";

/**
 * Trả về thông báo tiếng Việt thân thiện cho lỗi truy cập micro.
 * `isIos` truyền vào để test dễ; production lấy từ userAgent thật.
 * Error do chính app ném sẵn tiếng Việt (vd. thiếu mediaDevices) thì giữ nguyên.
 */
export function recorderErrorMessage(err: unknown, isIos: boolean): string {
  // DOMException của getUserMedia/MediaRecorder → map theo name.
  const isDomException =
    typeof DOMException !== "undefined" && err instanceof DOMException;

  if (!isDomException && err instanceof Error) {
    // Chỉ giữ nguyên lỗi do chính app ném (tiếng Việt, mở đầu "Trình duyệt");
    // Error/TypeError tiếng Anh của trình duyệt vẫn rơi xuống thông báo chung.
    if (err.name === "Error" && err.message.startsWith("Trình duyệt")) {
      return err.message;
    }
  }

  const name = err instanceof Error ? err.name : "";

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return permissionGuide(isIos);
    case "NotFoundError":
    case "DevicesNotFoundError":
      return (
        "Không tìm thấy micro trên thiết bị này. Nếu bạn dùng tai nghe có " +
        "micro, hãy cắm/kết nối trước rồi bấm Thử lại."
      );
    case "NotReadableError":
    case "TrackStartError":
      return (
        "Micro đang bị ứng dụng khác chiếm (Zalo, FaceTime, cuộc gọi…). " +
        "Hãy đóng ứng dụng đó rồi bấm Thử lại."
      );
    case "OverconstrainedError":
      return (
        "Micro của thiết bị không đáp ứng được yêu cầu ghi âm. Hãy thử đổi " +
        "tai nghe/micro khác hoặc dùng thiết bị khác."
      );
    case "AbortError":
      return "Yêu cầu micro bị gián đoạn. Hãy bấm Thử lại.";
    default:
      return GENERIC_MESSAGE;
  }
}
