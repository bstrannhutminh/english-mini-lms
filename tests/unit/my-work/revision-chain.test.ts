import { describe, expect, it } from "vitest";
import {
  buildRevisionLookup,
  getRevisionInfo,
  topPriorityObservations,
  type RevisionChainItem,
} from "@/features/my-work/revision-chain";

describe("topPriorityObservations", () => {
  it("returns the first N observations (AI ordering is priority order)", () => {
    const obs = ["a", "b", "c", "d", "e"];
    expect(topPriorityObservations(obs, 3)).toEqual(["a", "b", "c"]);
  });

  it("returns all when fewer than N exist", () => {
    expect(topPriorityObservations(["a", "b"], 3)).toEqual(["a", "b"]);
    expect(topPriorityObservations([], 3)).toEqual([]);
  });
});

describe("getRevisionInfo — append-only revision chain", () => {
  const chain: RevisionChainItem[] = [
    { id: "s1", parentId: null, revision: 1 },
    { id: "s2", parentId: "s1", revision: 2 },
    { id: "s3", parentId: "s2", revision: 3 },
    { id: "other", parentId: null, revision: 1 },
  ];

  it("positions each submission inside its chain", () => {
    expect(getRevisionInfo(chain[0], chain)).toMatchObject({
      position: 1,
      chainLength: 3,
      parentId: null,
      childId: "s2",
    });
    expect(getRevisionInfo(chain[1], chain)).toMatchObject({
      position: 2,
      chainLength: 3,
      parentId: "s1",
      childId: "s3",
    });
    expect(getRevisionInfo(chain[2], chain)).toMatchObject({
      position: 3,
      chainLength: 3,
      parentId: "s2",
      childId: null,
    });
  });

  it("treats a single submission as chain of 1", () => {
    expect(getRevisionInfo(chain[3], chain)).toMatchObject({
      position: 1,
      chainLength: 1,
      childId: null,
    });
  });

  it("handles a missing (deleted) parent gracefully", () => {
    const items: RevisionChainItem[] = [
      { id: "s2", parentId: "ghost", revision: 2 },
    ];
    const info = getRevisionInfo(items[0], items);
    expect(info.position).toBe(1); // ghost parent không có trong list → s2 là gốc nhìn thấy
    expect(info.chainLength).toBe(1);
    expect(info.parentId).toBeNull();
  });

  it("does not loop forever on a cyclic parentId", () => {
    const cyclic: RevisionChainItem[] = [
      { id: "a", parentId: "b", revision: 1 },
      { id: "b", parentId: "a", revision: 2 },
    ];
    const info = getRevisionInfo(cyclic[0], cyclic);
    expect(info.chainLength).toBeGreaterThanOrEqual(1);
    expect(info.chainLength).toBeLessThanOrEqual(2);
  });

  it("two children on one parent keeps the first (UI-only edge)", () => {
    const { childOf } = buildRevisionLookup([
      { id: "p", parentId: null, revision: 1 },
      { id: "c1", parentId: "p", revision: 2 },
      { id: "c2", parentId: "p", revision: 2 },
    ]);
    expect(childOf.get("p")).toBe("c1");
  });
});
