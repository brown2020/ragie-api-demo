"use server";

import { getAdminDb, verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { actionFailure, mapKnownActionError, type ActionResult } from "@/lib/actionResult";
import { CREDIT_COSTS } from "@/lib/billing";
import { refundCredits } from "@/lib/credits";
import {
  createOpenAISearchApi,
  IndexProcessingError,
  OPENAI_KEY_MISSING_MESSAGE,
  openAIFailure,
  readOpenAIApiKey,
  removeIndexedFile,
  savedOpenAIFileId,
  type IndexState,
} from "@/lib/openai-search";
import { indexedFileDocPath } from "@/lib/searchPaths";
import type { DocumentReference } from "firebase-admin/firestore";

function assertDocumentId(documentId: string): string {
  const id = documentId?.trim() ?? "";
  if (!id || id.length > 200 || id.includes("/") || id.includes("\\") || id.includes("..")) {
    throw new Error("Invalid document id");
  }
  return id;
}

async function claimIndexRefund(fileRef: DocumentReference): Promise<boolean> {
  const db = getAdminDb();
  return db.runTransaction(async (transaction) => {
    const fresh = await transaction.get(fileRef);
    if (fresh.get("billed") !== true) return false;
    transaction.set(fileRef, { billed: false }, { merge: true });
    return true;
  });
}

export async function indexStatus(
  documentId: string,
  idToken: string
): Promise<ActionResult<{ fileId: string; status: IndexState }>> {
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

  if (!readOpenAIApiKey()) {
    return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
  }

  try {
    const db = getAdminDb();
    const fileRef = db.doc(indexedFileDocPath(uid, docId));
    const fileSnap = await fileRef.get();
    const fileId = savedOpenAIFileId(fileSnap.data());
    const vectorStoreId = fileSnap.get("vectorStoreId");
    if (!fileId || typeof vectorStoreId !== "string" || !vectorStoreId.trim()) {
      return actionFailure(404, "NOT_INDEXED", "Index the document before checking its status.");
    }

    const apiKey = readOpenAIApiKey();
    if (!apiKey) {
      return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
    }
    const api = createOpenAISearchApi(apiKey);
    const remote = await api.fileStatus(vectorStoreId, fileId);
    if (!remote) {
      if (await claimIndexRefund(fileRef)) {
        await refundCredits(uid, CREDIT_COSTS.upload).catch(() => undefined);
      }
      await fileRef.delete().catch(() => undefined);
      return actionFailure(404, "OPENAI_NOT_FOUND", "That indexed file is no longer in OpenAI.");
    }

    if (remote.status === "failed" || remote.status === "cancelled") {
      const failure = new IndexProcessingError(remote.errorMessage);
      await removeIndexedFile(api, vectorStoreId, fileId).catch(() => undefined);
      if (await claimIndexRefund(fileRef)) {
        await refundCredits(uid, CREDIT_COSTS.upload).catch(() => undefined);
      }
      await fileRef.delete().catch(() => undefined);
      return actionFailure(422, failure.code, failure.message);
    }

    if (remote.status === "completed") {
      await fileRef.set({ status: "completed" }, { merge: true });
      return { ok: true, data: { fileId, status: "completed" } };
    }

    return { ok: true, data: { fileId, status: "in_progress" } };
  } catch (error) {
    const providerError = openAIFailure(error);
    if (providerError) {
      return actionFailure(providerError.status, providerError.code, providerError.message);
    }
    return (
      mapKnownActionError(error) ??
      actionFailure(500, "INDEX_STATUS_FAILED", "The index status could not be checked.")
    );
  }
}
