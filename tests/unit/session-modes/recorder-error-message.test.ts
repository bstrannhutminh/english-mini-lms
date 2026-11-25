/**
 * Unit tests — map lỗi micro sang tiếng Việt (hermetic, no DOM/DB).
 * Invariant: learner KHÔNG BAO GIỜ thấy raw error tiếng Anh của trình duyệt;
 * hướng dẫn mở quyền khác nhau giữa iOS Safari và desktop.
 */
import { describe, expect, it } from "vitest";
import {
  isIosUserAgent,
  recorderErrorMessage,
} from "@/features/session/hooks/recorder-error-message";

function domException(name: string): DOMException {
  return new DOMException("Permission denied by system", name);
}

describe("isIosUserAgent", () => {
  it("nhận diện iPhone/iPad qua userAgent", () => {
    expect(isIosUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(isIosUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe(true);
  });

  it("iPadOS giả Macintosh nhưng có touch", () => {
    expect(isIosUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 5)).toBe(true);
    expect(isIosUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 0)).toBe(false);
  });

  it("Android/desktop không phải iOS", () => {
    expect(isIosUserAgent("Mozilla/5.0 (Linux; Android 14)", 5)).toBe(false);
    expect(isIosUserAgent("Mozilla/5.0 (Windows NT 10.0)", 0)).toBe(false);
  });
});

describe("recorderErrorMessage", () => {
  it("NotAllowedError trên iOS → hướng dẫn Cài đặt Safari/aA", () => {
    const msg = recorderErrorMessage(domException("NotAllowedError"), true);
    expect(msg).toContain("Safari");
    expect(msg).toContain("Microphone");
    expect(msg).not.toContain("Permission denied");
  });

  it("NotAllowedError trên desktop → hướng dẫn biểu tượng khoá thanh địa chỉ", () => {
    const msg = recorderErrorMessage(domException("NotAllowedError"), false);
    expect(msg).toContain("thanh địa chỉ");
    expect(msg).not.toContain("Cài đặt → Safari");
    expect(msg).not.toContain("Permission denied");
  });

  it("SecurityError cũng là lỗi quyền", () => {
    expect(recorderErrorMessage(domException("SecurityError"), false)).toContain("quyền micro");
  });

  it("NotFoundError → không tìm thấy micro", () => {
    expect(recorderErrorMessage(domException("NotFoundError"), true)).toContain(
      "Không tìm thấy micro",
    );
  });

  it("NotReadableError → micro bị ứng dụng khác chiếm", () => {
    expect(recorderErrorMessage(domException("NotReadableError"), false)).toContain(
      "ứng dụng khác",
    );
  });

  it("lỗi không tên / lỗi lạ → thông báo chung tiếng Việt, không lộ tiếng Anh", () => {
    const msg = recorderErrorMessage(new TypeError("undefined is not an object"), false);
    expect(msg).toContain("Không mở được micro");
    expect(msg).not.toContain("undefined");
    expect(recorderErrorMessage(null, false)).toContain("Không mở được micro");
    expect(recorderErrorMessage("weird string", true)).toContain("Không mở được micro");
  });

  it("Error tiếng Việt do app tự ném (thiếu mediaDevices) được giữ nguyên", () => {
    const appError = new Error(
      "Trình duyệt của bạn không hỗ trợ ghi âm trực tiếp. Hãy mở bằng Safari hoặc Chrome.",
    );
    expect(recorderErrorMessage(appError, true)).toBe(appError.message);
  });
});
