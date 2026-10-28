import { FieldValue, Timestamp } from "firebase-admin/firestore";
import Stripe from "stripe";
import { getAdminDb } from "@/firebase/firebaseAdmin";
import { PURCHASE_AMOUNT_CENTS, PURCHASE_CREDITS, assertCatalogAmount } from "@/lib/billing";

const CLIENT_SAFE_MESSAGES = new Set([
  "Unexpected payment amount",
  "Payment was not successful",
  "Payment does not belong to the authenticated user",
  "Payment product does not match this application",
  "Unexpected payment currency",
  "Payment is missing a valid user",
  "Payment intent is required",
  "Stripe product name is not defined",
  "Payments are not configured",
]);

export type FulfilledPayment = {
  id: string;
  amount: number;
  created: number;
  status: string;
  currency: string;
  description: string | null;
  creditsAdded: number;
  alreadyProcessed: boolean;
};

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Payments are not configured");
  }
  return new Stripe(key);
}

function rethrowClientSafe(error: unknown, fallback: string): never {
  if (error instanceof Error && CLIENT_SAFE_MESSAGES.has(error.message)) {
    throw error;
  }
  throw new Error(fallback);
}

function assertPaymentUserId(userId: string | undefined): string {
  if (
    typeof userId !== "string" ||
    userId.length < 1 ||
    userId.length > 128 ||
    /[\s/\\.#$[\]]/.test(userId)
  ) {
    throw new Error("Payment is missing a valid user");
  }
  return userId;
}

export async function createCatalogPaymentIntent(
  uid: string,
  amount: number
): Promise<string | null> {
  assertCatalogAmount(amount);
  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME?.trim();

  try {
    if (!product) {
      throw new Error("Stripe product name is not defined");
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: PURCHASE_AMOUNT_CENTS,
      currency: "usd",
      metadata: { product, userId: uid },
      description: `Payment for product ${product}`,
    });

    return paymentIntent.client_secret;
  } catch (error) {
    rethrowClientSafe(error, "Failed to create payment intent");
  }
}

export async function fulfillSucceededPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  options?: { expectedUid?: string }
): Promise<FulfilledPayment> {
  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME?.trim();
  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment was not successful");
  }

  const uid = assertPaymentUserId(paymentIntent.metadata?.userId);
  if (options?.expectedUid && options.expectedUid !== uid) {
    throw new Error("Payment does not belong to the authenticated user");
  }

  if (!product || paymentIntent.metadata?.product !== product) {
    throw new Error("Payment product does not match this application");
  }

  if (paymentIntent.currency !== "usd") {
    throw new Error("Unexpected payment currency");
  }

  if (paymentIntent.amount !== PURCHASE_AMOUNT_CENTS) {
    throw new Error("Unexpected payment amount");
  }

  const db = getAdminDb();
  const paymentRef = db.doc(`users/${uid}/payments/${paymentIntent.id}`);
  const profileRef = db.doc(`users/${uid}/profile/userData`);
  let alreadyProcessed = false;

  await db.runTransaction(async (transaction) => {
    const existingPayment = await transaction.get(paymentRef);
    if (existingPayment.exists) {
      alreadyProcessed = true;
      return;
    }

    alreadyProcessed = false;
    transaction.set(paymentRef, {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      createdAt: Timestamp.fromMillis(paymentIntent.created * 1000),
      status: paymentIntent.status,
    });
    transaction.set(
      profileRef,
      { credits: FieldValue.increment(PURCHASE_CREDITS) },
      { merge: true }
    );
  });

  return {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    created: paymentIntent.created,
    status: paymentIntent.status,
    currency: paymentIntent.currency,
    description: paymentIntent.description,
    creditsAdded: alreadyProcessed ? 0 : PURCHASE_CREDITS,
    alreadyProcessed,
  };
}

export async function processCatalogPaymentIntent(
  paymentIntentId: string,
  uid: string
): Promise<FulfilledPayment> {
  if (!paymentIntentId || !/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) {
    throw new Error("Payment intent is required");
  }

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    return await fulfillSucceededPaymentIntent(paymentIntent, { expectedUid: uid });
  } catch (error) {
    rethrowClientSafe(error, "Failed to process payment intent");
  }
}
