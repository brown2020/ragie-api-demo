import { actionFailure, type ActionResult } from "@/lib/actionResult";

export function readActionResult<T>(body: unknown): ActionResult<T> | null {
  if (!body || typeof body !== "object" || !("ok" in body)) return null;
  return body as ActionResult<T>;
}

export function actionHttpStatus<T>(result: ActionResult<T>): number {
  return result.ok ? 200 : result.error.status;
}

export const UNEXPECTED_SERVER_MESSAGE =
  "The server did not return a result. Please try again.";

export async function pollIndex(
  documentId: string,
  idToken: string,
  initial: "in_progress" | "completed"
): Promise<ActionResult<{ status: "completed" }>> {
  let status = initial;
  const deadline = Date.now() + 120_000;
  while (status === "in_progress" && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const polled = await postAction<{ status: "in_progress" | "completed" }>("/api/search/status", {
      documentId,
      idToken,
    });
    if (!polled.ok) return polled;
    status = polled.data.status;
  }
  if (status !== "completed") {
    return actionFailure(
      504,
      "INDEX_TIMEOUT",
      "Indexing is still running. Use Re-index if it does not finish."
    );
  }
  return { ok: true, data: { status: "completed" } };
}

export async function postAction<T>(url: string, body: unknown): Promise<ActionResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return actionFailure(503, "NETWORK_ERROR", "The request could not reach the server. Please try again.");
  }

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  const result = readActionResult<T>(parsed);
  if (result) return result;
  return actionFailure(response.status || 502, "UNEXPECTED_RESPONSE", UNEXPECTED_SERVER_MESSAGE);
}
