import { describe, expect, it } from "vitest";
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
});
