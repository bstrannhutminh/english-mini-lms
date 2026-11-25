import { describe, expect, it } from "vitest";
import {
  isMagicLinkError,
  loginErrorMessage,
  mapAuthRuntimeError,
} from "@/features/auth/login-messages";

describe("loginErrorMessage", () => {
  it("map auth_failed sang thông báo tiếng Việt", () => {
    const msg = loginErrorMessage({ error: "auth_failed" });
    expect(msg).toContain("Đăng nhập thất bại");
  });

  it("reason otp_expired thắng error tổng quát", () => {
    const msg = loginErrorMessage({
      error: "exchange_failed",
      reason: "otp_expired",
    });
    expect(msg).toContain("hết hạn");
  });

  it("missing_code → hướng dẫn gửi lại link", () => {
    expect(loginErrorMessage({ error: "missing_code" })).toContain(
      "không hợp lệ"
    );
  });

  it("error lạ → thông báo chung, không lộ mã kỹ thuật", () => {
    expect(loginErrorMessage({ error: "weird_code_xyz" })).toBe(
      "Đăng nhập không thành công. Vui lòng thử lại."
    );
  });

  it("message tuỳ ý hiển thị nguyên văn, cắt 300 ký tự", () => {
    const long = "x".repeat(400);
    const msg = loginErrorMessage({ message: long });
    expect(msg).toHaveLength(300);
  });

  it("không có gì → null", () => {
    expect(loginErrorMessage({})).toBeNull();
    expect(
      loginErrorMessage({ error: null, reason: null, message: null })
    ).toBeNull();
  });
});

describe("isMagicLinkError", () => {
  it("nhận diện lỗi liên quan magic link", () => {
    expect(isMagicLinkError({ error: "auth_failed" })).toBe(true);
    expect(isMagicLinkError({ reason: "otp_expired" })).toBe(true);
  });

  it("lỗi khác → false (không hiện gợi ý trình duyệt)", () => {
    expect(isMagicLinkError({ error: "access_denied" })).toBe(false);
    expect(isMagicLinkError({})).toBe(false);
  });
});

describe("mapAuthRuntimeError", () => {
  it("invalid_credentials (code) → sai email/mật khẩu", () => {
    expect(mapAuthRuntimeError({ code: "invalid_credentials" })).toContain(
      "không chính xác"
    );
  });

  it("message 'Invalid login credentials' (bản cũ không có code) vẫn map đúng", () => {
    expect(
      mapAuthRuntimeError({ message: "Invalid login credentials" })
    ).toContain("không chính xác");
  });

  it("email_not_confirmed → hướng dẫn xác nhận email", () => {
    expect(mapAuthRuntimeError({ code: "email_not_confirmed" })).toContain(
      "xác nhận email"
    );
  });

  it("rate limit → đợi vài phút", () => {
    expect(
      mapAuthRuntimeError({ code: "over_request_rate_limit" })
    ).toContain("quá nhiều lần");
    expect(
      mapAuthRuntimeError({ message: "email rate limit exceeded" })
    ).toContain("quá nhiều lần");
  });

  it("lỗi mạng → gợi ý kiểm tra kết nối", () => {
    expect(mapAuthRuntimeError({ message: "Failed to fetch" })).toContain(
      "kết nối mạng"
    );
  });

  it("lỗi lạ → thông báo chung tiếng Việt, KHÔNG lộ message tiếng Anh", () => {
    const msg = mapAuthRuntimeError({
      code: "unexpected_failure",
      message: "something weird happened in the auth layer",
    });
    expect(msg).toBe("Đăng nhập không thành công. Vui lòng thử lại sau ít phút.");
    expect(msg).not.toContain("weird");
  });
});
