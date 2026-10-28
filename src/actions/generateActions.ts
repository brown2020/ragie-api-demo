"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { ModelMessage, streamText } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";
import { verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { CREDIT_COSTS } from "@/lib/billing";
import { withCredits } from "@/lib/credits";
import { assertChunks, assertQuery } from "@/lib/inputLimits";
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

// Function to handle generation using previously retrieved chunks
export async function generateWithChunks(
  chunks: string[],
  query: string,
  modelName: string,
  idToken: string
): Promise<ReturnType<typeof generateResponse>> {
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

  return withCredits(uid, CREDIT_COSTS.generate, () =>
    generateResponse(systemPrompt, trimmedQuery, modelName)
  );
}
