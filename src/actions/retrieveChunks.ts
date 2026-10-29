// app/actions/retrieveChunks.ts
"use server";

import { verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { assertQuery } from "@/lib/inputLimits";
import {
  failureForRagieCall,
  RAGIE_API_BASE,
  RAGIE_KEY_MISSING_MESSAGE,
  ragieFetch,
  ragieResultFromResponse,
  readRagieApiKey,
} from "@/lib/ragie-client";
import { type RagieActionResult } from "@/lib/ragie-errors";
import {
  FIXTURE_CHUNKS,
  ragieFixturesEnabled,
} from "@/lib/ragie-fixtures";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";

const FETCH_TIMEOUT = 30000;

export type RetrievedChunk = {
  text: string;
  score: number;
};

export type RetrievalPayload = {
  scored_chunks: RetrievedChunk[];
};

function failure(
  status: number,
  code: string,
  message: string
): RagieActionResult<never> {
  return { ok: false, error: { status, code, message } };
}

function asRetrievalPayload(data: unknown): RetrievalPayload {
  if (!data || typeof data !== "object") {
    throw new Error("RAGIE_BAD_RESPONSE");
  }
  const chunks = (data as { scored_chunks?: unknown }).scored_chunks;
  if (!Array.isArray(chunks)) {
    return { scored_chunks: [] };
  }
  return {
    scored_chunks: chunks.flatMap((chunk) => {
      if (!chunk || typeof chunk !== "object") return [];
      const text = (chunk as { text?: unknown }).text;
      const score = (chunk as { score?: unknown }).score;
      if (typeof text !== "string") return [];
      return [{ text, score: typeof score === "number" ? score : 0 }];
    }),
  };
}

export async function retrieveChunks(
  query: string,
  idToken: string
): Promise<RagieActionResult<RetrievalPayload>> {
  let uid: string;
  try {
    uid = await verifyFirebaseIdToken(idToken);
  } catch {
    return failure(401, "UNAUTHORIZED", "User authentication required.");
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
    if (error instanceof Error && error.message === "Too many requests. Please try again later.") {
      return failure(429, "RATE_LIMITED", error.message);
    }
    return failure(400, "INVALID_QUERY", error instanceof Error ? error.message : "Query is invalid.");
  }

  if (!ragieFixturesEnabled() && !readRagieApiKey()) {
    return failure(500, "RAGIE_API_KEY_MISSING", RAGIE_KEY_MISSING_MESSAGE);
  }

  try {
    return await withCredits(uid, CREDIT_COSTS.retrieve, async () => {
      if (ragieFixturesEnabled()) {
        return {
          ok: true as const,
          data: {
            scored_chunks: FIXTURE_CHUNKS.scored_chunks,
          },
        };
      }

      const apiKey = readRagieApiKey();
      if (!apiKey) {
        throw new Error("RAGIE_API_KEY_MISSING");
      }

      const response = await ragieFetch(
        `${RAGIE_API_BASE}/retrievals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: trimmedQuery,
            filter: {
              scope: "tutorial",
              userId: uid,
            },
          }),
        },
        FETCH_TIMEOUT
      );

      const rejected = await ragieResultFromResponse(response);
      if (rejected) {
        throw Object.assign(new Error("RAGIE_REJECTED"), { result: rejected });
      }

      return { ok: true as const, data: asRetrievalPayload(await response.json()) };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not enough credits") {
      return failure(402, "INSUFFICIENT_CREDITS", "Not enough credits.");
    }
    if (error instanceof Error && error.message === "RAGIE_BAD_RESPONSE") {
      return failure(502, "RAGIE_BAD_RESPONSE", "Ragie returned a response this app could not read.");
    }
    return (
      failureForRagieCall(error) ??
      failure(500, "RETRIEVE_CHUNKS_UNEXPECTED_ERROR", "Unexpected error while retrieving from Ragie.")
    );
  }
}
