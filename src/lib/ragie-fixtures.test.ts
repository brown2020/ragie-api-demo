import { describe, expect, it } from "vitest";
import {
  FIXTURE_CHUNKS,
  FIXTURE_UPLOAD,
  ragieFixturesEnabled,
} from "./ragie-fixtures";

describe("ragie fixtures (labeled — no paid credit burn)", () => {
  it("exposes fixture chunks marked as fixture text", () => {
    expect(FIXTURE_CHUNKS.scored_chunks[0].text).toContain("[fixture]");
    expect(FIXTURE_CHUNKS.scored_chunks.length).toBeGreaterThan(0);
  });

  it("exposes fixture upload payload", () => {
    expect(FIXTURE_UPLOAD.fixture).toBe(true);
    expect(FIXTURE_UPLOAD.id).toBeTruthy();
  });

  it("reads RAGIE_USE_FIXTURES flag", () => {
    const prev = process.env.RAGIE_USE_FIXTURES;
    process.env.RAGIE_USE_FIXTURES = "true";
    expect(ragieFixturesEnabled()).toBe(true);
    process.env.RAGIE_USE_FIXTURES = "false";
    expect(ragieFixturesEnabled()).toBe(false);
    if (prev === undefined) delete process.env.RAGIE_USE_FIXTURES;
    else process.env.RAGIE_USE_FIXTURES = prev;
  });
});
