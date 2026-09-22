import { describe, expect, it } from "vitest";
import convertToSubcurrency from "./convertToSubcurrency";

describe("convertToSubcurrency", () => {
  it("converts dollars to cents", () => {
    expect(convertToSubcurrency(10)).toBe(1000);
  });

  it("handles fractional dollars", () => {
    expect(convertToSubcurrency(10.5)).toBe(1050);
  });
});
