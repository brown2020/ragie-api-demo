import OpenAI, { toFile } from "openai";

/**
 * The dashboard already calls this model. File search reuses it for the
 * Responses API instead of introducing a new model id.
 */
export const FILE_SEARCH_MODEL = "gpt-4o";

export const OPENAI_KEY_MISSING_MESSAGE =
  "OpenAI API key is missing. Set the OPENAI_API_KEY server environment variable.";

export const OPENAI_KEY_INVALID_MESSAGE =
  "OpenAI rejected the API key (401 Unauthorized). OPENAI_API_KEY is invalid.";

export type SearchSource = {
  filename: string;
  fileId?: string;
  text?: string;
  score?: number;
};

export type SearchChunk = {
  text: string;
  score: number;
  filename: string;
  fileId: string;
};

export type SearchApi = {
  createVectorStore(uid: string): Promise<{ id: string }>;
  retrieveVectorStore(id: string): Promise<{ id: string } | null>;
  uploadFile(file: {
    bytes: Uint8Array;
    fileName: string;
    contentType: string;
  }): Promise<{ id: string }>;
  attachFile(vectorStoreId: string, fileId: string): Promise<void>;
  deleteFile(fileId: string): Promise<void>;
  detachFile(vectorStoreId: string, fileId: string): Promise<void>;
  search(vectorStoreId: string, query: string): Promise<SearchChunk[]>;
  ask(
    vectorStoreId: string,
    query: string
  ): Promise<{ answer: string; sources: SearchSource[] }>;
};

export function readOpenAIApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key ? key : null;
}

export function buildFileSearchRequest(vectorStoreId: string, query: string) {
  return {
    model: FILE_SEARCH_MODEL,
    input: query,
    instructions:
      "Answer the user from the indexed documents. Mention the file names you relied on.",
    tools: [
      {
        type: "file_search" as const,
        vector_store_ids: [vectorStoreId],
      },
    ],
    include: ["file_search_call.results" as const],
  };
}

type CitationResponse = {
  output_text?: string | null;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      annotations?: Array<{
        type?: string;
        filename?: string;
        file_id?: string;
      }>;
    }>;
    results?: Array<{
      filename?: string;
      file_id?: string;
      text?: string;
      score?: number;
    }> | null;
  }>;
};

export function sourcesFromResponse(response: CitationResponse): {
  answer: string;
  sources: SearchSource[];
} {
  const sources: SearchSource[] = [];
  const seen = new Set<string>();

  const push = (source: SearchSource) => {
    const filename = source.filename?.trim();
    if (!filename && !source.text) return;
    const key = `${source.fileId ?? ""}|${filename ?? ""}|${source.text ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    sources.push({ ...source, filename: filename || "Document" });
  };

  for (const item of response.output ?? []) {
    if (item.type === "message") {
      for (const part of item.content ?? []) {
        for (const annotation of part.annotations ?? []) {
          if (annotation.type === "file_citation") {
            push({
              filename: annotation.filename ?? "Document",
              fileId: annotation.file_id,
            });
          }
        }
      }
    }
    if (item.type === "file_search_call") {
      for (const result of item.results ?? []) {
        push({
          filename: result.filename ?? "Document",
          fileId: result.file_id,
          text: result.text,
          score: result.score,
        });
      }
    }
  }

  return {
    answer: response.output_text?.trim() ?? "",
    sources,
  };
}

export async function ensureVectorStore(
  api: SearchApi,
  existingId: string | null,
  uid: string
): Promise<string> {
  if (existingId) {
    const found = await api.retrieveVectorStore(existingId);
    if (found) return found.id;
  }
  const created = await api.createVectorStore(uid);
  return created.id;
}

export async function indexUploadedFile(
  api: SearchApi,
  input: {
    vectorStoreId: string;
    bytes: Uint8Array;
    fileName: string;
    contentType: string;
  }
): Promise<{ fileId: string }> {
  const uploaded = await api.uploadFile(input);
  try {
    await api.attachFile(input.vectorStoreId, uploaded.id);
  } catch (error) {
    await api.deleteFile(uploaded.id).catch(() => undefined);
    throw error;
  }
  return { fileId: uploaded.id };
}

export function openAIFailure(error: unknown): {
  status: number;
  code: string;
  message: string;
} | null {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
      return {
        status: 401,
        code: "OPENAI_API_KEY_INVALID",
        message: OPENAI_KEY_INVALID_MESSAGE,
      };
    }
    if (error.status === 429) {
      return {
        status: 429,
        code: "OPENAI_RATE_LIMITED",
        message: "OpenAI rate-limited this request. Please retry in a moment.",
      };
    }
  }
  return null;
}

export function createOpenAISearchApi(apiKey: string): SearchApi {
  const client = new OpenAI({ apiKey });

  return {
    async createVectorStore(uid) {
      const store = await client.vectorStores.create({
        name: `user-${uid}`,
        metadata: { userId: uid },
      });
      return { id: store.id };
    },
    async retrieveVectorStore(id) {
      try {
        const store = await client.vectorStores.retrieve(id);
        return { id: store.id };
      } catch (error) {
        if (error instanceof OpenAI.APIError && error.status === 404) return null;
        throw error;
      }
    },
    async uploadFile(file) {
      const body = new ArrayBuffer(file.bytes.byteLength);
      new Uint8Array(body).set(file.bytes);
      const uploadable = await toFile(new Blob([body], { type: file.contentType }), file.fileName, {
        type: file.contentType,
      });
      const created = await client.files.create({
        file: uploadable,
        purpose: "assistants",
      });
      return { id: created.id };
    },
    async attachFile(vectorStoreId, fileId) {
      await client.vectorStores.files.create(vectorStoreId, { file_id: fileId });
    },
    async deleteFile(fileId) {
      await client.files.delete(fileId);
    },
    async detachFile(vectorStoreId, fileId) {
      await client.vectorStores.files.delete(fileId, { vector_store_id: vectorStoreId });
    },
    async search(vectorStoreId, query) {
      const page = await client.vectorStores.search(vectorStoreId, { query });
      return page.data.map((item) => ({
        text: item.content.map((part) => part.text).join("\n"),
        score: item.score,
        filename: item.filename,
        fileId: item.file_id,
      }));
    },
    async ask(vectorStoreId, query) {
      const request = buildFileSearchRequest(vectorStoreId, query);
      const response = await client.responses.create(request);
      return sourcesFromResponse(response);
    },
  };
}
