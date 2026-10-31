import { describe, expect, it, vi } from "vitest";
import { pollIndex, postAction, readActionResult, UNEXPECTED_SERVER_MESSAGE } from "./actionResponse";

describe("action JSON responses", () => {
  it("accepts an action result and rejects an HTML error page", () => {
    expect(readActionResult({ ok: false, error: { status: 500, code: "X", message: "no" } })?.ok).toBe(
      false
    );
    expect(readActionResult("<html>An error occurred</html>")).toBeNull();
  });

  it("turns a non-JSON server response into a JSON error the UI can show", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>timeout</html>", { status: 504, headers: { "content-type": "text/html" } }))
    );
    const result = await postAction("/api/search/ask", {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UNEXPECTED_RESPONSE");
      expect(result.error.message).toBe(UNEXPECTED_SERVER_MESSAGE);
    }
    vi.unstubAllGlobals();
  });

  it("does not poll when the file is already processed", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await pollIndex("doc-1", "token", "completed");
    expect(result).toEqual({ ok: true, data: { status: "completed" } });
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("does not poll a document whose delete already started", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await pollIndex("doc-1", "token", "completed", () => true);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("DOCUMENT_DELETED");
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
