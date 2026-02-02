"use client";

import { auth } from "@/firebase/firebaseClient";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup" | "email-link";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  // Check if returning from email link sign-in
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailFromStorage = window.localStorage.getItem("emailForSignIn");
      if (!emailFromStorage) {
        emailFromStorage = window.prompt("Please provide your email for confirmation") || "";
      }

      if (emailFromStorage) {
        setLoading(true);
        signInWithEmailLink(auth, emailFromStorage, window.location.href)
          .then(() => {
            window.localStorage.removeItem("emailForSignIn");
            toast.success("Successfully signed in!");
            // Clean up URL
            window.history.replaceState(null, "", window.location.pathname);
          })
          .catch((error) => {
            console.error("Email link sign-in error:", error);
            toast.error("Failed to sign in with email link");
          })
          .finally(() => setLoading(false));
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Successfully signed in with Google!");
      onClose();
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Successfully signed in!");
      }
      onClose();
    } catch (error) {
      console.error("Email/password auth error:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setEmailLinkSent(true);
      toast.success("Sign-in link sent to your email!");
    } catch (error) {
      console.error("Email link error:", error);
      toast.error("Failed to send sign-in link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "signin" && "Sign In"}
          {mode === "signup" && "Create Account"}
          {mode === "email-link" && "Sign In with Email Link"}
        </h2>

        {emailLinkSent ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              We&apos;ve sent a sign-in link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Check your email and click the link to sign in.
            </p>
            <button
              onClick={() => setEmailLinkSent(false)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            {mode === "email-link" ? (
              <form onSubmit={handleEmailLinkSignIn}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Sign-In Link"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailPasswordAuth}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
                </button>
              </form>
            )}

            {/* Mode Switchers */}
            <div className="mt-4 text-center text-sm">
              {mode === "signin" && (
                <>
                  <button
                    onClick={() => setMode("signup")}
                    className="text-blue-600 hover:underline"
                  >
                    Create an account
                  </button>
                  <span className="mx-2 text-gray-400">|</span>
                  <button
                    onClick={() => setMode("email-link")}
                    className="text-blue-600 hover:underline"
                  >
                    Sign in with email link
                  </button>
                </>
              )}
              {mode === "signup" && (
                <button
                  onClick={() => setMode("signin")}
                  className="text-blue-600 hover:underline"
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === "email-link" && (
                <button
                  onClick={() => setMode("signin")}
                  className="text-blue-600 hover:underline"
                >
                  Sign in with password instead
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
