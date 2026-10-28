import { describe, expect, it } from "vitest";
import { INPUT_LIMITS, assertChunks, assertQuery } from "./inputLimits";

describe("generation input limits", () => {
  it("rejects empty and oversized queries", () => {
    expect(() => assertQuery("  ")).toThrow(/empty/i);
    expect(() => assertQuery("a".repeat(INPUT_LIMITS.maxQueryChars + 1))).toThrow(
      /too long/i
    );
    expect(assertQuery("  what is rag?  ")).toBe("what is rag?");
  });

  it("rejects too many or too large chunks", () => {
    expect(() => assertChunks([])).toThrow(/no context/i);
    expect(() =>
      assertChunks(Array.from({ length: INPUT_LIMITS.maxChunks + 1 }, () => "x"))
    ).toThrow(/too many/i);
    expect(() => assertChunks(["x".repeat(INPUT_LIMITS.maxChunkChars + 1)])).toThrow(
      /too long/i
    );
    expect(assertChunks(["alpha", "beta"])).toEqual(["alpha", "beta"]);
  });
});
