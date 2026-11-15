import type { LanguageModelMiddleware } from "ai";

export type ChatProvider = "openai" | "anthropic" | "google" | "xai";

export type ChatModel = {
  id: string;
  label: string;
  provider: ChatProvider;
  /** Server environment variable that holds the provider key. */
  apiKeyEnv:
    | "OPENAI_API_KEY"
    | "ANTHROPIC_API_KEY"
    | "GOOGLE_GENERATIVE_AI_API_KEY"
    | "XAI_API_KEY";
};

export const CHAT_MODELS = [
  {
    id: "gpt-6.1-sol",
    label: "OpenAI GPT-6.1 Sol",
    provider: "openai",
    apiKeyEnv: "OPENAI_API_KEY",
  },
  {
    id: "claude-opus-5-5",
    label: "Anthropic Claude Opus 5.5",
    provider: "anthropic",
    apiKeyEnv: "ANTHROPIC_API_KEY",
  },
  {
    id: "gemini-4-argon",
    label: "Google Gemini 4 Argon",
    provider: "google",
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  {
    id: "grok-4.7",
    label: "xAI Grok 4.7",
    provider: "xai",
    apiKeyEnv: "XAI_API_KEY",
  },
] as const satisfies readonly ChatModel[];

export type ChatModelId = (typeof CHAT_MODELS)[number]["id"];

export const DEFAULT_CHAT_MODEL: ChatModelId = "gpt-6.1-sol";

export function isChatModelId(value: unknown): value is ChatModelId {
  return CHAT_MODELS.some((model) => model.id === value);
}

/** Throws the "Unsupported model name" error for anything outside `CHAT_MODELS`. */
export function getChatModel(modelName: string): (typeof CHAT_MODELS)[number] {
  const model = CHAT_MODELS.find((entry) => entry.id === modelName);
  if (!model) {
    throw new Error(`Unsupported model name: ${modelName}`);
  }
  return model;
}

type CallParams = Parameters<
  NonNullable<LanguageModelMiddleware["transformParams"]>
>[0]["params"];

/**
 * Claude Opus 5.5 always runs adaptive thinking and rejects temperature,
 * top_p, top_k, and a forced tool_choice ("required" or a named tool).
 * Grok 4.7 always reasons and rejects presence_penalty, frequency_penalty,
 * and stop.
 */
export function stripUnsupportedCallParams(
  modelId: ChatModelId,
  params: CallParams
): CallParams {
  if (modelId === "claude-opus-5-5") {
    const next = { ...params };
    delete next.temperature;
    delete next.topP;
    delete next.topK;
    if (next.toolChoice?.type === "required" || next.toolChoice?.type === "tool") {
      delete next.toolChoice;
    }
    return next;
  }
  if (modelId === "grok-4.7") {
    const next = { ...params };
    delete next.presencePenalty;
    delete next.frequencyPenalty;
    delete next.stopSequences;
    return next;
  }
  return params;
}

export function callParamsMiddleware(modelId: ChatModelId): LanguageModelMiddleware {
  return {
    specificationVersion: "v4",
    transformParams: async ({ params }) => stripUnsupportedCallParams(modelId, params),
  };
}
