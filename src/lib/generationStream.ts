export type GenerationStreamSink = {
  append(text: string): void;
  error(error: unknown): void;
  done(): void;
};

export type GenerationStreamPart = {
  type: string;
  text?: string;
  error?: unknown;
};

/** Prompt fields for `streamText`. System text stays in `instructions` so AI SDK 7 accepts it. */
export function chunkAnswerPrompt(systemPrompt: string, userPrompt: string) {
  return {
    instructions: systemPrompt,
    prompt: userPrompt,
  };
}

function asStreamError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string" && error.trim()) return new Error(error);
  return new Error("Could not generate an answer.");
}

/**
 * Copy text deltas onto the caller's stream.
 * AI SDK 7 puts prompt and provider failures on the full stream as `error`
 * parts and does not reject `textStream`, so those parts have to be forwarded.
 */
export async function forwardGenerationStream(
  parts: AsyncIterable<GenerationStreamPart>,
  sink: GenerationStreamSink
): Promise<void> {
  let settled = false;
  const fail = (error: unknown) => {
    if (settled) return;
    settled = true;
    sink.error(asStreamError(error));
  };
  const finish = () => {
    if (settled) return;
    settled = true;
    sink.done();
  };

  try {
    for await (const part of parts) {
      if (part.type === "error") {
        fail(part.error);
        return;
      }
      if (part.type === "text-delta" && typeof part.text === "string") {
        sink.append(part.text);
      }
    }
    finish();
  } catch (error) {
    fail(error);
  }
}
