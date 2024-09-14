import { create } from "zustand";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";
import { db } from "@/firebase/firebaseClient";

// Updated ProfileType to include new API keys
export interface ProfileType {
  email: string;
  contactEmail: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
  credits: number;
  ragie_api_key: string;
  openai_api_key: string;
  anthropic_api_key: string; // New API key
  google_gen_ai_api_key: string; // New API key
  mistral_api_key: string; // New API key
  fireworks_api_key: string; // New API key
}

// Updated defaultProfile with new API keys initialized
const defaultProfile: ProfileType = {
  email: "",
  contactEmail: "",
  displayName: "",
  photoUrl: "",
  emailVerified: false,
  credits: 0,
  ragie_api_key: "",
  openai_api_key: "",
  anthropic_api_key: "", // New API key default
  google_gen_ai_api_key: "", // New API key default
  mistral_api_key: "", // New API key default
  fireworks_api_key: "", // New API key default
};

interface AuthState {
  authEmail?: string;
  authDisplayName?: string;
  authPhotoUrl?: string;
  authEmailVerified?: boolean;
}

interface ProfileState {
  profile: ProfileType;
  fetchProfile: () => void;
  updateProfile: (newProfile: Partial<ProfileType>) => Promise<void>;
  useCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
}

// Merge profile with new API keys if they exist in authState
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
        console.log("Profile found:", newProfile);
      } else {
        newProfile = {
          email: authEmail || "",
          contactEmail: "",
          displayName: authDisplayName || "",
          photoUrl: authPhotoUrl || "",
          emailVerified: authEmailVerified || false,
          credits: 1000,
          ragie_api_key: "",
          openai_api_key: "",
          anthropic_api_key: "", // New API key default
          google_gen_ai_api_key: "", // New API key default
          mistral_api_key: "", // New API key default
          fireworks_api_key: "", // New API key default
        };
        console.log("No profile found. Creating new profile document.");
      }

      await setDoc(userRef, newProfile);
      set({ profile: newProfile });
    } catch (error) {
      console.error("Error fetching or creating profile:", error);
    }
  },

  updateProfile: async (newProfile: Partial<ProfileType>) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return;

    console.log("Updating profile:", newProfile);

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);
      const updatedProfile = { ...get().profile, ...newProfile };

      set({ profile: updatedProfile });
      await updateDoc(userRef, updatedProfile);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  },

  useCredits: async (amount: number) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return false;

    const profile = get().profile;
    if (profile.credits < amount) {
      return false;
    }

    try {
      const newCredits = profile.credits - amount;
      const userRef = doc(db, `users/${uid}/profile/userData`);

      await updateDoc(userRef, { credits: newCredits });
      set({ profile: { ...profile, credits: newCredits } });

      return true;
    } catch (error) {
      console.error("Error using credits:", error);
      return false;
    }
  },

  addCredits: async (amount: number) => {
    const uid = useAuthStore.getState().uid;
    if (!uid) return;

    const profile = get().profile;
    const newCredits = profile.credits + amount;

    try {
      const userRef = doc(db, `users/${uid}/profile/userData`);

      await updateDoc(userRef, { credits: newCredits });
      set({ profile: { ...profile, credits: newCredits } });
    } catch (error) {
      console.error("Error adding credits:", error);
    }
  },
}));

export default useProfileStore;
