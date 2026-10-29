"use server";

import { createStreamableValue, type StreamableValue } from "@ai-sdk/rsc";
import { ModelMessage, streamText } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";
import { verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { assertChunks, assertQuery } from "@/lib/inputLimits";
import { type RagieActionResult } from "@/lib/ragie-errors";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";

const fireworks = createOpenAI({
  apiKey: process.env.FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

function providerKey(modelName: string): string | null {
  switch (modelName) {
    case "gpt-4o":
      return process.env.OPENAI_API_KEY ?? "";
    case "gemini-1.5-pro":
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
    case "mistral-large":
      return process.env.MISTRAL_API_KEY ?? "";
    case "claude-3-5-sonnet":
      return process.env.ANTHROPIC_API_KEY ?? "";
    case "llama-v3p1-405b":
      return process.env.FIREWORKS_API_KEY ?? "";
    default:
      return null;
  }
}

function assertProviderConfigured(modelName: string) {
  const apiKey = providerKey(modelName);
  if (apiKey === null) {
    throw new Error(`Unsupported model name: ${modelName}`);
  }
  if (!apiKey.trim()) {
    throw new Error("The selected model is not configured");
  }
}

async function getModel(modelName: string) {
  assertProviderConfigured(modelName);
  switch (modelName) {
    case "gpt-4o":
      return openai("gpt-4o");
    case "gemini-1.5-pro":
      return google("models/gemini-1.5-pro-latest");
    case "mistral-large":
      return mistral("mistral-large-latest");
    case "claude-3-5-sonnet":
      return anthropic("claude-3-5-sonnet-20241022");
    case "llama-v3p1-405b":
      return fireworks("accounts/fireworks/models/llama-v3p1-405b-instruct");
    default:
      throw new Error(`Unsupported model name: ${modelName}`);
  }
}

const SYSTEM_PROMPT_TEMPLATE = `You are "Ragie AI", a professional but friendly AI chatbot working as an assistant to the user.
Your current task is to help the user based on all of the information available to you shown below.
Answer informally, directly, and concisely without a heading or greeting but include everything relevant.
Use richtext Markdown when appropriate including bold, italic, paragraphs, and lists when helpful.
If using LaTeX, use double $$ as delimiter instead of single $. Use $$...$$ instead of parentheses.
Organize information into multiple sections or points when appropriate.
Don't include raw item IDs or other raw fields from the source.
Don't use XML or other markup unless requested by the user.

Here is all of the information available to answer the user:
===
{chunks}
===

If the user asked for a search and there are no results, make sure to let the user know that you couldn't find anything,
and what they might be able to do to find the information they need.`;

async function generateResponse(
  systemPrompt: string,
  userPrompt: string,
  modelName: string
) {
  const model = await getModel(modelName);

  const messages: ModelMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const result = streamText({
    model,
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

function generateFailure(
  status: number,
  code: string,
  message: string
): RagieActionResult<never> {
  return { ok: false, error: { status, code, message } };
}

// Returns a result instead of throwing so a failed Ask does not surface as
// production React error #441 (a redacted Server Action exception).
export async function generateWithChunks(
  chunks: string[],
  query: string,
  modelName: string,
  idToken: string
): Promise<RagieActionResult<StreamableValue<string>>> {
  try {
    const uid = await verifyFirebaseIdToken(idToken);
    const trimmedQuery = assertQuery(query);
    const boundedChunks = assertChunks(chunks);
    assertProviderConfigured(modelName);
    assertRateLimit(
      `generate:${uid}`,
      RATE_LIMITS.generate.limit,
      RATE_LIMITS.generate.windowMs
    );

    const chunkText = boundedChunks.join("\n");
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{chunks}", chunkText);

    const data = await withCredits(uid, CREDIT_COSTS.generate, () =>
      generateResponse(systemPrompt, trimmedQuery, modelName)
    );
    return { ok: true, data };
  } catch (error) {
    if (!(error instanceof Error)) {
      return generateFailure(500, "GENERATE_FAILED", "Could not generate an answer.");
    }
    if (error.message === "User authentication required" || error.message === "Invalid Firebase authentication token") {
      return generateFailure(401, "UNAUTHORIZED", "User authentication required.");
    }
    if (error.message === "Firebase Admin Auth is not configured") {
      return generateFailure(500, "AUTH_NOT_CONFIGURED", "Sign-in verification is not configured.");
    }
    if (error.message === "Not enough credits") {
      return generateFailure(402, "INSUFFICIENT_CREDITS", "Not enough credits.");
    }
    if (error.message === "Too many requests. Please try again later.") {
      return generateFailure(429, "RATE_LIMITED", error.message);
    }
    if (error.message === "The selected model is not configured" || error.message.startsWith("Unsupported model name:")) {
      return generateFailure(500, "MODEL_NOT_CONFIGURED", error.message);
    }
    if (
      error.message === "Query cannot be empty" ||
      error.message === "Query is too long" ||
      error.message === "No context chunks provided" ||
      error.message === "Too many context chunks" ||
      error.message === "A context chunk is too long" ||
      error.message === "Invalid context chunk" ||
      error.message === "Context is too long"
    ) {
      return generateFailure(400, "INVALID_INPUT", error.message);
    }
    return generateFailure(500, "GENERATE_FAILED", "Could not generate an answer.");
  }
}
