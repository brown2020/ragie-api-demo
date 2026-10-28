/** Fixed catalog price. $99.99 is 9999 cents; the +1 credit bump is not used. */
export const PURCHASE_AMOUNT_CENTS = 9999;

/** Credits granted for one successful catalog purchase. */
export const PURCHASE_CREDITS = 10_000;

export const PURCHASE_AMOUNT_DOLLARS = PURCHASE_AMOUNT_CENTS / 100;

/** App credits charged per successful server action. Refunded if the call fails. */
export const CREDIT_COSTS = {
  upload: 5,
  retrieve: 1,
  generate: 10,
} as const;

export function assertCatalogAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount !== PURCHASE_AMOUNT_CENTS) {
    throw new Error("Unexpected payment amount");
  }
}
