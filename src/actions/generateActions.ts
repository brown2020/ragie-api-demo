"use server";

import { createStreamableValue, type StreamableValue } from "@ai-sdk/rsc";
import { streamText, wrapLanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { verifyFirebaseIdToken } from "@/firebase/firebaseAdmin";
import { CREDIT_COSTS } from "@/lib/billing";
import { callParamsMiddleware, getChatModel, type ChatModelId } from "@/lib/chatModels";
import { withCredits } from "@/lib/credits";
import { assertChunks, assertQuery } from "@/lib/inputLimits";
import { actionFailure, mapKnownActionError, type ActionResult } from "@/lib/actionResult";
import { chunkAnswerPrompt, forwardGenerationStream } from "@/lib/generationStream";
import { RATE_LIMITS, assertRateLimit } from "@/lib/rateLimit";

function assertProviderConfigured(modelName: string): ChatModelId {
  const model = getChatModel(modelName);
  if (!process.env[model.apiKeyEnv]?.trim()) {
    throw new Error("The selected model is not configured");
  }
  return model.id;
}

function providerModel(modelId: ChatModelId) {
  switch (modelId) {
    case "gpt-6.1-sol":
      // Tool calling on GPT-6.1 Sol requires the Responses API.
      return openai.responses("gpt-6.1-sol");
    case "claude-opus-5-5":
      return anthropic("claude-opus-5-5");
    case "gemini-4-argon":
      return google("gemini-4-argon");
  }
}

async function getModel(modelName: string) {
  const modelId = assertProviderConfigured(modelName);
  return wrapLanguageModel({
    model: providerModel(modelId),
    middleware: callParamsMiddleware(modelId),
  });
}

const SYSTEM_PROMPT_TEMPLATE = `You are a professional but friendly AI chatbot working as an assistant to the user.
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
  const stream = createStreamableValue<string>();
  const result = streamText({
    model,
    ...chunkAnswerPrompt(systemPrompt, userPrompt),
  });

  // textStream drops error parts. Read the full stream so a failure reaches
  // the caller through the streamable value instead of ending as empty text.
  void forwardGenerationStream(result.fullStream, stream);

  return stream.value;
}

function generateFailure(
  status: number,
  code: string,
  message: string
): ActionResult<never> {
  return actionFailure(status, code, message);
}

// Returns a result instead of throwing so a failed Ask does not surface as
// production React error #441 (a redacted Server Action exception).
export async function generateWithChunks(
  chunks: string[],
  query: string,
  modelName: string,
  idToken: string
): Promise<ActionResult<StreamableValue<string>>> {
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
    const known = mapKnownActionError(error);
    if (known) return known;
    if (!(error instanceof Error)) {
      return generateFailure(500, "GENERATE_FAILED", "Could not generate an answer.");
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
