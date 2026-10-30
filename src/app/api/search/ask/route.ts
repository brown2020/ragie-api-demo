import { askDocuments } from "@/actions/askDocuments";
import { actionFailure } from "@/lib/actionResult";
import { isFailure, jsonResult, readJson } from "../json";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await readJson(request);
  if (isFailure(body)) return jsonResult(body);

  const query = body.query;
  const idToken = body.idToken;
  if (typeof query !== "string" || typeof idToken !== "string") {
    return jsonResult(actionFailure(400, "INVALID_JSON", "query and idToken are required."));
  }

  return jsonResult(await askDocuments(query, idToken));
}
