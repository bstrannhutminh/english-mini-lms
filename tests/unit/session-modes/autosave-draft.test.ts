import { describe, expect, it } from "vitest";
import { draftSaveAction } from "@/features/session/hooks/use-autosave-draft";

describe("draftSaveAction — quyết định autosave nháp", () => {
  it("trả 'empty' khi nội dung trống hoặc chỉ khoảng trắng", () => {
    expect(draftSaveAction("", "cũ")).toBe("empty");
    expect(draftSaveAction("   \n\t ", "cũ")).toBe("empty");
    // Ngay cả khi trùng nội dung đã lưu — server không cần bản trống.
    expect(draftSaveAction("", "")).toBe("empty");
  });

  it("trả 'unchanged' khi nội dung trùng lần lưu thành công cuối", () => {
    expect(draftSaveAction("Bài làm của em", "Bài làm của em")).toBe("unchanged");
  });

  it("trả 'dirty' khi nội dung khác lần lưu cuối", () => {
    expect(draftSaveAction("Bài làm mới hơn", "Bài làm của em")).toBe("dirty");
    // Lần đầu của phiên không có nháp (initialSavedContent = "").
    expect(draftSaveAction("Gì đó", "")).toBe("dirty");
  });

  it("phân biệt chính xác từng ký tự — khoảng trắng cuối cũng tính là đổi", () => {
    expect(draftSaveAction("abc ", "abc")).toBe("dirty");
    expect(draftSaveAction("abc", "abc ")).toBe("dirty");
  });
});
