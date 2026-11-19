import { describe, it, expect } from "vitest";
import { isFocusRoute } from "@/components/layout/focus-routes";

describe("isFocusRoute (Focus Mode chrome hiding)", () => {
  it("enables Focus Mode on /learn/* and /onboarding", () => {
    expect(isFocusRoute("/learn/session-123")).toBe(true);
    expect(isFocusRoute("/learn/abc/review")).toBe(true);
    expect(isFocusRoute("/onboarding")).toBe(true);
    expect(isFocusRoute("/onboarding/setup")).toBe(true);
  });

  it("keeps standard navigation on all non-focus routes", () => {
    expect(isFocusRoute("/today")).toBe(false);
    expect(isFocusRoute("/library")).toBe(false);
    expect(isFocusRoute("/library/W1")).toBe(false);
    expect(isFocusRoute("/my-work")).toBe(false);
    expect(isFocusRoute("/vocab")).toBe(false);
    expect(isFocusRoute("/progress")).toBe(false);
    expect(isFocusRoute("/settings")).toBe(false);
    expect(isFocusRoute("/admin")).toBe(false);
  });

  it("handles empty or nullish pathnames safely", () => {
    expect(isFocusRoute(null)).toBe(false);
    expect(isFocusRoute(undefined)).toBe(false);
    expect(isFocusRoute("")).toBe(false);
  });
});
