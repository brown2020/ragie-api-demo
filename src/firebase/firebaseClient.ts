import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
};

// Initialize Firebase
let app;
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;
let storage: ReturnType<typeof getStorage>;
let analytics: ReturnType<typeof getAnalytics> | undefined;

try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  if (typeof window !== "undefined") {
    isSupported()
      .then((supported) => {
        if (supported) {
          analytics = getAnalytics(app!);
        }
      })
      .catch(console.error);
  }
} catch (e) {
  console.warn("Firebase client init failed:", e);
  // Provide fallback stubs so imports don't crash at build time
  db = {} as ReturnType<typeof getFirestore>;
  auth = {} as ReturnType<typeof getAuth>;
  storage = {} as ReturnType<typeof getStorage>;
}

export { db, auth, storage, analytics };
