"use server";

import { getAdminBucket, getAdminDb, verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { actionFailure, mapKnownActionError, type ActionResult } from "@/lib/actionResult";
import {
  createOpenAISearchApi,
  OPENAI_KEY_MISSING_MESSAGE,
  openAIFailure,
  readOpenAIApiKey,
} from "@/lib/openai-search";

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
      return actionFailure(404, "FILE_NOT_FOUND", "That document is no longer listed.");
    }

    const fileSnap = await db.doc(`users/${uid}/search/files/${docId}`).get();
    const openaiFileId = fileSnap.get("openaiFileId");
    const vectorStoreId = fileSnap.get("vectorStoreId");
    if (typeof openaiFileId === "string" && openaiFileId.trim()) {
      const apiKey = readOpenAIApiKey();
      if (!apiKey) {
        return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
      }
      const api = createOpenAISearchApi(apiKey);
      if (typeof vectorStoreId === "string" && vectorStoreId.trim()) {
        try {
          await api.detachFile(vectorStoreId, openaiFileId);
        } catch (error) {
          const providerError = openAIFailure(error);
          if (providerError) {
            return actionFailure(providerError.status, providerError.code, providerError.message);
          }
        }
      }
      try {
        await api.deleteFile(openaiFileId);
      } catch (error) {
        const providerError = openAIFailure(error);
        if (providerError) {
          return actionFailure(providerError.status, providerError.code, providerError.message);
        }
      }
      await fileSnap.ref.delete().catch(() => undefined);
    }

    const storagePath = docSnap.get("storagePath");
    if (typeof storagePath === "string" && storagePath.startsWith(`users/${uid}/documents/`)) {
      try {
        await getAdminBucket().file(storagePath).delete({ ignoreNotFound: true });
      } catch (error) {
        return (
          mapKnownActionError(error) ??
          actionFailure(500, "DELETE_FAILED", "The file could not be removed from storage.")
        );
      }
    }

    await docRef.delete();
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
