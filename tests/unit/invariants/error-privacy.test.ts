/**
 * INVARIANT — lỗi & riêng tư:
 *  1. mapServiceError: lỗi nội bộ → 500 với thông điệp tiếng Việt CHUNG,
 *     KHÔNG rò message/stack nội bộ. Lỗi hạ tầng (EnvError, DB unreachable)
 *     → 503.
 *  2. /api/v1/health — liveness công khai TỐI GIẢN: chỉ {status, time},
 *     không env/DB/host/user/counts (kiểm cả source lẫn handler thật).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { mapServiceError } from "@/server/http/map-service-error";

async function bodyOf(res: Response) {
  return res.json();
}

describe("mapServiceError — không rò rỉ nội bộ", () => {
  it("lỗi DB nội bộ → 500, message tiếng Việt chung, không chứa chi tiết lỗi", async () => {
    const res = mapServiceError(
      new Error('pg: duplicate key value violates unique constraint "sub_pkey"')
    );
    expect(res.status).toBe(500);
    const body = await bodyOf(res);
    expect(body.error.code).toBe("internal_error");
    expect(body.error.message).toBe(
      "Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại."
    );
    expect(JSON.stringify(body)).not.toContain("duplicate key");
    expect(JSON.stringify(body)).not.toContain("sub_pkey");
  });

  it("lỗi không phải Error (throw string/object) → 500 chung", async () => {
    const res = mapServiceError("secret string thrown");
    expect(res.status).toBe(500);
    const body = await bodyOf(res);
    expect(JSON.stringify(body)).not.toContain("secret");
  });

  it("EnvError → 503 service_unavailable", async () => {
    const err = new Error("Thiếu biến môi trường: GEMINI_API_KEY");
    err.name = "EnvError";
    const res = mapServiceError(err);
    expect(res.status).toBe(503);
    const body = await bodyOf(res);
    expect(body.error.code).toBe("service_unavailable");
    expect(body.error.message).not.toContain("GEMINI_API_KEY");
  });

  it("lỗi kết nối DB → 503 (không phải 500)", async () => {
    const res = mapServiceError(
      new Error("connect ETIMEDOUT 10.0.0.1:5432")
    );
    expect(res.status).toBe(503);
  });
});

describe("/api/v1/health — liveness tối giản", () => {
  const routePath = path.resolve(
    process.cwd(),
    "src/app/api/v1/health/route.ts"
  );

  it("handler trả đúng {status, time} — không thêm field", async () => {
    const { GET } = await import("@/app/api/v1/health/route");
    const res = await GET();
    const body = await bodyOf(res);
    expect(Object.keys(body).sort()).toEqual(["status", "time"]);
    expect(body.status).toBe("ok");
    expect(() => new Date(body.time)).not.toThrow();
    // no-store để không cache liveness.
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("source không nhắc tới env/DB/user/host — không đường rò rỉ nào", () => {
    const src = readFileSync(routePath, "utf8");
    for (const banned of [
      "DATABASE_URL",
      "process.env",
      "getEnv",
      "count(",
      "hostname",
      "supabase",
    ]) {
      expect(src).not.toContain(banned);
    }
  });
});
