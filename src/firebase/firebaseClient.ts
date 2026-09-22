import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
};

/** True when public Firebase web config is present (false in CI without secrets). */
export const hasClientConfig = Boolean(firebaseConfig.apiKey?.trim());

let app: FirebaseApp | undefined;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (hasClientConfig) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  // CI gate / SSG without Actions secrets: skip module-level init so
  // prerender does not throw auth/invalid-api-key.
  console.warn(
    "Firebase client config missing (NEXT_PUBLIC_FIREBASE_APIKEY); deferring init"
  );
  db = null as unknown as Firestore;
  auth = null as unknown as Auth;
  storage = null as unknown as FirebaseStorage;
}

export { auth, db, storage };

export async function getFirebaseIdToken(): Promise<string> {
  if (!hasClientConfig || !auth) {
    throw new Error("Firebase client is not configured");
  }
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User authentication required");
  }

  return currentUser.getIdToken();
}
