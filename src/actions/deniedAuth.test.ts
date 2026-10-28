import { describe, expect, it } from "vitest";
import { generateWithChunks } from "./generateActions";
import { uploadToRagie } from "./uploadToRagie";
import { retrieveChunks } from "./retrieveChunks";

/**
 * Regression: unauthorized / empty token must be denied server-side.
 * Does not call live Ragie (fixtures short-circuit only after auth).
 */
describe("denied mutation (auth boundary)", () => {
  it("uploadToRagie rejects empty idToken", async () => {
    const result = await uploadToRagie(
      "https://example.com/file.txt",
      "file.txt",
      ""
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
      expect(result.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("retrieveChunks rejects empty idToken", async () => {
    await expect(retrieveChunks("what is rag?", "")).rejects.toThrow(
      /authentication required/i
    );
  });

  it("generateWithChunks rejects empty idToken before calling a model", async () => {
    await expect(
      generateWithChunks(["chunk"], "what is rag?", "gpt-4o", "")
    ).rejects.toThrow(/authentication required/i);
  });

  it("uploadToRagie does not fetch a caller-supplied URL before auth", async () => {
    const result = await uploadToRagie(
      "http://127.0.0.1:1/latest/meta-data",
      "file.txt",
      ""
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
    }
  });
});
