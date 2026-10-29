// app/actions/uploadToRagie.ts
"use server";

import { getAdminBucket, verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { INPUT_LIMITS } from "@/lib/inputLimits";
import {
  createRagieDocumentForm,
  failureForRagieCall,
  RAGIE_API_BASE,
  RAGIE_KEY_MISSING_MESSAGE,
  ragieFetch,
  ragieResultFromResponse,
  readRagieApiKey,
} from "@/lib/ragie-client";
import { type RagieActionResult } from "@/lib/ragie-errors";
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

  if (!ragieFixturesEnabled() && !readRagieApiKey()) {
    return failure(500, "RAGIE_API_KEY_MISSING", RAGIE_KEY_MISSING_MESSAGE);
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

      const apiKey = readRagieApiKey();
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

      const formData = createRagieDocumentForm({
        bytes: new Uint8Array(buffer),
        fileName: safeName,
        contentType,
        metadata: {
          title: safeName,
          scope: "tutorial",
          userId: uid,
        },
      });

      const response = await ragieFetch(
        `${RAGIE_API_BASE}/documents`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            accept: "application/json",
          },
          body: formData,
        },
        FETCH_TIMEOUT * 2
      );

      const rejected = await ragieResultFromResponse(response);
      if (rejected) {
        throw Object.assign(new Error("RAGIE_REJECTED"), { result: rejected });
      }

      const data = await response.json();
      return { ok: true as const, data };
    });
  } catch (error) {
    const ragieFailure = failureForRagieCall(error);
    if (ragieFailure) return ragieFailure;
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

    return (
      mapKnownFailure(error) ??
      failure(500, "UPLOAD_TO_RAGIE_UNEXPECTED_ERROR", "Unexpected error during upload to Ragie.")
    );
  }
}
