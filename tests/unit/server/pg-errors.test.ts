/**
 * Unit test hermetic cho isUniqueViolation: nhận diện mã 23505 cả khi
 * drizzle gói lỗi driver trong nhiều lớp DrizzleQueryError.cause.
 */
import { describe, it, expect } from "vitest";
import { isUniqueViolation } from "@/server/pg-errors";

describe("isUniqueViolation", () => {
  it("nhận lỗi postgres-js trực tiếp (code ở top-level)", () => {
    expect(isUniqueViolation({ code: "23505", message: "duplicate key" })).toBe(true);
  });

  it("nhận lỗi qua 1 lớp cause (DrizzleQueryError)", () => {
    expect(
      isUniqueViolation({
        name: "DrizzleQueryError",
        cause: { code: "23505" },
      })
    ).toBe(true);
  });

  it("nhận lỗi qua nhiều lớp cause lồng nhau", () => {
    expect(
      isUniqueViolation({ cause: { cause: { cause: { code: "23505" } } } })
    ).toBe(true);
  });

  it("từ chối mã lỗi khác (23503 FK, 23514 check…)", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation({ cause: { code: "23514" } })).toBe(false);
  });

  it("từ chối giá trị không phải lỗi PG", () => {
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
    expect(isUniqueViolation(new Error("boom"))).toBe(false);
  });
});
