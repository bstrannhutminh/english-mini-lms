import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const { getCurrentLearner } = vi.hoisted(() => ({ getCurrentLearner: vi.fn() }));
vi.mock("@/server/auth", () => ({ getCurrentLearner }));

import { withLearner } from "@/server/http/with-learner";
import { withAdmin } from "@/server/http/with-admin";

beforeEach(() => getCurrentLearner.mockReset());

describe.each([
  { name: "withLearner", wrap: withLearner, role: "learner" },
  { name: "withAdmin", wrap: withAdmin, role: "admin" },
])("$name route context", ({ wrap, role }) => {
  it("exposes required promised params to Next's generated route validator", async () => {
    getCurrentLearner.mockResolvedValue({ id: "learner-1", role });
    const route = wrap<{ id: string }>(({ params, learner }) =>
      Response.json({ id: params.id, learnerId: learner.id })
    );

    // Parameters uses the final overload, as does Next's SecondArg validator.
    expectTypeOf<Parameters<typeof route>[1]>().toEqualTypeOf<{
      params: Promise<{ id: string }>;
    }>();

    const response = await route({} as NextRequest, {
      params: Promise.resolve({ id: "activity-1" }),
    });
    expect(await response.json()).toEqual({ id: "activity-1", learnerId: "learner-1" });
  });

  it("keeps direct calls without context compatible", async () => {
    getCurrentLearner.mockResolvedValue({ id: "learner-1", role });
    const handler = vi.fn(() => Response.json({ ok: true }));
    const request = {} as NextRequest;

    expect((await wrap(handler)(request)).status).toBe(200);
    expect(handler).toHaveBeenCalledWith({
      req: request,
      learner: { id: "learner-1", role },
      params: undefined,
    });
  });

  it("maps a rejected params promise through the existing error boundary", async () => {
    getCurrentLearner.mockResolvedValue({ id: "learner-1", role });
    const handler = vi.fn(() => Response.json({ ok: true }));
    const paramsError = Object.assign(new Error("Params unavailable"), { statusCode: 422 });
    const response = await wrap<{ id: string }>(handler)({} as NextRequest, {
      params: Promise.reject(paramsError),
    });

    expect(response.status).toBe(422);
    expect(handler).not.toHaveBeenCalled();
  });
});
