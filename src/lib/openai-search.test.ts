import { describe, expect, it, vi } from "vitest";
import OpenAI from "openai";
import {
  FILE_SEARCH_MODEL,
  IndexProcessingError,
  OPENAI_KEY_MISSING_MESSAGE,
  buildFileSearchRequest,
  ensureVectorStore,
  indexUploadedFile,
  readOpenAIApiKey,
  fileIdsToReplace,
  removeIndexedFile,
  replaceIndexedCopies,
  savedOpenAIFileId,
  sourcesFromResponse,
  type SearchApi,
} from "./openai-search";
import { indexedFileDocPath, isEvenDocumentPath, vectorStoreDocPath } from "./searchPaths";

function fakeApi(overrides: Partial<SearchApi> = {}): SearchApi {
  return {
    createVectorStore: vi.fn(async () => ({ id: "vs_new" })),
    retrieveVectorStore: vi.fn(async () => ({ id: "vs_old" })),
    uploadFile: vi.fn(async () => ({ id: "file_1" })),
    attachFile: vi.fn(async () => ({ status: "completed", errorMessage: null })),
    deleteFile: vi.fn(async () => undefined),
    detachFile: vi.fn(async () => undefined),
    listStoreFiles: vi.fn(async () => []),
    fileStatus: vi.fn(async () => ({ status: "completed", errorMessage: null })),
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

  it("keeps the file id path even so Firestore can save it", () => {
    const filePath = indexedFileDocPath("uid-1", "doc-1");
    const storePath = vectorStoreDocPath("uid-1");
    expect(filePath).toBe("users/uid-1/searchFiles/doc-1");
    expect(storePath).toBe("users/uid-1/search/store");
    expect(isEvenDocumentPath(filePath)).toBe(true);
    expect(isEvenDocumentPath(storePath)).toBe(true);
    expect(isEvenDocumentPath("users/uid-1/search/files/doc-1")).toBe(false);
  });

  it("reads a saved OpenAI file id so a re-index can remove that copy", () => {
    expect(savedOpenAIFileId({ openaiFileId: " file_9 " })).toBe("file_9");
    expect(savedOpenAIFileId({ openaiFileId: "  " })).toBeNull();
    expect(savedOpenAIFileId(null)).toBeNull();
  });

  it("returns while processing is still in progress and keeps the file", async () => {
    const api = fakeApi({
      attachFile: vi.fn(async () => ({ status: "in_progress", errorMessage: null })),
    });
    await expect(
      indexUploadedFile(api, {
        vectorStoreId: "vs_1",
        bytes: new Uint8Array([1]),
        fileName: "note.txt",
        contentType: "text/plain",
        documentId: "doc-1",
      })
    ).resolves.toEqual({ fileId: "file_1", status: "in_progress" });
    expect(api.deleteFile).not.toHaveBeenCalled();
    expect(api.attachFile).toHaveBeenCalledWith("vs_1", "file_1", {
      documentId: "doc-1",
      fileName: "note.txt",
    });
  });

  it("removes the saved copy and untagged duplicates before attaching again", () => {
    const ids = fileIdsToReplace(
      [
        { fileId: "file_old", filename: "note.txt", status: "completed" },
        { fileId: "file_dup", filename: "note.txt", status: "completed" },
        { fileId: "file_other", filename: "note.txt", documentId: "doc-2", status: "completed" },
        { fileId: "file_keep", filename: "other.txt", documentId: "doc-2", status: "completed" },
      ],
      { documentId: "doc-1", fileName: "note.txt", savedFileId: "file_saved" }
    );
    expect(ids).toEqual(["file_saved", "file_old", "file_dup"]);
  });

  it("deletes those copies before a new file is attached", async () => {
    const api = fakeApi({
      listStoreFiles: vi.fn(async () => [
        { fileId: "file_old", filename: "note.txt", status: "completed" },
      ]),
    });
    await replaceIndexedCopies(api, "vs_1", {
      documentId: "doc-1",
      fileName: "note.txt",
      savedFileId: "file_saved",
    });
    expect(api.detachFile).toHaveBeenCalledWith("vs_1", "file_saved");
    expect(api.deleteFile).toHaveBeenCalledWith("file_old");
    expect(api.uploadFile).not.toHaveBeenCalled();
  });

  it("reports a clear error and deletes the file when processing does not complete", async () => {
    const api = fakeApi({
      attachFile: vi.fn(async () => ({
        status: "failed",
        errorMessage: "unsupported_file",
      })),
    });
    await expect(
      indexUploadedFile(api, {
        vectorStoreId: "vs_1",
        bytes: new Uint8Array([1]),
        fileName: "note.txt",
        contentType: "text/plain",
      })
    ).rejects.toBeInstanceOf(IndexProcessingError);
    expect(api.deleteFile).toHaveBeenCalledWith("file_1");
  });

  it("treats an already deleted OpenAI file as gone", async () => {
    const missing = new OpenAI.APIError(404, undefined, "No such file", undefined);
    const api = fakeApi({
      detachFile: vi.fn(async () => {
        throw missing;
      }),
      deleteFile: vi.fn(async () => {
        throw missing;
      }),
    });
    await expect(removeIndexedFile(api, "vs_1", "file_1")).resolves.toBe("already_gone");
  });

  it("does not hide other OpenAI delete failures", async () => {
    const api = fakeApi({
      deleteFile: vi.fn(async () => {
        throw new OpenAI.APIError(500, undefined, "server error", undefined);
      }),
    });
    await expect(removeIndexedFile(api, null, "file_1")).rejects.toMatchObject({ status: 500 });
  });
});
