import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  fulfillSucceededPaymentIntent,
  getStripe,
} from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IGNORED_FULFILLMENT_ERRORS = new Set([
  "Payment product does not match this application",
  "Unexpected payment amount",
  "Unexpected payment currency",
  "Payment is missing a valid user",
  "Payment was not successful",
]);

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    try {
      await fulfillSucceededPaymentIntent(paymentIntent);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (IGNORED_FULFILLMENT_ERRORS.has(message)) {
        return NextResponse.json({ received: true, ignored: true });
      }
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
