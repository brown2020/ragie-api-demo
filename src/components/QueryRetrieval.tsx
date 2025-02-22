"use client";
import { useState } from "react";
import { retrieveChunks } from "@/actions/retrieveChunks"; // Server action for Ragie retrieval

// Define a type for the chunk structure
type Chunk = {
  text: string;
  score: number;
};

// Define a type for the server response
type RetrievalResponse = {
  scored_chunks: Chunk[];
};

export default function QueryRetrieval() {
  const [query, setQuery] = useState<string>("");
  const [retrievedChunks, setRetrievedChunks] = useState<Chunk[]>([]);

  // Handle the query and retrieve chunks from Ragie
  const handleQuery = async (): Promise<void> => {
    try {
      const data: RetrievalResponse = await retrieveChunks(query);
      console.log("Retrieved chunks from Ragie:", data);
      setRetrievedChunks(data.scored_chunks);
    } catch (error) {
      console.error("Error retrieving chunks from Ragie:", error);
    }
  };

  // Separate input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Ask a Question to Retrieve Content
      </h1>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Type your question here..."
          className="w-full px-3 py-2 border rounded-md"
        />
        <button
          onClick={handleQuery}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retrieve Chunks
        </button>
      </div>

      <h2 className="text-lg font-semibold text-gray-800">Retrieved Chunks</h2>
      <ul className="mt-4 space-y-2">
        {retrievedChunks.map((chunk, index) => (
          <li
            key={index}
            className="p-2 border rounded-lg shadow-xs bg-gray-50"
          >
            <p className="text-gray-700">{chunk.text}</p>
            <p className="text-xs text-gray-500">Score: {chunk.score}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
