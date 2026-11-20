import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api-client";
import { upsert } from "@/features/admin/wizard/wizard-submit";

describe("creating lesson content safely", () => {
  it("does not overwrite an existing source after an ID collision", async () => {
    const create = vi.fn().mockRejectedValue(new ApiClientError("conflict", "Already exists", 409));
    const update = vi.fn();
    await expect(upsert(create, update, "src-existing", { title: "New lesson" })).rejects.toMatchObject({ status: 409 });
    expect(update).not.toHaveBeenCalled();
  });

  it("retries only content created by the current wizard attempt", async () => {
    const create = vi.fn().mockResolvedValue({});
    const update = vi.fn().mockResolvedValue({});
    const created = new Set<string>();
    await upsert(create, update, "src-new", { title: "Lesson" }, created);
    await upsert(create, update, "src-new", { title: "Revised lesson" }, created);
    expect(create).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith("src-new", { title: "Revised lesson" });
  });

  it("does not claim ownership of content when creation fails", async () => {
    const create = vi.fn().mockRejectedValue(new ApiClientError("service_unavailable", "Unavailable", 503));
    const created = new Set<string>();
    await expect(upsert(create, vi.fn(), "src-new", {}, created)).rejects.toMatchObject({ status: 503 });
    expect(created.size).toBe(0);
  });
});
