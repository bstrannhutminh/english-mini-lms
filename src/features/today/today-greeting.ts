/**
 * buildTodayGreeting — lời chào theo buổi và dòng ngày (giờ Việt Nam).
 * Tính trên server rồi truyền xuống client để HTML đầu và bản hydrate khớp
 * nhau bất kể múi giờ của máy chủ/thiết bị.
 */
const TIME_ZONE = "Asia/Ho_Chi_Minh";

export interface TodayGreeting {
  /** "Chào buổi sáng" | "Chào buổi trưa" | "Chào buổi chiều" | "Chào buổi tối". */
  greeting: string;
  /** Ví dụ "Thứ Bảy, 21 tháng 11". */
  dateLabel: string;
}

export function buildTodayGreeting(now = new Date()): TodayGreeting {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", hourCycle: "h23" }).format(now)
  );
  const greeting =
    hour < 11 ? "Chào buổi sáng" : hour < 14 ? "Chào buổi trưa" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const formatted = new Intl.DateTimeFormat("vi-VN", {
    timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long",
  }).format(now);
  return { greeting, dateLabel: formatted.charAt(0).toUpperCase() + formatted.slice(1) };
}
