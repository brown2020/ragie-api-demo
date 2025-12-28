export type RagieActionError = {
  status: number;
  code: string;
  message: string;
  detail?: string;
  requestId?: string;
};

export type RagieActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: RagieActionError };

function safeTruncate(input: string, maxLen: number) {
  if (input.length <= maxLen) return input;
  return `${input.slice(0, maxLen)}…`;
}

function redactUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "<invalid-url>";
  }
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text().catch(() => "");

  if (contentType.includes("application/json")) {
    try {
      return {
        contentType,
        text,
        json: JSON.parse(text) as unknown,
      };
    } catch {
      // fall through
    }
  }

  return { contentType, text, json: undefined as unknown };
}

function extractDetail(json: unknown, fallbackText: string): string | undefined {
  if (json && typeof json === "object") {
    const anyJson = json as Record<string, unknown>;
    const detail =
      typeof anyJson.detail === "string"
        ? anyJson.detail
        : typeof anyJson.message === "string"
          ? anyJson.message
          : typeof anyJson.error === "string"
            ? anyJson.error
            : undefined;
    if (detail) return detail;
  }

  const trimmed = fallbackText.trim();
  return trimmed ? safeTruncate(trimmed, 2000) : undefined;
}

function toUserMessage(status: number, detail?: string) {
  if (status === 401) {
    return "Ragie rejected the API key (401 Unauthorized). Check `RAGIE_API_KEY` in `.env.local`.";
  }

  if (status === 403) {
    const d = detail?.toLowerCase() ?? "";
    if (d.includes("account") && d.includes("disabled")) {
      return detail!;
    }
    return "Ragie forbids this request (403). Your API key may not have access to this resource.";
  }

  if (status === 413) {
    return "Ragie rejected the upload because it’s too large (413). Try a smaller file.";
  }

  if (status === 415) {
    return "Ragie rejected the file type (415). Try a supported document format.";
  }

  if (status === 429) {
    return "Ragie rate-limited this request (429). Please retry in a moment.";
  }

  if (status >= 500) {
    return "Ragie is having trouble right now. Please retry in a moment.";
  }

  return `Ragie request failed (HTTP ${status}).`;
}

export async function ragieErrorResult(params: {
  response: Response;
  endpoint: string;
  method: string;
  fileUrl?: string;
}) : Promise<RagieActionResult<never>> {
  const { response, endpoint, method, fileUrl } = params;

  const requestId =
    response.headers.get("x-request-id") ??
    response.headers.get("x-requestid") ??
    response.headers.get("request-id") ??
    undefined;

  const { text, json } = await readResponseBody(response);
  const detail = extractDetail(json, text);
  const message = toUserMessage(response.status, detail);

  const code =
    response.status === 401
      ? "RAGIE_UNAUTHORIZED"
      : response.status === 403
        ? "RAGIE_FORBIDDEN"
        : response.status === 413
          ? "RAGIE_TOO_LARGE"
          : response.status === 415
            ? "RAGIE_UNSUPPORTED_MEDIA_TYPE"
            : response.status === 429
              ? "RAGIE_RATE_LIMITED"
              : response.status >= 500
                ? "RAGIE_SERVER_ERROR"
                : "RAGIE_REQUEST_FAILED";

  // High-signal, non-secret server log for debugging.
  console.error("Ragie API request failed", {
    endpoint,
    method,
    status: response.status,
    requestId,
    fileUrl: fileUrl ? redactUrl(fileUrl) : undefined,
    detail: detail ? safeTruncate(detail, 500) : undefined,
  });

  return {
    ok: false,
    error: {
      status: response.status,
      code,
      message,
      detail,
      requestId,
    },
  };
}


