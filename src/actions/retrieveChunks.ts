// app/actions/retrieveChunks.ts
"use server";

import { verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";

const FETCH_TIMEOUT = 30000; // 30 seconds

export async function retrieveChunks(query: string, idToken: string) {
  // Validate inputs
  if (!query?.trim()) {
    throw new Error("Query cannot be empty");
  }

  const uid = await verifyFirebaseIdToken(idToken);

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
        query,
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

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
}
