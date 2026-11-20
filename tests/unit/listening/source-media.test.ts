import { describe, expect, it } from "vitest";
import { listeningSourceMedia } from "@/server/learning/session/listening-source-media";

describe("listening media provenance", () => {
  it("does not select an unrelated video when the source is absent", () => {
    expect(listeningSourceMedia()).toEqual({ videoUrl: null, startSeconds: 0, endSeconds: 0 });
    expect(listeningSourceMedia({ url: null, startSeconds: 10, endSeconds: 60 }).videoUrl).toBeNull();
  });
  it("preserves the actual source URL and reviewed timestamps", () => {
    const source = { url: "https://www.youtube.com/watch?v=source-video", startSeconds: 95, endSeconds: 155 };
    expect(listeningSourceMedia(source)).toEqual({ videoUrl: source.url, startSeconds: 95, endSeconds: 155 });
  });
});
