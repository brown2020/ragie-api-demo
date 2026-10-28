import { describe, expect, it } from "vitest";
import {
  CREDIT_COSTS,
  PURCHASE_AMOUNT_CENTS,
  PURCHASE_CREDITS,
  assertCatalogAmount,
} from "./billing";

describe("catalog billing", () => {
  it("pins the checkout price at $99.99 and grants 10,000 credits", () => {
    expect(PURCHASE_AMOUNT_CENTS).toBe(9999);
    expect(PURCHASE_CREDITS).toBe(10_000);
  });

  it("rejects client-supplied amounts other than the catalog price", () => {
    expect(() => assertCatalogAmount(50)).toThrow(/unexpected payment amount/i);
    expect(() => assertCatalogAmount(9999.5)).toThrow(/unexpected payment amount/i);
    expect(() => assertCatalogAmount(PURCHASE_AMOUNT_CENTS)).not.toThrow();
  });

  it("charges credits for upload, retrieval, and generation", () => {
    expect(CREDIT_COSTS.upload).toBeGreaterThan(0);
    expect(CREDIT_COSTS.retrieve).toBeGreaterThan(0);
    expect(CREDIT_COSTS.generate).toBeGreaterThan(0);
  });
});
