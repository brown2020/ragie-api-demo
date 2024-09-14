// app/actions/uploadToRagie.ts
"use server";

import fetch from "node-fetch"; // Use node-fetch for server-side fetch

export async function uploadToRagie(fileUrl: string, fileName: string) {
  console.log("Starting upload to Ragie...");
  console.log("File URL:", fileUrl);
  console.log("File Name:", fileName);

  const apiKey = process.env.RAGIE_API_KEY; // Use environment variable for the API key
  console.log("Ragie API Key:", apiKey ? "Key is set" : "Key is missing");

  try {
    // Fetch the file from Firebase Storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(
        `Failed to fetch the file from Firebase Storage: ${fileResponse.statusText}`
      );
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
    formData.append(
      "metadata",
      JSON.stringify({ title: fileName, scope: "tutorial" })
    );

    console.log("Form Data Prepared:");
    console.log("File in FormData:", formData.get("file"));
    console.log("Metadata in FormData:", formData.get("metadata"));

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

    console.log("Ragie API Response Status:", response.status);
    console.log("Ragie API Response Headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response from Ragie API:", errorText);
      throw new Error(`Upload to Ragie failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successful Upload to Ragie:", data);
    return data; // Return any relevant response data
  } catch (error) {
    console.error("Error during upload to Ragie:", error);
    throw error;
  }
}
