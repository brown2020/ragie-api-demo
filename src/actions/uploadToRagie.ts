// app/actions/uploadToRagie.ts
"use server";

import { getAdminBucket, verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { INPUT_LIMITS } from "@/lib/inputLimits";
import { ragieErrorResult, type RagieActionResult } from "@/lib/ragie-errors";
import {
  FIXTURE_UPLOAD,
  ragieFixturesEnabled,
} from "@/lib/ragie-fixtures";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";
import {
  assertUploadSize,
  isAllowedDocumentType,
  sanitizeFileName,
  storagePathFromReference,
} from "@/lib/storageAccess";

const FETCH_TIMEOUT = 30000; // 30 seconds

function failure(
  status: number,
  code: string,
  message: string
): RagieActionResult<never> {
  return { ok: false, error: { status, code, message } };
}

function mapKnownFailure(error: unknown): RagieActionResult<never> | null {
  if (!(error instanceof Error)) return null;
  if (error.message === "Not enough credits") {
    return failure(402, "INSUFFICIENT_CREDITS", "Not enough credits.");
  }
  if (error.message === "Too many requests. Please try again later.") {
    return failure(429, "RATE_LIMITED", error.message);
  }
  if (error.message === "Invalid storage path") {
    return failure(400, "INVALID_STORAGE_PATH", "That file is not in your storage.");
  }
  if (error.message === "File is too large") {
    return failure(413, "FILE_TOO_LARGE", "File is too large to upload to Ragie.");
  }
  if (
    error.message === "Firebase Admin Storage is not configured" ||
    error.message === "Firebase Admin Firestore is not configured"
  ) {
    return failure(500, "STORAGE_NOT_CONFIGURED", "File storage is not configured.");
  }
  return null;
}

export async function uploadToRagie(
  fileRef: string,
  fileName: string,
  idToken: string
): Promise<RagieActionResult<unknown>> {
  let uid: string;

  try {
    uid = await verifyFirebaseIdToken(idToken);
  } catch {
    return failure(401, "UNAUTHORIZED", "User authentication required.");
  }

  const safeName = sanitizeFileName(fileName ?? "");
  if (!fileName?.trim() || fileName.length > INPUT_LIMITS.maxFileNameChars) {
    return failure(400, "INVALID_FILE_NAME", "File name is missing or too long.");
  }

  let storagePath: string;
  try {
    storagePath = storagePathFromReference(
      fileRef,
      uid,
      process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET
    );
  } catch (error) {
    return mapKnownFailure(error) ?? failure(400, "INVALID_STORAGE_PATH", "That file is not in your storage.");
  }

  try {
    assertRateLimit(
      `upload:${uid}`,
      RATE_LIMITS.upload.limit,
      RATE_LIMITS.upload.windowMs
    );
  } catch (error) {
    return mapKnownFailure(error) ?? failure(429, "RATE_LIMITED", "Too many requests. Please try again later.");
  }

  try {
    return await withCredits(uid, CREDIT_COSTS.upload, async () => {
      if (ragieFixturesEnabled()) {
        return {
          ok: true as const,
          data: {
            ...FIXTURE_UPLOAD,
            name: safeName,
            metadata: { ...FIXTURE_UPLOAD.metadata, title: safeName, userId: uid },
          },
        };
      }

      const apiKey = process.env.RAGIE_API_KEY;
      if (!apiKey) {
        throw new Error("RAGIE_API_KEY_MISSING");
      }

      const bucket = getAdminBucket();
      const object = bucket.file(storagePath);
      const [exists] = await object.exists();
      if (!exists) {
        throw new Error("FILE_NOT_FOUND");
      }

      const [metadata] = await object.getMetadata();
      assertUploadSize(Number(metadata.size ?? 0));
      const contentType = metadata.contentType || "application/octet-stream";
      if (!isAllowedDocumentType(contentType)) {
        throw new Error("UNSUPPORTED_MEDIA_TYPE");
      }

      const [buffer] = await object.download();
      assertUploadSize(buffer.byteLength);

      const fileBlob = new Blob([new Uint8Array(buffer)], { type: contentType });
      const formData = new FormData();
      formData.append("file", fileBlob, safeName);
      formData.append(
        "metadata",
        JSON.stringify({
          title: safeName,
          scope: "tutorial",
          userId: uid,
        })
      );

      const uploadController = new AbortController();
      const uploadTimeoutId = setTimeout(
        () => uploadController.abort(),
        FETCH_TIMEOUT * 2
      );

      const response = await fetch("https://api.ragie.ai/documents", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          accept: "application/json",
        },
        body: formData,
        signal: uploadController.signal,
      });
      clearTimeout(uploadTimeoutId);

      if (!response.ok) {
        const result = await ragieErrorResult({ response });
        throw Object.assign(new Error("RAGIE_REJECTED"), { result });
      }

      const data = await response.json();
      return { ok: true as const, data };
    });
  } catch (error) {
    if (error instanceof Error && "result" in error) {
      const result = (error as Error & { result?: RagieActionResult<never> }).result;
      if (result) return result;
    }
    if (error instanceof Error && error.message === "RAGIE_API_KEY_MISSING") {
      return failure(
        500,
        "RAGIE_API_KEY_MISSING",
        "Missing `RAGIE_API_KEY` server environment variable."
      );
    }
    if (error instanceof Error && error.message === "FILE_NOT_FOUND") {
      return failure(404, "FILE_NOT_FOUND", "The file is no longer in storage.");
    }
    if (error instanceof Error && error.message === "UNSUPPORTED_MEDIA_TYPE") {
      return failure(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "This file type cannot be uploaded to Ragie."
      );
    }
    if (error instanceof Error && error.name === "AbortError") {
      return failure(408, "REQUEST_TIMEOUT", "Request timed out. Please try again.");
    }

    return (
      mapKnownFailure(error) ??
      failure(500, "UPLOAD_TO_RAGIE_UNEXPECTED_ERROR", "Unexpected error during upload to Ragie.")
    );
  }
}
