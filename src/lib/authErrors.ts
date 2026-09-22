const AUTH_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/invalid-login-credentials": "Invalid email or password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/account-exists-with-different-credential":
    "An account with this email already exists using a different sign-in method.",
  "auth/missing-email": "Please enter your email address.",
  "auth/requires-recent-login": "Please sign in again to continue.",
};

function authCode(error: unknown): string | null {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  if (error instanceof Error) {
    const match = /auth\/[\w-]+/.exec(error.message);
    return match ? match[0] : null;
  }
  return null;
}

/**
 * Map Firebase Auth codes to short UI messages.
 * Log the code at warn — never console.error(Error) (Next overlays).
 */
export function mapAuthError(error: unknown): string {
  const code = authCode(error);
  if (code) {
    console.warn(`[auth] ${code}`);
    return AUTH_MESSAGES[code] || "Something went wrong. Please try again.";
  }
  console.warn("[auth] unexpected-error");
  return "Something went wrong. Please try again.";
}
