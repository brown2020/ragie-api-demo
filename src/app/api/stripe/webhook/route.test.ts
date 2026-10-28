import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const ORIGINAL_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const ORIGINAL_KEY = process.env.STRIPE_SECRET_KEY;

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = ORIGINAL_SECRET;
  if (ORIGINAL_KEY === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = ORIGINAL_KEY;
});

describe("Stripe webhook", () => {
  it("stays disabled when STRIPE_WEBHOOK_SECRET is unset", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
      })
    );
    expect(response.status).toBe(503);
  });

  it("rejects a body whose signature does not match the secret", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit_test_secret";
    process.env.STRIPE_SECRET_KEY = "sk_test_unit_placeholder";

    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=deadbeef" },
        body: JSON.stringify({ id: "evt_test", type: "payment_intent.succeeded" }),
      })
    );

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toMatch(/signature/i);
  });
});
