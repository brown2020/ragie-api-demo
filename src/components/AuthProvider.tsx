"use client";

import { auth } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import useProfileStore from "@/zustand/useProfileStore";
import {
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useFirebaseAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User is signed in
        setAuthDetails({
          uid: firebaseUser.uid,
          firebaseUid: firebaseUser.uid,
          authEmail: firebaseUser.email || "",
          authDisplayName: firebaseUser.displayName || "",
          authPhotoUrl: firebaseUser.photoURL || "",
          authEmailVerified: firebaseUser.emailVerified,
          authReady: true,
          authPending: false,
          lastSignIn: serverTimestamp() as Timestamp,
        });

        // Fetch user profile after auth is set
        await fetchProfile();
      } else {
        // User is signed out
        clearAuthDetails();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuthDetails, clearAuthDetails, fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
