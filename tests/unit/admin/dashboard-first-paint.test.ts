import { describe, expect, it } from "vitest";
import { initialDashboardState } from "@/features/admin/dashboard-state";
import { toAdminDashboardContract } from "@/server/admin/dashboard-contract";
import type { AdminDashboardData } from "@/server/admin/service";

/**
 * Render đầu của /admin: có dữ liệu server → hiện ngay, không loading, không
 * fetch trùng lúc mount; dữ liệu server phải khớp contract của API (Date → ISO).
 */

const UUID_A = "11111111-1111-4111-8111-111111111111";
const UUID_B = "22222222-2222-4222-8222-222222222222";
const UUID_C = "33333333-3333-4333-8333-333333333333";

const usage = {
  month: "2026-11",
  totalRequests: 2,
  totalInputTokens: 20,
  totalOutputTokens: 20,
  totalEstimatedCostUsd: 0,
  actionBreakdown: [],
};

const serverData: AdminDashboardData = {
  activities: [
    {
      id: "W1",
      title: "Email xin tham dự hội nghị",
      mode: "writing",
      durationMinutes: 20,
      difficulty: null,
      reviewState: "approved",
      topic: null,
      updatedAt: new Date("2026-11-20T01:00:00.000Z"),
    },
  ],
  failedAssessments: [
    {
      id: UUID_A,
      submissionId: UUID_B,
      learnerId: UUID_C,
      learnerName: "BS. Minh",
      activityTitle: "Nghe đoạn hội nghị 60s",
      activityMode: "listening",
      runVersion: 1,
      status: "failed",
      createdAt: new Date("2026-11-19T01:47:54.000Z"),
      submissionBodySnippet: "…",
    },
  ],
  flaggedFeedback: [],
  usage,
};

describe("initialDashboardState", () => {
  it("không có dữ liệu server → loading và fetch lúc mount", () => {
    for (const none of [null, undefined]) {
      expect(initialDashboardState(none)).toEqual({ data: null, loading: true, shouldFetchOnMount: true });
    }
  });

  it("có dữ liệu server → hiện ngay, không loading, không fetch trùng", () => {
    const contract = toAdminDashboardContract(serverData);
    const state = initialDashboardState(contract);
    expect(state.data).toBe(contract);
    expect(state.loading).toBe(false);
    expect(state.shouldFetchOnMount).toBe(false);
  });
});

describe("toAdminDashboardContract", () => {
  it("đổi mọi Date sang chuỗi ISO đúng như JSON của API", () => {
    const contract = toAdminDashboardContract(serverData);
    expect(contract.activities[0].updatedAt).toBe("2026-11-20T01:00:00.000Z");
    expect(contract.failedAssessments[0].createdAt).toBe("2026-11-19T01:47:54.000Z");
    expect(JSON.parse(JSON.stringify(serverData)).activities[0].updatedAt).toBe(contract.activities[0].updatedAt);
  });

  it("không đưa toàn văn bài nộp xuống client (chỉ snippet)", () => {
    const withBody = {
      ...serverData,
      failedAssessments: [{ ...serverData.failedAssessments[0], submissionBody: "BÀI NỘP ĐẦY ĐỦ" }],
    } as unknown as AdminDashboardData;
    const json = JSON.stringify(toAdminDashboardContract(withBody));
    expect(json).not.toContain("BÀI NỘP ĐẦY ĐỦ");
  });

  it("dữ liệu lệch contract thì ném lỗi ở server (để trang rơi về tự tải)", () => {
    const bad = {
      ...serverData,
      failedAssessments: [{ ...serverData.failedAssessments[0], id: "không-phải-uuid" }],
    } as AdminDashboardData;
    expect(() => toAdminDashboardContract(bad)).toThrow();
  });
});
