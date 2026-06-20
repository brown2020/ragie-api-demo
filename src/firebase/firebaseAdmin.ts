import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Bucket } from "@google-cloud/storage";

let adminBucket: Bucket;
let adminDb: Firestore;
let adminAuth: Auth;

try {
  const adminCredentials = {
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_CERTS_URL,
  };

  if (!getApps().length) {
    admin.initializeApp({
      credential: admin.credential.cert(adminCredentials as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    });
  }
  adminBucket = admin.storage().bucket();
  adminDb = admin.firestore();
  adminAuth = admin.auth();
} catch {
  adminBucket = {} as Bucket;
  adminDb = {} as Firestore;
  adminAuth = {} as Auth;
}

export { adminBucket, adminDb, adminAuth, admin };

export async function verifyFirebaseIdToken(idToken: string): Promise<string> {
  if (!idToken) {
    throw new Error("User authentication required");
  }

  if (typeof adminAuth.verifyIdToken !== "function") {
    throw new Error("Firebase Admin Auth is not configured");
  }

  const decodedToken = await adminAuth.verifyIdToken(idToken);
  if (!decodedToken.uid) {
    throw new Error("Invalid Firebase authentication token");
  }

  return decodedToken.uid;
}

export function getAdminDb(): Firestore {
  if (typeof adminDb.doc !== "function") {
    throw new Error("Firebase Admin Firestore is not configured");
  }

  return adminDb;
}
