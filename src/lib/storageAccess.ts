import { INPUT_LIMITS } from "./inputLimits";

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

const EXTENSION_TYPES: Record<string, (typeof ALLOWED_DOCUMENT_TYPES)[number]> = {
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function contentTypeBase(contentType: string | null | undefined): string {
  return (contentType ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
}

export function isAllowedDocumentType(contentType: string | null | undefined): boolean {
  return (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(
    contentTypeBase(contentType)
  );
}

export function contentTypeForFileName(
  fileName: string,
  browserType?: string
): string | null {
  if (isAllowedDocumentType(browserType)) {
    return contentTypeBase(browserType);
  }
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPES[extension] ?? null;
}

export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? "document";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "");
  const trimmed = cleaned.slice(0, 120);
  return trimmed || "document";
}

export function isSafeStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === "firebasestorage.googleapis.com" ||
      host.endsWith(".firebasestorage.app")
    );
  } catch {
    return false;
  }
}

export function assertUserDocumentPath(path: string, uid: string): string {
  if (typeof path !== "string" || typeof uid !== "string" || !uid) {
    throw new Error("Invalid storage path");
  }

  const normalized = path.trim();
  const prefix = `users/${uid}/documents/`;
  if (
    !normalized ||
    normalized.length > 1024 ||
    normalized.includes("..") ||
    normalized.includes("\\") ||
    normalized.includes("\0") ||
    normalized.startsWith("/") ||
    normalized.includes("//") ||
    !normalized.startsWith(prefix)
  ) {
    throw new Error("Invalid storage path");
  }

  const objectName = normalized.slice(prefix.length);
  if (!objectName || objectName.includes("/")) {
    throw new Error("Invalid storage path");
  }

  return normalized;
}

/**
 * Resolve a storage object path from a caller reference.
 * HTTPS inputs are parsed and never fetched.
 */
export function storagePathFromReference(
  reference: string,
  uid: string,
  bucketName?: string
): string {
  const trimmed = reference?.trim?.() ?? "";
  if (!trimmed) {
    throw new Error("Invalid storage path");
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return assertUserDocumentPath(trimmed, uid);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Invalid storage path");
  }

  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error("Invalid storage path");
  }

  if (parsed.hostname.toLowerCase() !== "firebasestorage.googleapis.com") {
    throw new Error("Invalid storage path");
  }

  const match = parsed.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
  if (!match?.[1] || !match[2]) {
    throw new Error("Invalid storage path");
  }

  const bucket = decodeURIComponent(match[1]);
  const configuredBucket = bucketName?.trim();
  if (!configuredBucket || bucket !== configuredBucket) {
    throw new Error("Invalid storage path");
  }

  let objectPath: string;
  try {
    objectPath = decodeURIComponent(match[2]);
  } catch {
    throw new Error("Invalid storage path");
  }

  return assertUserDocumentPath(objectPath, uid);
}

export function assertUploadSize(size: number): void {
  if (!Number.isFinite(size) || size <= 0 || size > INPUT_LIMITS.maxUploadBytes) {
    throw new Error("File is too large");
  }
}
