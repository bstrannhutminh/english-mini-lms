/**
 * computeStreakDays — số ngày học liên tiếp tính từ các phiên "completed"
 * (mốc ngày theo giờ VN, giống startOfTodayVietnam). Hàm thuần trừ việc đọc
 * `new Date()` hiện tại — truyền completedDates đã sort không bắt buộc.
 */
export function computeStreakDays(
  completedDates: Date[],
  timeZone = "Asia/Ho_Chi_Minh"
): number {
  if (completedDates.length === 0) return 0;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const uniqueDays = Array.from(
    new Set(completedDates.map((d) => formatter.format(d)))
  ).sort().reverse();

  if (uniqueDays.length === 0) return 0;

  const today = new Date();
  const todayStr = formatter.format(today);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStr = formatter.format(yesterday);

  // Nếu ngày gần nhất không phải hôm nay và cũng không phải hôm qua thì chuỗi đã đứt
  const mostRecent = uniqueDays[0];
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let cursor = new Date(mostRecent === todayStr ? today : yesterday);

  for (const dayStr of uniqueDays) {
    const expectedStr = formatter.format(cursor);
    if (dayStr === expectedStr) {
      streak++;
      cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
    } else if (dayStr < expectedStr) {
      break;
    }
  }

  return streak;
}

/** Một ngày trong dải "7 ngày gần nhất" ở màn Hôm nay. */
export interface WeekDayActivity {
  /** YYYY-MM-DD theo giờ VN. */
  date: string;
  /** Nhãn thứ ngắn: T2…T7, CN. */
  label: string;
  /** Có ít nhất một phiên hoàn thành trong ngày. */
  studied: boolean;
  isToday: boolean;
}

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

/**
 * buildWeekActivity — 7 ngày gần nhất (kết thúc ở hôm nay, giờ VN) kèm cờ
 * "đã học". Hàm thuần: cùng cách tính ngày với computeStreakDays, chỉ phản
 * ánh phiên đã hoàn thành — không suy ra năng lực.
 */
export function buildWeekActivity(
  completedDates: Date[],
  now = new Date(),
  timeZone = "Asia/Ho_Chi_Minh"
): WeekDayActivity[] {
  const dayFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  const studiedDays = new Set(completedDates.map((d) => dayFormatter.format(d)));
  const todayStr = dayFormatter.format(now);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
    const date = dayFormatter.format(day);
    // Thứ của ngày lịch (UTC noon tránh lệch múi giờ khi dựng lại từ chuỗi).
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    return {
      date,
      label: WEEKDAY_LABELS[weekday],
      studied: studiedDays.has(date),
      isToday: date === todayStr,
    };
  });
}
