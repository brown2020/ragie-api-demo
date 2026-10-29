import { describe, expect, it } from "vitest";
import { askDocuments } from "./askDocuments";
import { deleteDocument } from "./deleteDocument";
import { generateWithChunks } from "./generateActions";
import { indexDocument } from "./indexDocument";
import { retrieveChunks } from "./retrieveChunks";

/**
 * Empty tokens are rejected before any OpenAI or Storage call.
 */
describe("denied mutation (auth boundary)", () => {
  it("indexDocument rejects an empty id token", async () => {
    const result = await indexDocument(
      "https://example.com/file.txt",
      "file.txt",
      "doc-1",
      ""
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
      expect(result.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("indexDocument does not read storage before auth", async () => {
    const result = await indexDocument(
      "http://127.0.0.1:1/latest/meta-data",
      "file.txt",
      "doc-1",
      ""
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
    }
  });

  it("retrieveChunks rejects an empty id token", async () => {
    const result = await retrieveChunks("what is in the file?", "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
      expect(result.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("askDocuments rejects an empty id token", async () => {
    const result = await askDocuments("what is in the file?", "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
      expect(result.error.message).toMatch(/authentication required/i);
    }
  });

  it("deleteDocument rejects an empty id token", async () => {
    const result = await deleteDocument("doc-1", "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
    }
  });

  it("generateWithChunks rejects an empty id token", async () => {
    const result = await generateWithChunks(["chunk"], "what is rag?", "gpt-4o", "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
      expect(result.error.message).toMatch(/authentication required/i);
    }
  });
});
