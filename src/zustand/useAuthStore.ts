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
    const { ...oldState } = get();
    const newState = { ...oldState, ...details };
    set(newState);
    await updateUserDetailsInFirestore(newState, get().uid);
  },

  clearAuthDetails: () => set({ ...defaultAuthState }),
}));

async function updateUserDetailsInFirestore(
  details: Partial<AuthState>,
  uid: string
) {
  if (uid) {
    const userRef = doc(db, `users/${uid}`);
    console.log("Updating auth details in Firestore:", details);

    // Create a sanitized object for Firestore
    const sanitizedDetails = {
      firebaseUid: details.firebaseUid,
      authEmail: details.authEmail,
      authDisplayName: details.authDisplayName,
      authPhotoUrl: details.authPhotoUrl,
      authEmailVerified: details.authEmailVerified,
      authReady: details.authReady,
      authPending: details.authPending,
      isAdmin: details.isAdmin,
      isAllowed: details.isAllowed,
      isInvited: details.isInvited,
      premium: details.premium,
      credits: details.credits,
      lastSignIn: serverTimestamp(), // Ensure lastSignIn is always updated
    };

    try {
      await setDoc(userRef, sanitizedDetails, { merge: true });
      console.log("Auth details updated successfully in Firestore.");
    } catch (error) {
      console.error("Error updating auth details in Firestore:", error);
    }
  }
}
