import { describe, expect, it, vi } from "vitest";
import { requestSessionHint } from "@/features/session/hooks/request-session-hint";

describe("hint authorization", () => {
  it("keeps help hidden while the server event is pending", async () => {
    let accept!: (accepted: boolean) => void;
    const opened = vi.fn();
    const pending = requestSessionHint(() => new Promise(resolve => { accept = resolve; }), opened);
    expect(opened).not.toHaveBeenCalled();
    accept(true);
    await expect(pending).resolves.toBe(true);
    expect(opened).toHaveBeenCalledOnce();
  });

  it("does not reveal help on a rejected event and allows an accepted retry", async () => {
    const opened = vi.fn();
    const postEvent = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(requestSessionHint(postEvent, opened)).resolves.toBe(false);
    expect(opened).not.toHaveBeenCalled();
    await expect(requestSessionHint(postEvent, opened)).resolves.toBe(true);
    expect(opened).toHaveBeenCalledOnce();
    expect(postEvent).toHaveBeenNthCalledWith(1, "hint");
  });

  it("keeps help hidden if recording the event throws", async () => {
    const opened = vi.fn();
    await expect(requestSessionHint(() => Promise.reject(new Error("HTTP 503")), opened)).rejects.toThrow("HTTP 503");
    expect(opened).not.toHaveBeenCalled();
  });
});
