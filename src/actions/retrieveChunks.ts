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
} from "@/lib/openai-search";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";

export type RetrievedChunk = {
  text: string;
  score: number;
  filename?: string;
};

export type RetrievalPayload = {
  scored_chunks: RetrievedChunk[];
};

export async function retrieveChunks(
  query: string,
  idToken: string
): Promise<ActionResult<RetrievalPayload>> {
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
      `retrieve:${uid}`,
      RATE_LIMITS.retrieve.limit,
      RATE_LIMITS.retrieve.windowMs
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
    return await withCredits(uid, CREDIT_COSTS.retrieve, async () => {
      const storeSnap = await getAdminDb().doc(`users/${uid}/search/store`).get();
      const vectorStoreId = storeSnap.get("vectorStoreId");
      if (typeof vectorStoreId !== "string" || !vectorStoreId.trim()) {
        return { ok: true as const, data: { scored_chunks: [] } };
      }

      const apiKey = readOpenAIApiKey();
      if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
      const chunks = await createOpenAISearchApi(apiKey).search(vectorStoreId, trimmedQuery);
      return {
        ok: true as const,
        data: {
          scored_chunks: chunks
            .filter((chunk) => chunk.text.trim())
            .map((chunk) => ({
              text: chunk.text,
              score: chunk.score,
              filename: chunk.filename,
            })),
        },
      };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OPENAI_API_KEY_MISSING") {
      return actionFailure(500, "OPENAI_API_KEY_MISSING", OPENAI_KEY_MISSING_MESSAGE);
    }
    const providerError = openAIFailure(error);
    if (providerError) {
      return actionFailure(providerError.status, providerError.code, providerError.message);
    }
    return (
      mapKnownActionError(error) ??
      actionFailure(500, "RETRIEVE_CHUNKS_FAILED", "Unexpected error while searching documents.")
    );
  }
}
