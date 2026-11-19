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
