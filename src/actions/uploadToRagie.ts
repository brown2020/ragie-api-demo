// app/actions/uploadToRagie.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { ragieErrorResult, type RagieActionResult } from "@/lib/ragie-errors";

export async function uploadToRagie(
  fileUrl: string,
  fileName: string
): Promise<RagieActionResult<unknown>> {
  console.log("Starting upload to Ragie...", { fileName });

  const apiKey = process.env.RAGIE_API_KEY; // Use environment variable for the API key
  if (!apiKey) {
    return {
      ok: false,
      error: {
        status: 500,
        code: "RAGIE_API_KEY_MISSING",
        message: "Missing `RAGIE_API_KEY` server environment variable.",
      },
    };
  }

  // Get user information for scoping the document
  const { userId } = await auth();

  try {
    // Fetch the file from Firebase Storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return {
        ok: false,
        error: {
          status: fileResponse.status,
          code: "FIREBASE_FILE_FETCH_FAILED",
          message: `Failed to fetch the file from Firebase Storage (HTTP ${fileResponse.status}).`,
          detail: await fileResponse.text().catch(() => undefined),
        },
      };
    }

    // Get the content type and handle the null case
    const contentType =
      fileResponse.headers.get("content-type") || "application/octet-stream";

    // Convert the response to a Buffer
    const fileBuffer = await fileResponse.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: contentType }); // Provide a default type if contentType is null
    console.log("Fetched file from Firebase Storage.");

    const formData = new FormData();
    formData.append("file", fileBlob, fileName); // Append the Blob object with a file name

    // Add userId to metadata for user-specific filtering
    formData.append(
      "metadata",
      JSON.stringify({
        title: fileName,
        scope: "tutorial",
        userId: userId || "anonymous", // Include user ID for filtering
      })
    );

    console.log("Uploading document to Ragie...", { fileName, userId: userId ?? "anonymous" });

    // Perform the upload request to Ragie API
    const response = await fetch("https://api.ragie.ai/documents", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        // Do not manually set Content-Type when using FormData
        accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      return await ragieErrorResult({
        response,
        endpoint: "https://api.ragie.ai/documents",
        method: "POST",
        fileUrl,
      });
    }

    const data = await response.json();
    console.log("Successful upload to Ragie.", { fileName });
    return { ok: true, data }; // Return any relevant response data
  } catch (error) {
    console.error("Error during upload to Ragie:", error);
    return {
      ok: false,
      error: {
        status: 500,
        code: "UPLOAD_TO_RAGIE_UNEXPECTED_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error during upload to Ragie.",
      },
    };
  }
}
