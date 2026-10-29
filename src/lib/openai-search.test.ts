import { describe, expect, it, vi } from "vitest";
import {
  FILE_SEARCH_MODEL,
  OPENAI_KEY_MISSING_MESSAGE,
  buildFileSearchRequest,
  ensureVectorStore,
  indexUploadedFile,
  readOpenAIApiKey,
  sourcesFromResponse,
  type SearchApi,
} from "./openai-search";

function fakeApi(overrides: Partial<SearchApi> = {}): SearchApi {
  return {
    createVectorStore: vi.fn(async () => ({ id: "vs_new" })),
    retrieveVectorStore: vi.fn(async () => ({ id: "vs_old" })),
    uploadFile: vi.fn(async () => ({ id: "file_1" })),
    attachFile: vi.fn(async () => undefined),
    deleteFile: vi.fn(async () => undefined),
    detachFile: vi.fn(async () => undefined),
    search: vi.fn(async () => []),
    ask: vi.fn(async () => ({ answer: "", sources: [] })),
    ...overrides,
  };
}

describe("openai file search", () => {
  it("treats a blank OPENAI_API_KEY as missing", () => {
    const previous = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "  ";
    expect(readOpenAIApiKey()).toBeNull();
    expect(OPENAI_KEY_MISSING_MESSAGE).toMatch(/OPENAI_API_KEY/);
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  });

  it("reuses the app model id for the Responses file_search call", () => {
    const request = buildFileSearchRequest("vs_123", "where is the policy?");
    expect(request.model).toBe("gpt-4o");
    expect(request.model).toBe(FILE_SEARCH_MODEL);
    expect(request.tools).toEqual([
      { type: "file_search", vector_store_ids: ["vs_123"] },
    ]);
    expect(request.include).toContain("file_search_call.results");
  });

  it("reuses an existing vector store for the user", async () => {
    const api = fakeApi();
    const id = await ensureVectorStore(api, "vs_old", "uid-1");
    expect(id).toBe("vs_old");
    expect(api.createVectorStore).not.toHaveBeenCalled();
  });

  it("creates a vector store when the saved one is gone", async () => {
    const api = fakeApi({
      retrieveVectorStore: vi.fn(async () => null),
    });
    const id = await ensureVectorStore(api, "vs_missing", "uid-1");
    expect(id).toBe("vs_new");
    expect(api.createVectorStore).toHaveBeenCalledWith("uid-1");
  });

  it("removes the uploaded file when attaching it to the store fails", async () => {
    const api = fakeApi({
      attachFile: vi.fn(async () => {
        throw new Error("attach failed");
      }),
    });
    await expect(
      indexUploadedFile(api, {
        vectorStoreId: "vs_1",
        bytes: new Uint8Array([1, 2, 3]),
        fileName: "note.txt",
        contentType: "text/plain",
      })
    ).rejects.toThrow(/attach failed/);
    expect(api.deleteFile).toHaveBeenCalledWith("file_1");
  });

  it("collects file citations and search snippets", () => {
    const parsed = sourcesFromResponse({
      output_text: "The policy is in the handbook.",
      output: [
        {
          type: "file_search_call",
          results: [
            {
              filename: "handbook.pdf",
              file_id: "file_9",
              text: "Vacation policy: 15 days.",
              score: 0.8,
            },
          ],
        },
        {
          type: "message",
          content: [
            {
              type: "output_text",
              annotations: [
                { type: "file_citation", filename: "handbook.pdf", file_id: "file_9" },
              ],
            },
          ],
        },
      ],
    });
    expect(parsed.answer).toMatch(/handbook/);
    expect(parsed.sources.map((source) => source.filename)).toEqual([
      "handbook.pdf",
      "handbook.pdf",
    ]);
    expect(parsed.sources[0]?.text).toMatch(/Vacation/);
  });
});
