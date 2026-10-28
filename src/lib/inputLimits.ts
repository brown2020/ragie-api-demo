export const INPUT_LIMITS = {
  maxQueryChars: 4_000,
  maxChunks: 20,
  maxChunkChars: 8_000,
  maxTotalChunkChars: 32_000,
  maxFileNameChars: 200,
  maxUploadBytes: 32 * 1024 * 1024,
} as const;

export function assertQuery(query: string): string {
  const trimmed = query?.trim() ?? "";
  if (!trimmed) {
    throw new Error("Query cannot be empty");
  }
  if (trimmed.length > INPUT_LIMITS.maxQueryChars) {
    throw new Error("Query is too long");
  }
  return trimmed;
}

export function assertChunks(chunks: string[]): string[] {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No context chunks provided");
  }
  if (chunks.length > INPUT_LIMITS.maxChunks) {
    throw new Error("Too many context chunks");
  }

  let total = 0;
  for (const chunk of chunks) {
    if (typeof chunk !== "string") {
      throw new Error("Invalid context chunk");
    }
    if (chunk.length > INPUT_LIMITS.maxChunkChars) {
      throw new Error("A context chunk is too long");
    }
    total += chunk.length;
  }

  if (total > INPUT_LIMITS.maxTotalChunkChars) {
    throw new Error("Context is too long");
  }

  return chunks;
}
