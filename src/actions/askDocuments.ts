"use server";

import { getAdminDb, verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { actionFailure, mapKnownActionError, type ActionResult } from "@/lib/actionResult";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { assertQuery } from "@/lib/inputLimits";
import {
  createOpenAISearchApi,
  OPENAI_KEY_MISSING_MESSAGE,
  openAIFailure,
  readOpenAIApiKey,
  type SearchSource,
} from "@/lib/openai-search";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";
import { vectorStoreDocPath } from "@/lib/searchPaths";

export type AskPayload = {
  answer: string;
  sources: SearchSource[];
};

export async function askDocuments(
  query: string,
  idToken: string
): Promise<ActionResult<AskPayload>> {
  let uid: string;
  try {
    uid = await verifyFirebaseIdToken(idToken);
  } catch {
    return actionFailure(401, "UNAUTHORIZED", "User authentication required.");
  }

  let trimmedQuery: string;
  try {
    trimmedQuery = assertQuery(query);
    assertRateLimit(
      `generate:${uid}`,
      RATE_LIMITS.generate.limit,
      RATE_LIMITS.generate.windowMs
    );
  } catch (error) {
    return (
      mapKnownActionError(error) ??
      actionFailure(400, "INVALID_QUERY", error instanceof Error ? error.message : "Query is invalid.")
    );
  }

  if (!readOpenAIApiKey()) {
    return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
  }

  try {
    return await withCredits(uid, CREDIT_COSTS.generate, async () => {
      const storeSnap = await getAdminDb().doc(vectorStoreDocPath(uid)).get();
      const vectorStoreId = storeSnap.get("vectorStoreId");
      if (typeof vectorStoreId !== "string" || !vectorStoreId.trim()) {
        throw new Error("NO_INDEXED_DOCUMENTS");
      }

      const apiKey = readOpenAIApiKey();
      if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
      const result = await createOpenAISearchApi(apiKey).ask(vectorStoreId, trimmedQuery);
      if (!result.answer && result.sources.length === 0) {
        throw new Error("NO_RELEVANT_CONTENT");
      }
      return { ok: true as const, data: result };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OPENAI_API_KEY_MISSING") {
      return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
    }
    if (error instanceof Error && error.message === "NO_INDEXED_DOCUMENTS") {
      return actionFailure(
        404,
        "NO_INDEXED_DOCUMENTS",
        "Index a document before asking a question."
      );
    }
    if (error instanceof Error && error.message === "NO_RELEVANT_CONTENT") {
      return actionFailure(
        404,
        "NO_RELEVANT_CONTENT",
        "No relevant content found. Please index a document first."
      );
    }
    const providerError = openAIFailure(error);
    if (providerError) {
      return actionFailure(providerError.status, providerError.code, providerError.message);
    }
    return (
      mapKnownActionError(error) ??
      actionFailure(500, "ASK_DOCUMENTS_FAILED", "Unexpected error while answering the question.")
    );
  }
}
