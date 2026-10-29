import { afterEach, describe, expect, it, vi } from "vitest";
import { ragieErrorResult } from "./ragie-errors";
import {
  RAGIE_KEY_MISSING_MESSAGE,
  RAGIE_UNREACHABLE_MESSAGE,
  createRagieDocumentForm,
  failureForRagieCall,
  isRagieTransportError,
  ragieFetch,
  readRagieApiKey,
} from "./ragie-client";

describe("ragie client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RAGIE_API_KEY;
  });

  it("treats a blank RAGIE_API_KEY as missing", () => {
    process.env.RAGIE_API_KEY = "   ";
    expect(readRagieApiKey()).toBeNull();
    const failure = failureForRagieCall(new Error("RAGIE_API_KEY_MISSING"));
    expect(failure?.ok).toBe(false);
    if (failure && !failure.ok) {
      expect(failure.error.code).toBe("RAGIE_API_KEY_MISSING");
      expect(failure.error.message).toBe(RAGIE_KEY_MISSING_MESSAGE);
    }
  });

  it("describes a 401 as an invalid key", async () => {
    const result = await ragieErrorResult({
      response: new Response(JSON.stringify({ message: "invalid api key" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RAGIE_UNAUTHORIZED");
      expect(result.error.message).toMatch(/invalid/i);
      expect(result.error.message).not.toMatch(/could not reach/i);
    }
  });

  it("maps a connection reset to RAGIE_UNREACHABLE instead of an unexpected upload error", () => {
    const error = new TypeError("fetch failed");
    Object.assign(error, { cause: { code: "ECONNRESET" } });
    expect(isRagieTransportError(error)).toBe(true);
    const failure = failureForRagieCall(error);
    expect(failure?.ok).toBe(false);
    if (failure && !failure.ok) {
      expect(failure.error.code).toBe("RAGIE_UNREACHABLE");
      expect(failure.error.message).toBe(RAGIE_UNREACHABLE_MESSAGE);
      expect(failure.error.code).not.toBe("UPLOAD_TO_RAGIE_UNEXPECTED_ERROR");
    }
  });

  it("builds a documents upload as a named File plus JSON metadata", () => {
    const form = createRagieDocumentForm({
      bytes: new TextEncoder().encode("hello ragie"),
      fileName: "note.txt",
      contentType: "text/plain",
      metadata: { title: "note.txt", scope: "tutorial", userId: "uid-1" },
    });
    const file = form.get("file");
    expect(file).toBeInstanceOf(File);
    if (file instanceof File) {
      expect(file.name).toBe("note.txt");
      expect(file.type).toBe("text/plain");
    }
    expect(form.get("name")).toBe("note.txt");
    expect(JSON.parse(String(form.get("metadata")))).toEqual({
      title: "note.txt",
      scope: "tutorial",
      userId: "uid-1",
    });
  });

  it("retries once when the socket resets before a response", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNRESET" } })
      )
      .mockResolvedValueOnce(new Response("ok", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await ragieFetch(
      "https://api.ragie.ai/documents",
      { method: "POST", body: "retry-me" },
      1000
    );

    expect(response.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
