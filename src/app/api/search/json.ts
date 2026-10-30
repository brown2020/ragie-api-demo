import { NextResponse } from "next/server";
import { actionFailure, type ActionResult } from "@/lib/actionResult";
import { actionHttpStatus } from "@/lib/actionResponse";

export function jsonResult<T>(result: ActionResult<T>): NextResponse {
  return NextResponse.json(result, { status: actionHttpStatus(result) });
}

export async function readJson(request: Request): Promise<Record<string, unknown> | ActionResult<never>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return actionFailure(400, "INVALID_JSON", "The request body must be a JSON object.");
    }
    return body as Record<string, unknown>;
  } catch {
    return actionFailure(400, "INVALID_JSON", "The request body must be JSON.");
  }
}

export function isFailure<T>(value: ActionResult<T> | Record<string, unknown>): value is ActionResult<never> {
  return "ok" in value && value.ok === false;
}
