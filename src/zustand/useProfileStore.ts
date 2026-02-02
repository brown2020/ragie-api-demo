import { create } from "zustand";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import { db } from "@/firebase/firebaseClient";

export interface ProfileType {
  email: string;
  contactEmail: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
  credits: number;
}

const defaultProfile: ProfileType = {
  email: "",
  contactEmail: "",
  displayName: "",
  photoUrl: "",
  emailVerified: false,
  credits: 0,
};

interface AuthState {
  authEmail?: string;
  authDisplayName?: string;
  authPhotoUrl?: string;
  authEmailVerified?: boolean;
}

interface ProfileState {
  profile: ProfileType;
  fetchProfile: () => Promise<void>;
  updateProfile: (newProfile: Partial<ProfileType>) => Promise<void>;
  useCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
}

const mergeProfileWithDefaults = (
  profile: Partial<ProfileType>,
  authState: AuthState
): ProfileType => ({
  ...defaultProfile,
  ...profile,
  credits: profile.credits && profile.credits >= 100 ? profile.credits : 1000,
  email: authState.authEmail || profile.email || "",
  contactEmail: profile.contactEmail || authState.authEmail || "",
  displayName: profile.displayName || authState.authDisplayName || "",
  photoUrl: profile.photoUrl || authState.authPhotoUrl || "",
});

const useProfileStore = create<ProfileState>((set, get) => ({
  profile: defaultProfile,

  fetchProfile: async () => {
    const { uid, authEmail, authDisplayName, authPhotoUrl, authEmailVerified } =
      useAuthStore.getState();
    if (!uid) return;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);
      const docSnap = await getDoc(userRef);

      let newProfile: ProfileType;

      if (docSnap.exists()) {
        newProfile = mergeProfileWithDefaults(docSnap.data() as ProfileType, {
          authEmail,
          authDisplayName,
          authPhotoUrl,
          authEmailVerified,
        });
      } else {
        newProfile = {
          email: authEmail || "",
          contactEmail: "",
          displayName: authDisplayName || "",
          photoUrl: authPhotoUrl || "",
          emailVerified: authEmailVerified || false,
          credits: 1000,
        };
        await setDoc(userRef, newProfile);
      }

      set({ profile: newProfile });
    } catch (error) {
      console.error("Error fetching or creating profile:", error);
    }
  },

  updateProfile: async (newProfile: Partial<ProfileType>) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);
      const updatedProfile = { ...get().profile, ...newProfile };

      await updateDoc(userRef, updatedProfile);
      set({ profile: updatedProfile });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Use atomic transaction to prevent double-spending
  useCredits: async (amount: number) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return false;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);

      // Use transaction to ensure atomic read-modify-write
      const result = await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(userRef);
        if (!docSnap.exists()) {
          throw new Error("Profile not found");
        }

        const currentCredits = docSnap.data().credits || 0;
        if (currentCredits < amount) {
          return false;
        }

        transaction.update(userRef, { credits: increment(-amount) });
        return true;
      });

      if (result) {
        // Update local state after successful transaction
        const profile = get().profile;
        set({ profile: { ...profile, credits: profile.credits - amount } });
      }

      return result;
    } catch (error) {
      console.error("Error using credits:", error);
      return false;
    }
  },

  // Use atomic increment to prevent race conditions
  addCredits: async (amount: number) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);

      await updateDoc(userRef, { credits: increment(amount) });

      // Re-fetch to get accurate value after increment
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          profile: { ...get().profile, credits: data.credits || 0 },
        });
      }
    } catch (error) {
      console.error("Error adding credits:", error);
      throw error;
    }
  },
}));

export default useProfileStore;
