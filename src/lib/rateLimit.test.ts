import { describe, expect, it } from "vitest";
import { assertRateLimit, resetRateLimits } from "./rateLimit";

describe("assertRateLimit", () => {
  it("blocks the request that exceeds the window", () => {
    resetRateLimits();
    const now = 1_000;
    assertRateLimit("user:upload", 2, 5_000, now);
    assertRateLimit("user:upload", 2, 5_000, now + 1);
    expect(() => assertRateLimit("user:upload", 2, 5_000, now + 2)).toThrow(
      /too many requests/i
    );
  });

  it("resets after the window elapses", () => {
    resetRateLimits();
    assertRateLimit("user:retrieve", 1, 1_000, 0);
    expect(() => assertRateLimit("user:retrieve", 1, 1_000, 500)).toThrow(
      /too many requests/i
    );
    expect(() => assertRateLimit("user:retrieve", 1, 1_000, 1_000)).not.toThrow();
  });
});
