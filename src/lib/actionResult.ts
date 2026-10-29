export type ActionError = {
  status: number;
  code: string;
  message: string;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export function actionFailure(
  status: number,
  code: string,
  message: string
): ActionResult<never> {
  return { ok: false, error: { status, code, message } };
}

export function mapKnownActionError(error: unknown): ActionResult<never> | null {
  if (!(error instanceof Error)) return null;
  if (error.message === "Not enough credits") {
    return actionFailure(402, "INSUFFICIENT_CREDITS", "Not enough credits.");
  }
  if (error.message === "Too many requests. Please try again later.") {
    return actionFailure(429, "RATE_LIMITED", error.message);
  }
  if (error.message === "Invalid storage path") {
    return actionFailure(400, "INVALID_STORAGE_PATH", "That file is not in your storage.");
  }
  if (error.message === "File is too large") {
    return actionFailure(413, "FILE_TOO_LARGE", "File is too large to index.");
  }
  if (
    error.message === "Firebase Admin Storage is not configured" ||
    error.message === "Firebase Admin Firestore is not configured"
  ) {
    return actionFailure(500, "STORAGE_NOT_CONFIGURED", "File storage is not configured.");
  }
  if (error.message === "User authentication required" || error.message === "Invalid Firebase authentication token") {
    return actionFailure(401, "UNAUTHORIZED", "User authentication required.");
  }
  if (error.message === "Firebase Admin Auth is not configured") {
    return actionFailure(500, "AUTH_NOT_CONFIGURED", "Sign-in verification is not configured.");
  }
  return null;
}
