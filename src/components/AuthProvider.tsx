"use client";

import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { useAuthStore } from "@/zustand/useAuthStore";
import useProfileStore from "@/zustand/useProfileStore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  // When Firebase public config is absent (CI/SSG), auth is immediately ready as signed-out.
  const [loading, setLoading] = useState(() => Boolean(hasClientConfig && auth));
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    if (!hasClientConfig || !auth) {
      clearAuthDetails();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
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

        await fetchProfile();
      } else {
        clearAuthDetails();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuthDetails, clearAuthDetails, fetchProfile]);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
