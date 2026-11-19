import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiFetch, ApiClientError } from "@/lib/api-client";

const pongSchema = z.object({ pong: z.boolean() });

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch success path", () => {
  it("returns parsed data matching the schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, { pong: true }))
    );
    const data = await apiFetch("/api/ping", undefined, pongSchema);
    expect(data.pong).toBe(true);
  });

  it("throws invalid_response when the payload breaks the contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, { wrong: true }))
    );
    await expect(
      apiFetch("/api/ping", undefined, pongSchema)
    ).rejects.toMatchObject({ code: "invalid_response", status: 200 });
  });
});

describe("apiFetch error shapes", () => {
  it("parses the new { error: { code, message, fields } } envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(422, {
          error: {
            code: "validation_failed",
            message: "Dữ liệu không hợp lệ.",
            fields: { body: "Bắt buộc" },
          },
        })
      )
    );
    try {
      await apiFetch("/api/x", undefined, pongSchema);
      expect.unreachable();
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe("validation_failed");
      expect(err.status).toBe(422);
      expect(err.fields?.body).toBe("Bắt buộc");
    }
  });

  it("parses the legacy { error: string, details } shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(422, {
          error: "Dữ liệu không hợp lệ",
          details: [{ field: "title", message: "Bắt buộc" }],
        })
      )
    );
    try {
      await apiFetch("/api/x", undefined, pongSchema);
      expect.unreachable();
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe("validation_failed");
      expect(err.message).toBe("Dữ liệu không hợp lệ");
      expect(err.fields?.title).toBe("Bắt buộc");
    }
  });

  it("carries sessionId through on 409 conflict (legacy shape)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(409, { error: "Đã có phiên mở", sessionId: "sess-9" })
      )
    );
    try {
      await apiFetch("/api/x", undefined, pongSchema);
      expect.unreachable();
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe("conflict");
      expect(err.sessionId).toBe("sess-9");
    }
  });

  it("throws network_error when fetch itself rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      })
    );
    await expect(
      apiFetch("/api/x", undefined, pongSchema)
    ).rejects.toMatchObject({ code: "network_error", status: 0 });
  });
});
