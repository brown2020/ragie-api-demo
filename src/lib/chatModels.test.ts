import { describe, expect, it } from "vitest";
import { MockLanguageModelV4 } from "ai/test";
import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
  callParamsMiddleware,
  getChatModel,
  isChatModelId,
  type ChatModelId,
} from "./chatModels";

const prompt = [{ role: "user" as const, content: [{ type: "text" as const, text: "hi" }] }];

async function transform(
  modelId: ChatModelId,
  params: Record<string, unknown>
) {
  const middleware = callParamsMiddleware(modelId);
  return middleware.transformParams!({
    type: "stream",
    params: { prompt, ...params },
    model: new MockLanguageModelV4(),
  });
}

describe("chat models", () => {
  it("offers exactly the four current flagships", () => {
    expect(CHAT_MODELS.map((model) => model.id)).toEqual([
      "gpt-6.1-sol",
      "claude-opus-5-5",
      "gemini-4-argon",
      "grok-4.7",
    ]);
    expect(CHAT_MODELS.map((model) => model.label)).toEqual([
      "OpenAI GPT-6.1 Sol",
      "Anthropic Claude Opus 5.5",
      "Google Gemini 4 Argon",
      "xAI Grok 4.7",
    ]);
  });

  it("defaults to GPT-6.1 Sol", () => {
    expect(DEFAULT_CHAT_MODEL).toBe("gpt-6.1-sol");
    expect(isChatModelId(DEFAULT_CHAT_MODEL)).toBe(true);
  });

  it("maps each model to its provider key", () => {
    expect(getChatModel("gpt-6.1-sol").apiKeyEnv).toBe("OPENAI_API_KEY");
    expect(getChatModel("claude-opus-5-5").apiKeyEnv).toBe("ANTHROPIC_API_KEY");
    expect(getChatModel("gemini-4-argon").apiKeyEnv).toBe("GOOGLE_GENERATIVE_AI_API_KEY");
    expect(getChatModel("grok-4.7").apiKeyEnv).toBe("XAI_API_KEY");
  });

  it.each([
    "gpt-4o",
    "gemini-1.5-pro",
    "models/gemini-1.5-pro-latest",
    "mistral-large",
    "claude-3-5-sonnet",
    "claude-3-5-sonnet-20241022",
    "llama-v3p1-405b",
    "anthropic/claude-opus-5.5",
    "spacexai/grok-4.7",
    "xai/grok-4.7",
    "grok-4-7",
    "",
  ])("rejects retired or unknown id %j", (id) => {
    expect(isChatModelId(id)).toBe(false);
    expect(() => getChatModel(id)).toThrow(`Unsupported model name: ${id}`);
  });

  it("strips sampling params and forced tool choice for Claude Opus 5.5", async () => {
    const required = await transform("claude-opus-5-5", {
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1000,
      toolChoice: { type: "required" },
    });
    expect(required).toEqual({ prompt, maxOutputTokens: 1000 });

    const named = await transform("claude-opus-5-5", {
      toolChoice: { type: "tool", toolName: "search" },
    });
    expect(named).toEqual({ prompt });
  });

  it("keeps non-forced tool choice for Claude Opus 5.5", async () => {
    const auto = await transform("claude-opus-5-5", { toolChoice: { type: "auto" } });
    expect(auto).toEqual({ prompt, toolChoice: { type: "auto" } });
    const none = await transform("claude-opus-5-5", { toolChoice: { type: "none" } });
    expect(none).toEqual({ prompt, toolChoice: { type: "none" } });
  });

  it("strips penalties and stop sequences for Grok 4.7", async () => {
    const result = await transform("grok-4.7", {
      presencePenalty: 0.5,
      frequencyPenalty: 0.5,
      stopSequences: ["END"],
      temperature: 0.2,
      maxOutputTokens: 1000,
      toolChoice: { type: "required" },
    });
    expect(result).toEqual({
      prompt,
      temperature: 0.2,
      maxOutputTokens: 1000,
      toolChoice: { type: "required" },
    });
  });

  it.each(["gpt-6.1-sol", "gemini-4-argon"] as const)(
    "passes call params through unchanged for %s",
    async (modelId) => {
      const params = {
        temperature: 0.2,
        topP: 0.9,
        presencePenalty: 0.5,
        frequencyPenalty: 0.5,
        stopSequences: ["END"],
        toolChoice: { type: "required" },
      };
      expect(await transform(modelId, params)).toEqual({ prompt, ...params });
    }
  );
});
