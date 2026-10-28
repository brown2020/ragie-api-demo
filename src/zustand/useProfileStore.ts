import { create } from "zustand";
import {
  doc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import { db } from "@/firebase/firebaseClient";
import { pickEditableProfileFields } from "@/lib/profileFields";

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
}

const mergeProfileWithDefaults = (
  profile: Partial<ProfileType>,
  authState: AuthState
): ProfileType => ({
  ...defaultProfile,
  ...profile,
  credits: profile.credits !== undefined ? profile.credits : 1000,
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
      const authState = {
        authEmail,
        authDisplayName,
        authPhotoUrl,
        authEmailVerified,
      };

      // Read and create inside one transaction so a payment increment cannot be overwritten.
      const newProfile = await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(userRef);
        if (!docSnap.exists()) {
          const created: ProfileType = {
            email: authEmail || "",
            contactEmail: "",
            displayName: authDisplayName || "",
            photoUrl: authPhotoUrl || "",
            emailVerified: authEmailVerified || false,
            credits: 1000,
          };
          transaction.set(userRef, created);
          return created;
        }

        const data = docSnap.data() as Partial<ProfileType>;
        const merged = mergeProfileWithDefaults(data, authState);
        const needsScaffold =
          typeof data.email !== "string" ||
          typeof data.contactEmail !== "string" ||
          typeof data.displayName !== "string" ||
          typeof data.photoUrl !== "string" ||
          typeof data.emailVerified !== "boolean";

        if (needsScaffold) {
          transaction.set(
            userRef,
            {
              email: merged.email,
              contactEmail: merged.contactEmail,
              displayName: merged.displayName,
              photoUrl: merged.photoUrl,
              emailVerified: merged.emailVerified,
            },
            { merge: true }
          );
        }

        return {
          ...merged,
          credits: typeof data.credits === "number" ? data.credits : merged.credits,
        };
      });

      set({ profile: newProfile });
    } catch {
      // Profile fetch/create failure handled silently — retried on next access
    }
  },

  updateProfile: async (newProfile: Partial<ProfileType>) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return;

    try {
      const patch = pickEditableProfileFields(newProfile);
      if (Object.keys(patch).length === 0) return;

      const userRef = doc(db, `users/${uid}/profile/userData`);
      await updateDoc(userRef, patch);
      set({ profile: { ...get().profile, ...patch } });
    } catch (error) {
      throw error;
    }
  },
}));

export default useProfileStore;
