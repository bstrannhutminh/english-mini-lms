import { describe, expect, it } from "vitest";
import { resolveSubmissionList } from "@/features/my-work/list/use-submission-list";
import { shouldFetchOnMount } from "@/features/today/use-today-recommendation";
import type { SubmissionListItem } from "@/contracts/submission";

/**
 * Nhánh `initialData` của SSR-dữ-liệu-đầu (Hôm nay + Bài làm):
 * có dữ liệu server → không nháy skeleton, không fetch trùng lúc mount.
 * Tách thành hàm thuần để test không cần render React.
 */

const item = { id: "s-1" } as SubmissionListItem;
const itemNew = { id: "s-2" } as SubmissionListItem;

describe("resolveSubmissionList", () => {
  it("không có initialData → hasServerData=false (hook sẽ loading + fetch khi mount)", () => {
    const r = resolveSubmissionList(null);
    expect(r.hasServerData).toBe(false);
    expect(r.submissions).toEqual([]);
  });

  it("có initialData → dùng luôn, hasServerData=true", () => {
    const r = resolveSubmissionList(null, [item]);
    expect(r.hasServerData).toBe(true);
    expect(r.submissions).toEqual([item]);
  });

  it("initialData rỗng [] vẫn tính là có dữ liệu server → không fetch lúc mount", () => {
    expect(resolveSubmissionList(null, []).hasServerData).toBe(true);
  });

  it("fetched (client tự tải) thắng initialData sau refresh/thử lại", () => {
    const r = resolveSubmissionList([itemNew], [item]);
    expect(r.submissions).toEqual([itemNew]);
  });
});

describe("shouldFetchOnMount", () => {
  it("lượt đầu + có dữ liệu server → bỏ qua fetch (tránh gọi API trùng sau hydrate)", () => {
    expect(shouldFetchOnMount(0, true)).toBe(false);
  });

  it("lượt đầu + không có dữ liệu server → fetch như cũ", () => {
    expect(shouldFetchOnMount(0, false)).toBe(true);
  });

  it("đổi 30/45 hoặc Thử lại (requestId > 0) → luôn fetch, kể cả đã có dữ liệu", () => {
    expect(shouldFetchOnMount(1, true)).toBe(true);
    expect(shouldFetchOnMount(3, false)).toBe(true);
  });
});
