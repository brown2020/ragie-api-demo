import { indexStatus } from "@/actions/indexStatus";
import { actionFailure } from "@/lib/actionResult";
import { isFailure, jsonResult, readJson } from "../json";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await readJson(request);
  if (isFailure(body)) return jsonResult(body);

  const documentId = body.documentId;
  const idToken = body.idToken;
  if (typeof documentId !== "string" || typeof idToken !== "string") {
    return jsonResult(actionFailure(400, "INVALID_JSON", "documentId and idToken are required."));
  }

  return jsonResult(await indexStatus(documentId, idToken));
}
