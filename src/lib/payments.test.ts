import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { fulfillSucceededPaymentIntent } from "./payments";

describe("fulfillSucceededPaymentIntent", () => {
  it("rejects a succeeded intent whose amount is not the catalog price", async () => {
    const previous = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME = "rag-demo";

    const paymentIntent = {
      id: "pi_testamount",
      status: "succeeded",
      amount: 50,
      currency: "usd",
      created: 1_700_000_000,
      description: null,
      metadata: { userId: "user123", product: "rag-demo" },
    } as unknown as Stripe.PaymentIntent;

    await expect(fulfillSucceededPaymentIntent(paymentIntent)).rejects.toThrow(
      /unexpected payment amount/i
    );

    if (previous === undefined) delete process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
    else process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME = previous;
  });

  it("rejects an intent owned by a different Firebase user", async () => {
    const previous = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
    process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME = "rag-demo";

    const paymentIntent = {
      id: "pi_testowner",
      status: "succeeded",
      amount: 9999,
      currency: "usd",
      created: 1_700_000_000,
      description: null,
      metadata: { userId: "user123", product: "rag-demo" },
    } as unknown as Stripe.PaymentIntent;

    await expect(
      fulfillSucceededPaymentIntent(paymentIntent, { expectedUid: "someoneelse" })
    ).rejects.toThrow(/does not belong/i);

    if (previous === undefined) delete process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
    else process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME = previous;
  });
});
