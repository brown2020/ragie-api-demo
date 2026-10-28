"use server";

import { verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import {
  createCatalogPaymentIntent,
  processCatalogPaymentIntent,
} from "@/lib/payments";

export async function createPaymentIntent(amount: number, idToken: string) {
  const uid = await verifyFirebaseIdToken(idToken);
  return createCatalogPaymentIntent(uid, amount);
}

export async function processPaymentIntent(
  paymentIntentId: string,
  idToken: string
) {
  const uid = await verifyFirebaseIdToken(idToken);
  return processCatalogPaymentIntent(paymentIntentId, uid);
}
