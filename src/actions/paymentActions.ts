// paymentActions.ts
"use server";

import { getAdminDb, verifyFirebaseIdToken, admin } from "@/firebase/firebaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function createPaymentIntent(amount: number, idToken: string) {
  const uid = await verifyFirebaseIdToken(idToken);

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Payment amount must be a positive integer");
  }

  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;

  try {
    if (!product) throw new Error("Stripe product name is not defined");

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { product, userId: uid },
      description: `Payment for product ${product}`,
    });

    return paymentIntent.client_secret;
  } catch {
    throw new Error("Failed to create payment intent");
  }
}

export async function processPaymentIntent(
  paymentIntentId: string,
  idToken: string
) {
  const uid = await verifyFirebaseIdToken(idToken);
  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;

  if (!paymentIntentId) {
    throw new Error("Payment intent is required");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment was not successful");
    }

    if (paymentIntent.metadata.userId !== uid) {
      throw new Error("Payment does not belong to the authenticated user");
    }

    if (product && paymentIntent.metadata.product !== product) {
      throw new Error("Payment product does not match this application");
    }

    if (paymentIntent.currency !== "usd") {
      throw new Error("Unexpected payment currency");
    }

    const creditsToAdd = paymentIntent.amount + 1;
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

      transaction.set(paymentRef, {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        createdAt: admin.firestore.Timestamp.fromMillis(paymentIntent.created * 1000),
        status: paymentIntent.status,
      });

      transaction.set(
        profileRef,
        { credits: admin.firestore.FieldValue.increment(creditsToAdd) },
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
      creditsAdded: alreadyProcessed ? 0 : creditsToAdd,
      alreadyProcessed,
    };
  } catch {
    throw new Error("Failed to process payment intent");
  }
}
