// app/actions/retrieveChunks.ts
"use server";

import { verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { assertQuery } from "@/lib/inputLimits";
import {
  FIXTURE_CHUNKS,
  ragieFixturesEnabled,
} from "@/lib/ragie-fixtures";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";

const FETCH_TIMEOUT = 30000; // 30 seconds

export async function retrieveChunks(query: string, idToken: string) {
  const uid = await verifyFirebaseIdToken(idToken);
  const trimmedQuery = assertQuery(query);
  assertRateLimit(
    `retrieve:${uid}`,
    RATE_LIMITS.retrieve.limit,
    RATE_LIMITS.retrieve.windowMs
  );

  return withCredits(uid, CREDIT_COSTS.retrieve, async () => {
    if (ragieFixturesEnabled()) {
      return {
        ...FIXTURE_CHUNKS,
        query: trimmedQuery,
        filter: { scope: "tutorial", userId: uid },
        fixture: true,
      };
    }

    const apiKey = process.env.RAGIE_API_KEY;
    if (!apiKey) {
      throw new Error("Ragie API key is not configured");
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const response = await fetch("https://api.ragie.ai/retrievals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query: trimmedQuery,
          filter: {
            scope: "tutorial",
            userId: uid,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "Access Forbidden: You do not have permission to access this resource."
          );
        } else if (response.status === 401) {
          throw new Error("Unauthorized: Invalid Ragie API key.");
        } else {
          throw new Error(
            `Failed to retrieve chunks from Ragie (HTTP ${response.status}).`
          );
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  });
}
