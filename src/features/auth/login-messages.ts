/**
 * Map mã lỗi đăng nhập (query `?error=`, `?reason=`/`error_code=`, `?message=`)
 * → thông báo tiếng Việt thân thiện. Hàm thuần — unit-test được.
 *
 * Nguồn mã:
 *  - `error`: do /auth/callback tự gắn (auth_failed, missing_code, exchange_failed)
 *  - `reason`/`error_code`: mã chi tiết từ Supabase/Auth (otp_expired, …)
 *  - `message`: thông điệp tuỳ ý — hiển thị nguyên văn (React tự escape),
 *    cắt tối đa 300 ký tự để tránh chèn text dài.
 */

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed:
    "Đăng nhập thất bại. Liên kết có thể đã hết hạn, đã được sử dụng, hoặc được mở ở trình duyệt khác với trình duyệt đã yêu cầu link.",
  missing_code:
    "Liên kết đăng nhập không hợp lệ hoặc thiếu mã xác thực. Vui lòng gửi lại link mới.",
  exchange_failed:
    "Không xác thực được liên kết đăng nhập. Vui lòng gửi lại link mới và mở bằng đúng trình duyệt đã yêu cầu.",
};

const REASON_MESSAGES: Record<string, string> = {
  // Supabase error codes hay gặp với email OTP / magic link
  otp_expired:
    "Liên kết đăng nhập đã hết hạn. Vui lòng gửi lại link mới và mở ngay.",
  otp_disabled: "Đăng nhập bằng liên kết email đang bị tắt. Hãy dùng mật khẩu.",
  email_not_confirmed: "Tài khoản chưa được xác nhận email.",
  invalid_credentials: "Email hoặc mật khẩu không chính xác.",
  signup_disabled: "Hệ thống không mở đăng ký tài khoản mới.",
  over_request_rate_limit:
    "Bạn đã yêu cầu quá nhiều lần. Đợi vài phút rồi thử lại.",
  access_denied: "Truy cập bị từ chối. Vui lòng thử đăng nhập lại.",
};

const MAX_MESSAGE_LEN = 300;

export interface LoginErrorInput {
  error?: string | null;
  reason?: string | null;
  message?: string | null;
}

/**
 * Trả về thông báo hiển thị (null = không có lỗi cần báo).
 * Ưu tiên: reason (mã chi tiết) → error (mã tổng quát) → message tuỳ ý.
 */
export function loginErrorMessage(input: LoginErrorInput): string | null {
  const reason = input.reason?.trim();
  if (reason && REASON_MESSAGES[reason]) return REASON_MESSAGES[reason];

  const error = input.error?.trim();
  if (error && ERROR_MESSAGES[error]) return ERROR_MESSAGES[error];

  // Mã lạ nhưng vẫn có error → thông báo chung chung.
  if (error) return "Đăng nhập không thành công. Vui lòng thử lại.";

  const message = input.message?.trim();
  if (message) return message.slice(0, MAX_MESSAGE_LEN);

  return null;
}

/** Lỗi liên quan liên kết email → nên hiện gợi ý "mở bằng trình duyệt chính". */
export function isMagicLinkError(input: LoginErrorInput): boolean {
  const code = input.reason ?? input.error ?? "";
  return [
    "auth_failed",
    "missing_code",
    "exchange_failed",
    "otp_expired",
  ].includes(code);
}
