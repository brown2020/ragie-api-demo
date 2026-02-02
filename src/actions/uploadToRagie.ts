// app/actions/uploadToRagie.ts
"use server";

import { ragieErrorResult, type RagieActionResult } from "@/lib/ragie-errors";

const FETCH_TIMEOUT = 30000; // 30 seconds

export async function uploadToRagie(
  fileUrl: string,
  fileName: string,
  userId: string
): Promise<RagieActionResult<unknown>> {
  // Validate userId is provided
  if (!userId) {
    return {
      ok: false,
      error: {
        status: 401,
        code: "UNAUTHORIZED",
        message: "User authentication required.",
      },
    };
  }

  const apiKey = process.env.RAGIE_API_KEY;
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

  try {
    // Fetch the file from Firebase Storage with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const fileResponse = await fetch(fileUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

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
    const fileBlob = new Blob([fileBuffer], { type: contentType });

    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    // Add userId to metadata for user-specific filtering
    formData.append(
      "metadata",
      JSON.stringify({
        title: fileName,
        scope: "tutorial",
        userId: userId,
      })
    );

    // Perform the upload request to Ragie API with timeout
    const uploadController = new AbortController();
    const uploadTimeoutId = setTimeout(() => uploadController.abort(), FETCH_TIMEOUT * 2);

    const response = await fetch("https://api.ragie.ai/documents", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
      body: formData,
      signal: uploadController.signal,
    });
    clearTimeout(uploadTimeoutId);

    if (!response.ok) {
      return await ragieErrorResult({
        response,
        endpoint: "https://api.ragie.ai/documents",
        method: "POST",
        fileUrl,
      });
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
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
