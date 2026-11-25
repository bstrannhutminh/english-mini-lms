/**
 * Nhịp 7 ngày + lời chào của màn Hôm nay — hàm thuần, tính theo giờ Việt Nam.
 * Bảo vệ: chỉ phiên đã hoàn thành mới được đánh dấu "đã học" (không suy diễn).
 */
import { describe, expect, it } from "vitest";
import { buildWeekActivity, computeWeekMinutes } from "@/server/today/streak";
import { buildTodayGreeting } from "@/features/today/today-greeting";
import { todayRecommendationSchema } from "@/contracts/today";

// Thứ Bảy 21/11/2026 20:00 giờ VN.
const NOW = new Date("2026-11-21T13:00:00Z");

describe("buildWeekActivity", () => {
  it("trả đúng 7 ngày kết thúc ở hôm nay, có nhãn thứ tiếng Việt", () => {
    const week = buildWeekActivity([], NOW);
    expect(week).toHaveLength(7);
    expect(week.map((d) => d.label)).toEqual(["CN", "T2", "T3", "T4", "T5", "T6", "T7"]);
    expect(week[0].date).toBe("2026-11-15");
    expect(week[6]).toMatchObject({ date: "2026-11-21", isToday: true, studied: false });
    expect(week.filter((d) => d.isToday)).toHaveLength(1);
  });

  it("đánh dấu ngày có phiên hoàn thành theo ngày lịch Việt Nam", () => {
    // 18:30 UTC ngày 18/11 = 01:30 ngày 19/11 giờ VN → thuộc T5 (19/11).
    const week = buildWeekActivity([new Date("2026-11-18T18:30:00Z")], NOW);
    expect(week.find((d) => d.date === "2026-11-19")?.studied).toBe(true);
    expect(week.find((d) => d.date === "2026-11-18")?.studied).toBe(false);
  });

  it("bỏ qua phiên cũ hơn 7 ngày", () => {
    const week = buildWeekActivity([new Date("2026-11-01T05:00:00Z")], NOW);
    expect(week.some((d) => d.studied)).toBe(false);
  });
});

describe("computeWeekMinutes", () => {
  it("cộng phút các phiên trong band 7 ngày lịch VN", () => {
    // 14/11 18:30 UTC = 15/11 01:30 giờ VN → ngày đầu band (15–21/11).
    const minutes = computeWeekMinutes(
      [
        { updatedAt: new Date("2026-11-14T18:30:00Z"), activeSeconds: 600 },
        { updatedAt: NOW, activeSeconds: 300 },
      ],
      NOW
    );
    expect(minutes).toBe(15);
  });

  it("loại phiên thuộc ngày lịch thứ 8 dù còn trong 168h trượt", () => {
    // 14/11 16:00 UTC = 14/11 23:00 giờ VN: cách NOW 165h (<168h, code cũ
    // tính nhầm) nhưng thuộc ngày 14/11 — ngoài band 15–21/11.
    const minutes = computeWeekMinutes(
      [{ updatedAt: new Date("2026-11-14T16:00:00Z"), activeSeconds: 900 }],
      NOW
    );
    expect(minutes).toBe(0);
  });

  it("bỏ qua activeSeconds null và làm tròn phút", () => {
    const minutes = computeWeekMinutes(
      [
        { updatedAt: NOW, activeSeconds: null },
        { updatedAt: NOW, activeSeconds: 89 },
      ],
      NOW
    );
    expect(minutes).toBe(1);
  });
});

describe("buildTodayGreeting", () => {
  it("chọn lời chào theo buổi giờ Việt Nam", () => {
    expect(buildTodayGreeting(new Date("2026-11-21T00:30:00Z")).greeting).toBe("Chào buổi sáng"); // 07:30
    expect(buildTodayGreeting(new Date("2026-11-21T05:00:00Z")).greeting).toBe("Chào buổi trưa"); // 12:00
    expect(buildTodayGreeting(new Date("2026-11-21T08:00:00Z")).greeting).toBe("Chào buổi chiều"); // 15:00
    expect(buildTodayGreeting(NOW).greeting).toBe("Chào buổi tối"); // 20:00
  });

  it("dòng ngày viết hoa chữ đầu và có ngày/tháng", () => {
    const { dateLabel } = buildTodayGreeting(NOW);
    expect(dateLabel.charAt(0)).toBe(dateLabel.charAt(0).toUpperCase());
    expect(dateLabel).toContain("21");
    expect(dateLabel).toContain("11");
  });
});

describe("todayRecommendationSchema — trường nhịp tuần là bổ sung", () => {
  it("payload cũ thiếu weekActivity/weekMinutes vẫn hợp lệ với mặc định rỗng", () => {
    const parsed = todayRecommendationSchema.parse({
      learnerName: "BS. Minh", baselineStatus: "completed", targetMinutes: 30, reason: "",
      recommendedActivity: null, alternateActivities: [], dueVocabCount: 0,
      leastPracticedSkill: "Viết", streakDays: 0, inProgressSession: null, dailyPlan: [],
    });
    expect(parsed.weekActivity).toEqual([]);
    expect(parsed.weekMinutes).toBe(0);
  });
});
