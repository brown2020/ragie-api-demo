import { ragieErrorResult, type RagieActionResult } from "./ragie-errors";

export const RAGIE_API_BASE = "https://api.ragie.ai";

export const RAGIE_KEY_MISSING_MESSAGE =
  "Ragie API key is missing. Set the RAGIE_API_KEY server environment variable.";

export const RAGIE_UNREACHABLE_MESSAGE =
  "Could not reach Ragie. The connection to api.ragie.ai failed before a response, so the API key was not checked.";

const RETRYABLE_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
]);

export function readRagieApiKey(): string | null {
  const key = process.env.RAGIE_API_KEY?.trim();
  return key ? key : null;
}

export function transportCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("cause" in error)) return undefined;
  const cause = (error as { cause?: { code?: unknown } }).cause;
  return typeof cause?.code === "string" ? cause.code : undefined;
}

/** Connection died before an HTTP status. A 401 invalid key is not this case. */
export function isRagieTransportError(error: unknown): boolean {
  if (!(error instanceof Error) || error.name === "AbortError") return false;
  if (error.message === "fetch failed") return true;
  const code = transportCode(error);
  return code ? RETRYABLE_CODES.has(code) : false;
}

export function createRagieDocumentForm(params: {
  bytes: Uint8Array;
  fileName: string;
  contentType: string;
  metadata: Record<string, string>;
}): FormData {
  // Node 24's FormData path expects a File. A bare Blob can be serialized as
  // the literal "[object File]" or omit the filename the documents API requires.
  const body = new ArrayBuffer(params.bytes.byteLength);
  new Uint8Array(body).set(params.bytes);
  const file = new File([body], params.fileName, {
    type: params.contentType,
  });
  const form = new FormData();
  form.append("file", file, params.fileName);
  form.append("name", params.fileName);
  form.append("metadata", JSON.stringify(params.metadata));
  return form;
}

type RagieFetchInit = Omit<RequestInit, "signal">;

/**
 * One attempt, then a single retry when the socket resets before a response.
 * Each attempt gets its own timeout so a retry is not aborted by the first signal.
 */
export async function ragieFetch(
  url: string,
  init: RagieFetchInit,
  timeoutMs: number
): Promise<Response> {
  const once = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await once();
  } catch (error) {
    if (!isRagieTransportError(error)) throw error;
    return await once();
  }
}

export async function ragieResultFromResponse(
  response: Response
): Promise<RagieActionResult<never> | null> {
  if (response.ok) return null;
  return ragieErrorResult({ response });
}

export function failureForRagieCall(error: unknown): RagieActionResult<never> | null {
  if (error instanceof Error && "result" in error) {
    const result = (error as Error & { result?: RagieActionResult<never> }).result;
    if (result) return result;
  }

  if (error instanceof Error && error.message === "RAGIE_API_KEY_MISSING") {
    return {
      ok: false,
      error: {
        status: 500,
        code: "RAGIE_API_KEY_MISSING",
        message: RAGIE_KEY_MISSING_MESSAGE,
      },
    };
  }

  if (error instanceof Error && error.name === "AbortError") {
    return {
      ok: false,
      error: {
        status: 408,
        code: "REQUEST_TIMEOUT",
        message: "Request timed out. Please try again.",
      },
    };
  }

  if (isRagieTransportError(error)) {
    return {
      ok: false,
      error: {
        status: 502,
        code: "RAGIE_UNREACHABLE",
        message: RAGIE_UNREACHABLE_MESSAGE,
      },
    };
  }

  return null;
}
