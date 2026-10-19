import { describe, it, expect, vi, beforeEach } from "vitest";

const getCurrentLearner = vi.fn();
vi.mock("@/server/auth", () => ({ getCurrentLearner: () => getCurrentLearner() }));

import * as activitiesRoute from "@/app/api/v1/admin/content/activities/route";
import * as activityIdRoute from "@/app/api/v1/admin/content/activities/[id]/route";
import * as sourcesRoute from "@/app/api/v1/admin/content/sources/route";
import * as sourceIdRoute from "@/app/api/v1/admin/content/sources/[id]/route";
import * as segmentsRoute from "@/app/api/v1/admin/content/segments/route";
import * as segmentIdRoute from "@/app/api/v1/admin/content/segments/[id]/route";
import * as dashboardRoute from "@/app/api/v1/admin/dashboard/route";

const jsonReq = (method: string, body: unknown = {}) =>
  new Request("http://localhost/api/v1/admin/content/x", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
// withAdmin nhận NextRequest — Request thường đủ cho các route này vì handler
// chỉ đọc url/json body (không đụng NextRequest extension).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asNext = (r: Request) => r as any;
const ctx = { params: Promise.resolve({ id: "W1" }) };

describe("API quản lý nội dung — chỉ admin (withAdmin, guard nằm trong try)", () => {
  beforeEach(() => getCurrentLearner.mockReset());

  it("chưa đăng nhập → 401 envelope; learner → 403 envelope", async () => {
    getCurrentLearner.mockResolvedValue(null);
    let res = await dashboardRoute.GET(asNext(new Request("http://localhost/x")));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("unauthorized");

    getCurrentLearner.mockResolvedValue({ role: "learner" });
    res = await dashboardRoute.GET(asNext(new Request("http://localhost/x")));
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("forbidden");
  });

  it("getCurrentLearner throw (vd thiếu env) → lỗi được map, không vỡ route", async () => {
    const envErr = new Error("Thiếu biến môi trường");
    envErr.name = "EnvError";
    getCurrentLearner.mockRejectedValueOnce(envErr);
    const res = await dashboardRoute.GET(asNext(new Request("http://localhost/x")));
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe("service_unavailable");
  });

  it("mọi route trả 403 cho non-admin (GET/POST/PATCH)", async () => {
    getCurrentLearner.mockResolvedValue({ role: "learner" });
    const results = await Promise.all([
      activitiesRoute.GET(asNext(new Request("http://localhost/x?state=all"))),
      activitiesRoute.POST(asNext(jsonReq("POST"))),
      activityIdRoute.PATCH(asNext(jsonReq("PATCH")), ctx),
      sourcesRoute.GET(asNext(new Request("http://localhost/x"))),
      sourcesRoute.POST(asNext(jsonReq("POST"))),
      sourceIdRoute.PATCH(asNext(jsonReq("PATCH")), ctx),
      segmentsRoute.GET(asNext(new Request("http://localhost/x"))),
      segmentsRoute.POST(asNext(jsonReq("POST"))),
      segmentIdRoute.PATCH(asNext(jsonReq("PATCH")), ctx),
    ]);
    for (const res of results) expect(res.status).toBe(403);
  });

  it("KHÔNG route nào export DELETE/PUT (không cho xoá vật lý)", () => {
    for (const mod of [activitiesRoute, activityIdRoute, sourcesRoute, sourceIdRoute, segmentsRoute, segmentIdRoute]) {
      expect(Object.keys(mod)).not.toContain("DELETE");
      expect(Object.keys(mod)).not.toContain("PUT");
    }
  });

  it("admin gửi dữ liệu sai → 422 kèm fields theo tên field (chưa chạm DB)", async () => {
    getCurrentLearner.mockResolvedValue({ role: "admin" });
    const res = await activitiesRoute.POST(asNext(jsonReq("POST", { id: "X1", mode: "bad", title: "" })));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("validation_failed");
    expect(Object.keys(json.error.fields ?? {})).toEqual(
      expect.arrayContaining(["id", "mode"])
    );
  });

  it("GET state không hợp lệ → 422", async () => {
    getCurrentLearner.mockResolvedValue({ role: "admin" });
    const res = await activitiesRoute.GET(asNext(new Request("http://localhost/x?state=deleted")));
    expect(res.status).toBe(422);
  });

  it("body không phải JSON → 400 invalid_json", async () => {
    getCurrentLearner.mockResolvedValue({ role: "admin" });
    const res = await activitiesRoute.POST(
      asNext(new Request("http://localhost/x", { method: "POST", body: "{bad" }))
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_json");
  });
});
