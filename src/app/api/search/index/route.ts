import { indexDocument } from "@/actions/indexDocument";
import { actionFailure } from "@/lib/actionResult";
import { isFailure, jsonResult, readJson } from "../json";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await readJson(request);
  if (isFailure(body)) return jsonResult(body);

  const fileRef = body.fileRef;
  const fileName = body.fileName;
  const documentId = body.documentId;
  const idToken = body.idToken;
  if (
    typeof fileRef !== "string" ||
    typeof fileName !== "string" ||
    typeof documentId !== "string" ||
    typeof idToken !== "string"
  ) {
    return jsonResult(
      actionFailure(400, "INVALID_JSON", "fileRef, fileName, documentId, and idToken are required.")
    );
  }

  return jsonResult(await indexDocument(fileRef, fileName, documentId, idToken));
}
