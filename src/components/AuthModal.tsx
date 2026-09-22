"use client";

import { auth, hasClientConfig } from "@/firebase/firebaseClient";
import { mapAuthError } from "@/lib/authErrors";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  EmailOnlyForm,
  EmailPasswordForm,
  GoogleSignInButton,
} from "./AuthFormFields";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup" | "email-link" | "forgot";

function titleFor(mode: AuthMode): string {
  if (mode === "signup") return "Create Account";
  if (mode === "forgot") return "Forgot Password";
  if (mode === "email-link") return "Sign In with Email Link";
  return "Sign In";
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  useEffect(() => {
    if (!hasClientConfig || !auth) return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const timeoutId = window.setTimeout(() => {
      let emailFromStorage = window.localStorage.getItem("emailForSignIn");
      if (!emailFromStorage) {
        emailFromStorage =
          window.prompt("Please provide your email for confirmation") || "";
      }
      if (!emailFromStorage) return;

      setLoading(true);
      signInWithEmailLink(auth, emailFromStorage, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn");
          toast.success("Successfully signed in!");
          window.history.replaceState(null, "", window.location.pathname);
        })
        .catch((err) => toast.error(mapAuthError(err)))
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const ensureConfigured = () => {
    if (!hasClientConfig || !auth) {
      toast.error("Authentication is not configured.");
      return false;
    }
    return true;
  };

  const handleGoogleSignIn = async () => {
    if (!ensureConfigured()) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Successfully signed in with Google!");
      onClose();
    } catch (err) {
      toast.error(mapAuthError(err));
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
    if (!ensureConfigured()) return;

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
    } catch (err) {
      toast.error(mapAuthError(err));
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
    if (!ensureConfigured()) return;

    setLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: window.location.origin,
        handleCodeInApp: true,
      });
      window.localStorage.setItem("emailForSignIn", email);
      setEmailLinkSent(true);
      toast.success("Sign-in link sent to your email!");
    } catch (err) {
      toast.error(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!ensureConfigured()) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      toast.success("Password reset link sent (if the account exists).");
    } catch (err) {
      toast.error(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto w-full max-w-md rounded-lg p-6 bg-white shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
      onClose={onClose}
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <h2 id="auth-modal-title" className="text-2xl font-bold mb-6 text-center">
        {titleFor(mode)}
      </h2>

      {emailLinkSent ? (
        <div className="text-center py-4" role="status">
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a sign-in link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Check your email and click the link to sign in.
          </p>
          <button
            type="button"
            onClick={() => setEmailLinkSent(false)}
            className="mt-4 text-blue-700 hover:underline"
          >
            Use a different email
          </button>
        </div>
      ) : resetSent ? (
        <div className="text-center py-4" role="status">
          <p className="text-gray-600 mb-4">
            If an account exists for <strong>{email}</strong>, a password reset
            link is on its way. Check your inbox and spam folder.
          </p>
          <button
            type="button"
            onClick={() => {
              setResetSent(false);
              setMode("signin");
            }}
            className="mt-4 text-blue-700 hover:underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <>
          {mode !== "forgot" && (
            <GoogleSignInButton loading={loading} onClick={handleGoogleSignIn} />
          )}

          {mode !== "forgot" && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>
          )}

          {mode === "email-link" && (
            <EmailOnlyForm
              id="auth-email-link"
              email={email}
              loading={loading}
              submitLabel="Send Sign-In Link"
              onEmail={setEmail}
              onSubmit={handleEmailLinkSignIn}
            />
          )}

          {mode === "forgot" && (
            <EmailOnlyForm
              id="auth-forgot-email"
              email={email}
              loading={loading}
              submitLabel="Send reset link"
              onEmail={setEmail}
              onSubmit={handleForgotPassword}
            />
          )}

          {(mode === "signin" || mode === "signup") && (
            <EmailPasswordForm
              mode={mode}
              email={email}
              password={password}
              loading={loading}
              onEmail={setEmail}
              onPassword={setPassword}
              onSubmit={handleEmailPasswordAuth}
            />
          )}

          <div className="mt-4 text-center text-sm space-y-2">
            {mode === "signin" && (
              <>
                <div>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-blue-700 hover:underline"
                  >
                    Create an account
                  </button>
                  <span className="mx-2 text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => setMode("email-link")}
                    className="text-blue-700 hover:underline"
                  >
                    Sign in with email link
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setMode("forgot");
                  }}
                  className="text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-blue-700 hover:underline"
              >
                Already have an account? Sign in
              </button>
            )}
            {(mode === "email-link" || mode === "forgot") && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-blue-700 hover:underline"
              >
                Sign in with password instead
              </button>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
