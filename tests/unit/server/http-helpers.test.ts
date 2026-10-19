import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const getCurrentLearner = vi.fn();
vi.mock("@/server/auth", () => ({
  getCurrentLearner: () => getCurrentLearner(),
}));

import { apiError } from "@/server/http/api-error";
import { mapServiceError } from "@/server/http/map-service-error";
import { parseJson } from "@/server/http/parse-json";
import { ApiRouteError } from "@/server/http/errors";
import { withLearner } from "@/server/http/with-learner";
import { withAdmin } from "@/server/http/with-admin";

function jsonReq(body: unknown): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function bodyOf(res: Response) {
  return res.json();
}

describe("apiError", () => {
  it("returns the unified envelope with status", async () => {
    const res = apiError("unauthorized", "Chưa đăng nhập", 401);
    expect(res.status).toBe(401);
    const body = await bodyOf(res);
    expect(body).toEqual({
      error: { code: "unauthorized", message: "Chưa đăng nhập" },
    });
  });

  it("includes fields and top-level extras when given", async () => {
    const res = apiError("conflict", "Đang có phiên", 409, {
      fields: { activityId: "đang mở" },
      extra: { sessionId: "abc" },
    });
    const body = await bodyOf(res);
    expect(body.error.fields.activityId).toBe("đang mở");
    expect(body.sessionId).toBe("abc");
  });
});

describe("parseJson", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("returns parsed data on valid input", async () => {
    const data = await parseJson(jsonReq({ name: "Minh" }), schema);
    expect(data.name).toBe("Minh");
  });

  it("throws 422 ApiRouteError with per-field messages on invalid input", async () => {
    try {
      await parseJson(jsonReq({ name: "" }), schema);
      expect.unreachable();
    } catch (e) {
      const err = e as ApiRouteError;
      expect(err).toBeInstanceOf(ApiRouteError);
      expect(err.status).toBe(422);
      expect(err.fields?.name).toBeTruthy();
    }
  });

  it("throws 400 on malformed JSON", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: "{bad json",
    });
    await expect(parseJson(req, schema)).rejects.toMatchObject({
      status: 400,
      code: "invalid_json",
    });
  });
});

describe("mapServiceError", () => {
  it("maps ApiRouteError through", async () => {
    const res = mapServiceError(
      new ApiRouteError(403, "forbidden", "Không có quyền")
    );
    expect(res.status).toBe(403);
    expect((await bodyOf(res)).error.code).toBe("forbidden");
  });

  it("maps errors carrying statusCode (service ValidationError pattern)", async () => {
    const err = new Error("Thiếu trường bắt buộc") as Error & {
      statusCode: number;
    };
    err.statusCode = 422;
    const res = mapServiceError(err);
    expect(res.status).toBe(422);
    expect((await bodyOf(res)).error.code).toBe("validation_failed");
  });

  it("maps ConflictError-like errors with sessionId passthrough", async () => {
    const err = new Error("Đã có phiên mở") as Error & {
      statusCode: number;
      existingSessionId: string;
    };
    err.statusCode = 409;
    err.existingSessionId = "sess-1";
    const res = mapServiceError(err);
    expect(res.status).toBe(409);
    const body = await bodyOf(res);
    expect(body.sessionId).toBe("sess-1");
  });

  it("maps ContentError-like errors (status + details) into fields", async () => {
    const err = new Error("Dữ liệu không hợp lệ") as Error & {
      status: number;
      details: Array<{ field: string; message: string }>;
    };
    err.status = 422;
    err.details = [{ field: "title", message: "Bắt buộc" }];
    const res = mapServiceError(err);
    const body = await bodyOf(res);
    expect(res.status).toBe(422);
    expect(body.error.fields.title).toBe("Bắt buộc");
  });

  it("maps ZodError to 422 with fields", async () => {
    const schema = z.object({ x: z.number() });
    const parsed = schema.safeParse({});
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const res = mapServiceError(parsed.error);
      expect(res.status).toBe(422);
      expect((await bodyOf(res)).error.fields.x).toBeTruthy();
    }
  });

  it("maps missing-env errors (EnvError name) to 503", async () => {
    const err = new Error("Thiếu biến môi trường: DATABASE_URL");
    err.name = "EnvError";
    const res = mapServiceError(err);
    expect(res.status).toBe(503);
    expect((await bodyOf(res)).error.code).toBe("service_unavailable");
  });

  it("maps DB-unreachable errors to 503", async () => {
    const res = mapServiceError(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    expect(res.status).toBe(503);
  });

  it("maps unknown errors to 500 without leaking the message", async () => {
    const res = mapServiceError(new Error("pg: secret internal detail"));
    expect(res.status).toBe(500);
    const body = await bodyOf(res);
    expect(body.error.code).toBe("internal_error");
    expect(body.error.message).not.toContain("secret");
  });
});

describe("withLearner", () => {
  it("returns 401 envelope when no learner", async () => {
    getCurrentLearner.mockResolvedValueOnce(null);
    const GET = withLearner(async () => NextResponse.json({ ok: true }));
    const res = await GET({} as NextRequest);
    expect(res.status).toBe(401);
    expect((await bodyOf(res)).error.code).toBe("unauthorized");
  });

  it("passes learner + resolved params to the handler", async () => {
    const learner = { id: "l1", userId: "u1", role: "learner" as const };
    getCurrentLearner.mockResolvedValueOnce(learner);
    const GET = withLearner<{ id: string }>(async ({ learner, params }) =>
      NextResponse.json({ lid: learner.id, pid: params.id })
    );
    const res = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "p9" }),
    });
    expect(res.status).toBe(200);
    expect(await bodyOf(res)).toEqual({ lid: "l1", pid: "p9" });
  });

  it("routes handler errors through mapServiceError", async () => {
    getCurrentLearner.mockResolvedValueOnce({ id: "l1", role: "learner" });
    const GET = withLearner(async () => {
      const err = new Error("boom") as Error & { statusCode: number };
      err.statusCode = 413;
      throw err;
    });
    const res = await GET({} as NextRequest);
    expect(res.status).toBe(413);
  });
});

describe("withAdmin", () => {
  it("returns 403 for non-admin learner", async () => {
    getCurrentLearner.mockResolvedValueOnce({ id: "l1", role: "learner" });
    const GET = withAdmin(async () => NextResponse.json({ ok: true }));
    const res = await GET({} as NextRequest);
    expect(res.status).toBe(403);
  });

  it("converts a throwing getCurrentLearner into a mapped error (guard inside try)", async () => {
    const envErr = new Error("Thiếu biến môi trường");
    envErr.name = "EnvError";
    getCurrentLearner.mockRejectedValueOnce(envErr);
    const GET = withAdmin(async () => NextResponse.json({ ok: true }));
    const res = await GET({} as NextRequest);
    expect(res.status).toBe(503);
  });

  it("lets admin through", async () => {
    getCurrentLearner.mockResolvedValueOnce({ id: "l1", role: "admin" });
    const GET = withAdmin(async ({ learner }) =>
      NextResponse.json({ role: learner.role })
    );
    const res = await GET({} as NextRequest);
    expect(res.status).toBe(200);
  });
});
