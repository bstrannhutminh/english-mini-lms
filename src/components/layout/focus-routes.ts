/**
 * Xác định các route chạy ở chế độ Tập trung (Focus Mode):
 * ẩn sidebar desktop, thanh trên và tab dưới mobile để tối đa không gian học
 * và tránh bấm nhầm thoát phiên khi đang ghi âm/viết bài hoặc thiết lập Onboarding.
 */
const FOCUS_PREFIXES = ["/learn/", "/onboarding"] as const;

export function isFocusRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return FOCUS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}
