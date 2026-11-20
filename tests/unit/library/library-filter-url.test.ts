import { describe, expect, it } from "vitest";
import { EMPTY_LIBRARY_FILTERS, parseLibraryFilterUrl, serializeLibraryFilterUrl } from "@/features/library/library-filter-url";

describe("Library filter URLs", () => {
  it("restores all filters including selected IELTS with an unrelated topic", () => {
    const params = new URLSearchParams("topic=doc-sach-y-khoa&skill=ielts&status=completed&q=email");
    const state = parseLibraryFilterUrl(params);
    expect(state).toEqual({ topic: "doc-sach-y-khoa", skill: "ielts", status: "completed", query: "email" });
    expect(parseLibraryFilterUrl(new URLSearchParams(serializeLibraryFilterUrl(new URLSearchParams(), state)))).toEqual(state);
  });

  it("accepts legacy topic links and safely ignores invalid controls", () => {
    expect(parseLibraryFilterUrl(new URLSearchParams("topic=uncategorized"))).toEqual({ ...EMPTY_LIBRARY_FILTERS, topic: "uncategorized" });
    expect(parseLibraryFilterUrl(new URLSearchParams("topic=javascript%3Aalert(1)&skill=unknown&status=unknown"))).toEqual(EMPTY_LIBRARY_FILTERS);
  });

  it("preserves unknown repeated parameters while clearing only filter state", () => {
    const original = new URLSearchParams("topic=luyen-ielts&skill=reading&status=completed&q=foo&ref=one&ref=two&tour=1");
    const cleared = new URLSearchParams(serializeLibraryFilterUrl(original, EMPTY_LIBRARY_FILTERS));
    expect(cleared.getAll("ref")).toEqual(["one", "two"]);
    expect(cleared.get("tour")).toBe("1");
    expect(parseLibraryFilterUrl(cleared)).toEqual(EMPTY_LIBRARY_FILTERS);
    expect(original.get("topic")).toBe("luyen-ielts");
  });

  it("round-trips Vietnamese and punctuation without creating extra URL controls", () => {
    const state = { ...EMPTY_LIBRARY_FILTERS, query: "Hội nghị & email?  ", topic: "giao-tiep-hoi-nghi" };
    const serialized = new URLSearchParams(serializeLibraryFilterUrl(new URLSearchParams("ref=book"), state));
    expect(parseLibraryFilterUrl(serialized)).toEqual(state);
    expect(serialized.get("ref")).toBe("book");
    expect([...serialized.keys()]).toEqual(["ref", "topic", "q"]);
  });

  it("reads the long query alias and canonicalizes it without duplicate filters", () => {
    const params = new URLSearchParams("query=sieu+am&topic=doc-sach-y-khoa");
    const state = parseLibraryFilterUrl(params);
    expect(state.query).toBe("sieu am");
    const serialized = new URLSearchParams(serializeLibraryFilterUrl(params, state));
    expect(serialized.has("query")).toBe(false);
    expect(serialized.get("q")).toBe("sieu am");
  });
});
