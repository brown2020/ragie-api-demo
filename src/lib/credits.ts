import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/firebaseAdmin";

export async function debitCredits(uid: string, cost: number): Promise<void> {
  if (!Number.isInteger(cost) || cost <= 0) {
    throw new Error("Invalid credit cost");
  }

  const db = getAdminDb();
  const profileRef = db.doc(`users/${uid}/profile/userData`);

  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(profileRef);
    const current = snap.exists ? Number(snap.get("credits") ?? 0) : 0;
    if (!snap.exists || !Number.isFinite(current) || current < cost) {
      throw new Error("Not enough credits");
    }
    transaction.set(
      profileRef,
      { credits: FieldValue.increment(-cost) },
      { merge: true }
    );
  });
}

export async function refundCredits(uid: string, cost: number): Promise<void> {
  if (!Number.isInteger(cost) || cost <= 0) {
    throw new Error("Invalid credit cost");
  }

  const db = getAdminDb();
  const profileRef = db.doc(`users/${uid}/profile/userData`);
  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(profileRef);
    if (!snap.exists) return;
    transaction.set(
      profileRef,
      { credits: FieldValue.increment(cost) },
      { merge: true }
    );
  });
}

/** Debit before `fn`. Refund when `fn` throws so a failed provider call is not billed. */
export async function withCredits<T>(
  uid: string,
  cost: number,
  fn: () => Promise<T>
): Promise<T> {
  await debitCredits(uid, cost);
  try {
    return await fn();
  } catch (error) {
    try {
      await refundCredits(uid, cost);
    } catch {
      // Preserve the original failure when the refund write also fails.
    }
    throw error;
  }
}
