// app/actions/retrieveChunks.ts
"use server";

export async function retrieveChunks(query: string) {
  console.log("Starting chunk retrieval...");
  console.log("Query:", query);

  const apiKey = process.env.RAGIE_API_KEY; // Use the Ragie API key securely from environment variables
  console.log("Ragie API Key:", apiKey ? "Key is set" : "Key is missing");

  try {
    const response = await fetch("https://api.ragie.ai/retrievals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        filter: {
          scope: "tutorial", // Adjust the filter based on your use case
        },
      }),
    });

    console.log("Ragie API Response Status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response from Ragie API:", errorText);
      throw new Error(
        `Failed to retrieve chunks from Ragie with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Retrieved chunks successfully:", data);
    return data; // Return the retrieved chunks
  } catch (error) {
    console.error("Error during chunk retrieval:", error);
    throw error;
  }
}
