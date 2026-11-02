import { describe, expect, it, vi } from "vitest";
import {
  chunkAnswerPrompt,
  forwardGenerationStream,
  type GenerationStreamSink,
} from "./generationStream";

function sink() {
  const calls: string[] = [];
  const target: GenerationStreamSink = {
    append: vi.fn((text: string) => {
      calls.push(`append:${text}`);
    }),
    error: vi.fn((error: unknown) => {
      calls.push(`error:${error instanceof Error ? error.message : String(error)}`);
    }),
    done: vi.fn(() => {
      calls.push("done");
    }),
  };
  return { target, calls };
}

async function* parts(
  values: Array<{ type: string; text?: string; error?: unknown }>
) {
  for (const value of values) yield value;
}

describe("chunk answer stream", () => {
  it("sends the system prompt as instructions and the user text as prompt", () => {
    expect(chunkAnswerPrompt("Be brief.", "What is RAG?")).toEqual({
      instructions: "Be brief.",
      prompt: "What is RAG?",
    });
  });

  it("appends text deltas and finishes", async () => {
    const { target, calls } = sink();
    await forwardGenerationStream(
      parts([
        { type: "text-delta", text: "Hello" },
        { type: "text-delta", text: " there" },
      ]),
      target
    );
    expect(calls).toEqual(["append:Hello", "append: there", "done"]);
    expect(target.error).not.toHaveBeenCalled();
  });

  it("forwards a stream error part and does not finish as success", async () => {
    const { target, calls } = sink();
    await forwardGenerationStream(
      parts([
        { type: "text-delta", text: "Partial" },
        { type: "error", error: new Error("provider failed") },
        { type: "text-delta", text: "ignored" },
      ]),
      target
    );
    expect(calls).toEqual(["append:Partial", "error:provider failed"]);
    expect(target.done).not.toHaveBeenCalled();
  });

  it("forwards a thrown stream failure", async () => {
    const { target } = sink();
    async function* broken() {
      yield { type: "text-delta", text: "Hi" };
      throw new Error("connection reset");
    }
    await forwardGenerationStream(broken(), target);
    expect(target.append).toHaveBeenCalledWith("Hi");
    expect(target.error).toHaveBeenCalledWith(expect.any(Error));
    expect(target.done).not.toHaveBeenCalled();
  });
});
