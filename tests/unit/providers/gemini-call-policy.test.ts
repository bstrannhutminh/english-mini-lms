import { describe, it, expect, vi } from "vitest";
import {
  GeminiResponseError,
  callGeminiWithRetry,
  isRetryableGeminiError,
  toVietnameseGeminiError,
} from "@/server/providers/gemini/call-gemini";

const networkError = () => new TypeError("fetch failed: ECONNRESET");
const api429 = () => Object.assign(new Error("Too Many Requests"), { status: 429 });
const api500 = () => Object.assign(new Error("Internal"), { status: 500 });
const timeoutError = () => {
  const e = new Error("The operation timed out");
  e.name = "TimeoutError";
  return e;
};

describe("isRetryableGeminiError", () => {
  it("chỉ GeminiResponseError (JSON/schema sai) mới retry được", () => {
    expect(isRetryableGeminiError(new GeminiResponseError("bad json"))).toBe(true);
    expect(isRetryableGeminiError(networkError())).toBe(false);
    expect(isRetryableGeminiError(api429())).toBe(false);
    expect(isRetryableGeminiError(timeoutError())).toBe(false);
  });
});

describe("callGeminiWithRetry — chính sách timeout/retry", () => {
  it("thành công ngay lần 1 → gọi đúng 1 lần", async () => {
    const call = vi.fn().mockResolvedValue("ok");
    await expect(callGeminiWithRetry(call, "t")).resolves.toBe("ok");
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("JSON/schema sai lần 1 → retry đúng 1 lần rồi trả kết quả", async () => {
    const call = vi
      .fn()
      .mockRejectedValueOnce(new GeminiResponseError("JSON không đúng schema"))
      .mockResolvedValueOnce("ok-after-retry");
    await expect(callGeminiWithRetry(call, "t")).resolves.toBe("ok-after-retry");
    expect(call).toHaveBeenCalledTimes(2);
  });

  it("JSON/schema sai cả 2 lần → throw, không retry lần 3", async () => {
    const call = vi.fn().mockRejectedValue(new GeminiResponseError("still bad"));
    await expect(callGeminiWithRetry(call, "t")).rejects.toThrow("still bad");
    expect(call).toHaveBeenCalledTimes(2);
  });

  it("lỗi mạng → KHÔNG retry, fail fast (gọi đúng 1 lần)", async () => {
    const call = vi.fn().mockRejectedValue(networkError());
    await expect(callGeminiWithRetry(call, "t")).rejects.toThrow(/Không gọi được Gemini|Bài nộp đã được lưu/);
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("HTTP 429 → KHÔNG retry, thông báo tiếng Việt kèm status", async () => {
    const call = vi.fn().mockRejectedValue(api429());
    await expect(callGeminiWithRetry(call, "t")).rejects.toThrow(/429|quá tải/);
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("timeout (TimeoutError) → KHÔNG retry, message gợi ý 'Chấm lại'", async () => {
    const call = vi.fn().mockRejectedValue(timeoutError());
    await expect(callGeminiWithRetry(call, "t")).rejects.toThrow(/Chấm lại/);
    expect(call).toHaveBeenCalledTimes(1);
  });
});

describe("toVietnameseGeminiError — mọi lỗi đều có thông báo Việt", () => {
  it("GeminiResponseError giữ nguyên message", () => {
    const e = toVietnameseGeminiError(new GeminiResponseError("JSON không đúng schema: x"));
    expect(e.message).toContain("JSON không đúng schema");
  });

  it("timeout → nhắc số giây + đường 'Chấm lại'", () => {
    const e = toVietnameseGeminiError(timeoutError());
    expect(e.message).toMatch(/giây/);
    expect(e.message).toContain("Chấm lại");
  });

  it("ApiError status → nhắc HTTP status", () => {
    expect(toVietnameseGeminiError(api500()).message).toContain("500");
    expect(toVietnameseGeminiError(api429()).message).toContain("quá tải");
  });

  it("lỗi lạ → bọc message, không leak stack thô", () => {
    const e = toVietnameseGeminiError(new Error("socket hang up"));
    expect(e.message).toContain("socket hang up");
    expect(e.message).toContain("Chấm lại");
  });
});
