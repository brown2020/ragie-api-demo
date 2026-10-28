import { db } from "@/firebase/firebaseClient";
import { Timestamp, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { create } from "zustand";

interface AuthState {
  uid: string;
  firebaseUid: string;
  authEmail: string;
  authDisplayName: string;
  authPhotoUrl: string;
  authEmailVerified: boolean;
  authReady: boolean;
  authPending: boolean;
  isAdmin: boolean;
  isAllowed: boolean;
  isInvited: boolean;
  lastSignIn: Timestamp | null;
  premium: boolean;
  credits: number;
}

interface AuthActions {
  setAuthDetails: (details: Partial<AuthState>) => void;
  clearAuthDetails: () => void;
}

type AuthStore = AuthState & AuthActions;

const defaultAuthState: AuthState = {
  uid: "",
  firebaseUid: "",
  authEmail: "",
  authDisplayName: "",
  authPhotoUrl: "",
  authEmailVerified: false,
  authReady: false,
  authPending: false,
  isAdmin: false,
  isAllowed: false,
  isInvited: false,
  lastSignIn: null,
  premium: false,
  credits: 0,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...defaultAuthState,

  setAuthDetails: async (details: Partial<AuthState>) => {
    set(details);
    await updateUserDetailsInFirestore({ ...get(), ...details }, get().uid);
  },

  clearAuthDetails: () => set({ ...defaultAuthState }),
}));

async function updateUserDetailsInFirestore(
  details: Partial<AuthState>,
  uid: string
) {
  if (uid) {
    const userRef = doc(db, `users/${uid}`);
    // Create a sanitized object for Firestore
    // Privileged flags and the credit balance are server-owned. Do not send them.
    const sanitizedDetails = {
      firebaseUid: details.firebaseUid ?? "",
      authEmail: details.authEmail ?? "",
      authDisplayName: details.authDisplayName ?? "",
      authPhotoUrl: details.authPhotoUrl ?? "",
      authEmailVerified: details.authEmailVerified ?? false,
      authReady: details.authReady ?? false,
      authPending: details.authPending ?? false,
      isInvited: details.isInvited ?? false,
      lastSignIn: serverTimestamp(),
    };

    try {
      await setDoc(userRef, sanitizedDetails, { merge: true });
    } catch {
      // Firestore sync failure is non-critical — local state is already set
    }
  }
}
