"use server";

import { getAdminBucket, getAdminDb, verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { actionFailure, mapKnownActionError, type ActionResult } from "@/lib/actionResult";
import {
  OPENAI_KEY_MISSING_MESSAGE,
  openAIFailure,
  readOpenAIApiKey,
  savedOpenAIFileId,
} from "@/lib/openai-search";
import { indexedFileDocPath, vectorStoreDocPath } from "@/lib/searchPaths";
import { removeDocumentFromSearch } from "@/lib/searchMaintenance";

function isMissingStorageObject(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = (error as { code?: unknown }).code;
  return code === 404 || code === "404";
}

function assertDocumentId(documentId: string): string {
  const id = documentId?.trim() ?? "";
  if (!id || id.length > 200 || id.includes("/") || id.includes("\\") || id.includes("..")) {
    throw new Error("Invalid document id");
  }
  return id;
}

export async function deleteDocument(
  documentId: string,
  idToken: string
): Promise<ActionResult<{ deleted: true }>> {
  let uid: string;
  try {
    uid = await verifyFirebaseIdToken(idToken);
  } catch {
    return actionFailure(401, "UNAUTHORIZED", "User authentication required.");
  }

  let docId: string;
  try {
    docId = assertDocumentId(documentId);
  } catch {
    return actionFailure(400, "INVALID_DOCUMENT", "That document could not be found.");
  }

  try {
    const db = getAdminDb();
    const docRef = db.doc(`users/${uid}/documents/${docId}`);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { ok: true, data: { deleted: true } };
    }

    const fileRef = db.doc(indexedFileDocPath(uid, docId));
    const fileSnap = await fileRef.get();
    const openaiFileId = savedOpenAIFileId(fileSnap.data());
    const storeId = (await db.doc(vectorStoreDocPath(uid)).get()).get("vectorStoreId");
    const hasSearchData = Boolean(openaiFileId) || (typeof storeId === "string" && storeId.trim());
    if (hasSearchData && !readOpenAIApiKey()) {
      return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
    }

    const name = typeof docSnap.get("name") === "string" ? docSnap.get("name") : "";
    const storagePath = docSnap.get("storagePath");
    // Remove the list row before the slower storage and vector-store work.
    // A reload during that work must not show the document again, and a status
    // poll must observe that it is gone before it writes anything back.
    await docRef.delete();

    if (hasSearchData) {
      await removeDocumentFromSearch(uid, { id: docId, name });
    } else {
      await fileRef.delete().catch(() => undefined);
    }

    if (typeof storagePath === "string" && storagePath.startsWith(`users/${uid}/documents/`)) {
      try {
        await getAdminBucket().file(storagePath).delete({ ignoreNotFound: true });
      } catch (error) {
        if (!isMissingStorageObject(error)) {
          return (
            mapKnownActionError(error) ??
            actionFailure(500, "DELETE_FAILED", "The file could not be removed from storage.")
          );
        }
      }
    }

    return { ok: true, data: { deleted: true } };
  } catch (error) {
    const providerError = openAIFailure(error);
    if (providerError) {
      return actionFailure(providerError.status, providerError.code, providerError.message);
    }
    return (
      mapKnownActionError(error) ??
      actionFailure(500, "DELETE_FAILED", "The document could not be deleted.")
    );
  }
}
