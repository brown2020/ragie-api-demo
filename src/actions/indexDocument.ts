"use server";

import { getAdminBucket, getAdminDb, verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { actionFailure, mapKnownActionError, type ActionResult } from "@/lib/actionResult";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { INPUT_LIMITS } from "@/lib/inputLimits";
import {
  createOpenAISearchApi,
  ensureVectorStore,
  indexUploadedFile,
  OPENAI_KEY_MISSING_MESSAGE,
  openAIFailure,
  readOpenAIApiKey,
} from "@/lib/openai-search";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";
import {
  assertUploadSize,
  isAllowedDocumentType,
  sanitizeFileName,
  storagePathFromReference,
} from "@/lib/storageAccess";

function assertDocumentId(documentId: string): string {
  const id = documentId?.trim() ?? "";
  if (!id || id.length > 200 || id.includes("/") || id.includes("\\") || id.includes("..")) {
    throw new Error("Invalid document id");
  }
  return id;
}

async function savedVectorStoreId(uid: string): Promise<string | null> {
  const snap = await getAdminDb().doc(`users/${uid}/search/store`).get();
  const id = snap.get("vectorStoreId");
  return typeof id === "string" && id.trim() ? id : null;
}

async function saveVectorStoreId(uid: string, vectorStoreId: string): Promise<void> {
  await getAdminDb().doc(`users/${uid}/search/store`).set({ vectorStoreId }, { merge: true });
}

export async function indexDocument(
  fileRef: string,
  fileName: string,
  documentId: string,
  idToken: string
): Promise<ActionResult<{ fileId: string }>> {
  let uid: string;
  try {
    uid = await verifyFirebaseIdToken(idToken);
  } catch {
    return actionFailure(401, "UNAUTHORIZED", "User authentication required.");
  }

  const safeName = sanitizeFileName(fileName ?? "");
  if (!fileName?.trim() || fileName.length > INPUT_LIMITS.maxFileNameChars) {
    return actionFailure(400, "INVALID_FILE_NAME", "File name is missing or too long.");
  }

  let docId: string;
  try {
    docId = assertDocumentId(documentId);
  } catch {
    return actionFailure(400, "INVALID_DOCUMENT", "That document could not be found.");
  }

  let storagePath: string;
  try {
    storagePath = storagePathFromReference(
      fileRef,
      uid,
      process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET
    );
  } catch (error) {
    return mapKnownActionError(error) ?? actionFailure(400, "INVALID_STORAGE_PATH", "That file is not in your storage.");
  }

  try {
    assertRateLimit(`upload:${uid}`, RATE_LIMITS.upload.limit, RATE_LIMITS.upload.windowMs);
  } catch (error) {
    return mapKnownActionError(error) ?? actionFailure(429, "RATE_LIMITED", "Too many requests. Please try again later.");
  }

  if (!readOpenAIApiKey()) {
    return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
  }

  try {
    return await withCredits(uid, CREDIT_COSTS.upload, async () => {
      const db = getAdminDb();
      const docSnap = await db.doc(`users/${uid}/documents/${docId}`).get();
      if (!docSnap.exists) {
        throw new Error("FILE_NOT_FOUND");
      }
      if (docSnap.get("storagePath") !== storagePath) {
        throw new Error("Invalid storage path");
      }

      const apiKey = readOpenAIApiKey();
      if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
      const api = createOpenAISearchApi(apiKey);

      const bucket = getAdminBucket();
      const object = bucket.file(storagePath);
      const [exists] = await object.exists();
      if (!exists) throw new Error("FILE_NOT_FOUND");

      const [metadata] = await object.getMetadata();
      assertUploadSize(Number(metadata.size ?? 0));
      const contentType = metadata.contentType || "application/octet-stream";
      if (!isAllowedDocumentType(contentType)) {
        throw new Error("UNSUPPORTED_MEDIA_TYPE");
      }

      const [buffer] = await object.download();
      assertUploadSize(buffer.byteLength);

      const vectorStoreId = await ensureVectorStore(api, await savedVectorStoreId(uid), uid);
      await saveVectorStoreId(uid, vectorStoreId);

      const indexed = await indexUploadedFile(api, {
        vectorStoreId,
        bytes: new Uint8Array(buffer),
        fileName: safeName,
        contentType,
      });

      await db.doc(`users/${uid}/search/files/${docId}`).set({
        openaiFileId: indexed.fileId,
        vectorStoreId,
        name: safeName,
      });

      return { ok: true as const, data: { fileId: indexed.fileId } };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OPENAI_API_KEY_MISSING") {
      return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
    }
    if (error instanceof Error && error.message === "FILE_NOT_FOUND") {
      return actionFailure(404, "FILE_NOT_FOUND", "The file is no longer in storage.");
    }
    if (error instanceof Error && error.message === "UNSUPPORTED_MEDIA_TYPE") {
      return actionFailure(415, "UNSUPPORTED_MEDIA_TYPE", "This file type cannot be indexed.");
    }
    const providerError = openAIFailure(error);
    if (providerError) {
      return actionFailure(providerError.status, providerError.code, providerError.message);
    }
    return (
      mapKnownActionError(error) ??
      actionFailure(500, "INDEX_DOCUMENT_FAILED", "Unexpected error while indexing the document.")
    );
  }
}
