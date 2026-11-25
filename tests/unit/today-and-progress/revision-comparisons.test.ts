import { describe, expect, it } from "vitest";
import {
  buildRevisionComparisons,
  type RevisionSubmissionRow,
} from "@/server/progress/revision-comparisons";

function row(partial: Partial<RevisionSubmissionRow> & { id: string }): RevisionSubmissionRow {
  return {
    revision: 1,
    parentId: null,
    body: "",
    assisted: false,
    submittedAt: new Date("2026-01-01T00:00:00Z"),
    activityId: "act-1",
    activityTitle: "Bài đọc 1",
    activityMode: "reading",
    ...partial,
  };
}

describe("buildRevisionComparisons", () => {
  it("ghép bản sửa với bản gốc qua parentId", () => {
    const rows = [
      row({ id: "rev2", revision: 2, parentId: "rev1", submittedAt: new Date("2026-01-02T00:00:00Z") }),
      row({ id: "rev1", revision: 1 }),
    ];
    const result = buildRevisionComparisons(rows);
    expect(result).toHaveLength(1);
    expect(result[0].originalSubmissionId).toBe("rev1");
    expect(result[0].revisedSubmissionId).toBe("rev2");
  });

  it("chuỗi revision: bản 3 ghép với parent trực tiếp (bản 2), không phải bản 1", () => {
    const rows = [
      row({ id: "rev3", revision: 3, parentId: "rev2", submittedAt: new Date("2026-01-03T00:00:00Z") }),
      row({ id: "rev2", revision: 2, parentId: "rev1", submittedAt: new Date("2026-01-02T00:00:00Z") }),
      row({ id: "rev1", revision: 1 }),
    ];
    const result = buildRevisionComparisons(rows);
    expect(result).toHaveLength(2);
    const of3 = result.find((r) => r.revisedSubmissionId === "rev3");
    const of2 = result.find((r) => r.revisedSubmissionId === "rev2");
    expect(of3?.originalSubmissionId).toBe("rev2");
    expect(of2?.originalSubmissionId).toBe("rev1");
  });

  it("parentId null nhưng revision > 1 → fallback bản revision=1 cùng activity", () => {
    const rows = [
      row({ id: "rev2", revision: 2, parentId: null, submittedAt: new Date("2026-01-02T00:00:00Z") }),
      row({ id: "rev1", revision: 1 }),
    ];
    const result = buildRevisionComparisons(rows);
    expect(result).toHaveLength(1);
    expect(result[0].originalSubmissionId).toBe("rev1");
  });

  it("bản gốc đơn lẻ (không ai sửa) không xuất hiện trong kết quả", () => {
    const rows = [row({ id: "rev1", revision: 1 })];
    expect(buildRevisionComparisons(rows)).toHaveLength(0);
  });

  it("không tự ghép với chính mình", () => {
    const rows = [
      row({ id: "rev1", revision: 2, parentId: "rev1" }),
    ];
    expect(buildRevisionComparisons(rows)).toHaveLength(0);
  });

  it("excerpt cắt tối đa 150 ký tự", () => {
    const long = "a".repeat(300);
    const rows = [
      row({ id: "rev2", revision: 2, parentId: "rev1", body: long, submittedAt: new Date("2026-01-02T00:00:00Z") }),
      row({ id: "rev1", revision: 1, body: long }),
    ];
    const result = buildRevisionComparisons(rows);
    expect(result[0].originalExcerpt).toHaveLength(150);
    expect(result[0].revisedExcerpt).toHaveLength(150);
  });
});
