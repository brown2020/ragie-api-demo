"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { CoreMessage, streamText } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";

const fireworks = createOpenAI({
  apiKey: process.env.FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

async function getModel(modelName: string) {
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

async function generateResponse(
  systemPrompt: string,
  userPrompt: string,
  modelName: string
) {
  const model = await getModel(modelName);

  const messages: CoreMessage[] = [
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

export async function generateSummary(
  document: string,
  language: string,
  modelName: string,
  numWords: number
) {
  const systemPrompt = `You are a helpful summarization and translation assistant. Your job is to generate a summary of the provided document in the provided language. The summary should be concise, informative, and ${numWords} words or less. Present the summary without introduction and without saying that it is a summary.`;
  const userPrompt = `Provided document:\n${document}\n\nProvided language:\n${language}`;
  return generateResponse(systemPrompt, userPrompt, modelName);
}

export async function generateAnswer(
  document: string,
  question: string,
  modelName: string
) {
  const systemPrompt =
    "You are a helpful question and answer assistant. Your job is to generate an answer to the provided question based on the provided document. Without any introduction, provide an answer that is concise, informative, and 100 words or less.";
  const userPrompt = `Provided document:\n${document}\n\nProvided question:\n${question}`;
  return generateResponse(systemPrompt, userPrompt, modelName);
}

// Updated function to handle retrieval from Ragie and generation using AI models
export async function generateFromRagie(
  query: string,
  modelName: string
): Promise<ReturnType<typeof generateResponse>> {
  // Import auth here to avoid top-level await
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();

  // Step 1: Retrieve chunks from Ragie
  const ragieApiKey = process.env.RAGIE_API_KEY ?? "";
  const response = await fetch("https://api.ragie.ai/retrievals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ragieApiKey}`,
    },
    body: JSON.stringify({
      query,
      filter: {
        scope: "tutorial",
        userId: userId || "anonymous", // Filter by user ID
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to retrieve data from Ragie API: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const chunkText = data.scored_chunks
    .map((chunk: { text: string }) => chunk.text)
    .join("\n");

  // Step 2: Create the system prompt with retrieved chunks
  const systemPrompt = `You are "Ragie AI", a professional but friendly AI chatbot working as an assistant to the user.
Your current task is to help the user based on all of the information available to you shown below.
Answer informally, directly, and concisely without a heading or greeting but include everything relevant.
Use richtext Markdown when appropriate including bold, italic, paragraphs, and lists when helpful.
If using LaTeX, use double $$ as delimiter instead of single $. Use $$...$$ instead of parentheses.
Organize information into multiple sections or points when appropriate.
Don't include raw item IDs or other raw fields from the source.
Don't use XML or other markup unless requested by the user.

Here is all of the information available to answer the user:
===
${chunkText}
===

If the user asked for a search and there are no results, make sure to let the user know that you couldn't find anything,
and what they might be able to do to find the information they need.`;

  // Step 3: Use the retrieved chunks to generate an answer
  return generateResponse(systemPrompt, query, modelName);
}

// New function to handle generation using previously retrieved chunks
export async function generateWithChunks(
  chunks: string[],
  query: string,
  modelName: string
): Promise<ReturnType<typeof generateResponse>> {
  // Combine the retrieved chunks into a single text block
  const chunkText = chunks.join("\n");

  // Create the system prompt with the retrieved chunks
  const systemPrompt = `You are "Ragie AI", a professional but friendly AI chatbot working as an assistant to the user.
Your current task is to help the user based on all of the information available to you shown below.
Answer informally, directly, and concisely without a heading or greeting but include everything relevant.
Use richtext Markdown when appropriate including bold, italic, paragraphs, and lists when helpful.
If using LaTeX, use double $$ as delimiter instead of single $. Use $$...$$ instead of parentheses.
Organize information into multiple sections or points when appropriate.
Don't include raw item IDs or other raw fields from the source.
Don't use XML or other markup unless requested by the user.

Here is all of the information available to answer the user:
===
${chunkText}
===

If the user asked for a search and there are no results, make sure to let the user know that you couldn't find anything,
and what they might be able to do to find the information they need.`;

  // Generate an answer based on the system prompt and user query
  return generateResponse(systemPrompt, query, modelName);
}
