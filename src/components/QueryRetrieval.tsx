"use client";
import { useState } from "react";
import { retrieveChunks } from "@/actions/retrieveChunks";
import { useAuthStore } from "@/zustand/useAuthStore";

type Chunk = {
  text: string;
  score: number;
};

type RetrievalResponse = {
  scored_chunks: Chunk[];
};

export default function QueryRetrieval() {
  const [query, setQuery] = useState<string>("");
  const [retrievedChunks, setRetrievedChunks] = useState<Chunk[]>([]);
  const [isRetrieving, setIsRetrieving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const uid = useAuthStore((state) => state.uid);

  const handleQuery = async (): Promise<void> => {
    // Validate input
    if (!query?.trim()) {
      setError("Please enter a query");
      return;
    }

    if (!uid) {
      setError("Please sign in to retrieve content");
      return;
    }

    try {
      setIsRetrieving(true);
      setError(null);
      const data: RetrievalResponse = await retrieveChunks(query, uid);
      setRetrievedChunks(data.scored_chunks || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
    if (error) setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !isRetrieving) {
      handleQuery();
    }
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
          onKeyDown={handleKeyDown}
          placeholder="Type your question here..."
          className="input-focus"
          disabled={isRetrieving}
        />
        <button
          onClick={handleQuery}
          className={`btn-primary mt-3 ${isRetrieving ? "btn-loading" : ""}`}
          disabled={isRetrieving || !uid}
        >
          {isRetrieving ? "Retrieving..." : "Retrieve Chunks"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-800">Retrieved Chunks</h2>
      {retrievedChunks.length === 0 ? (
        <p className="text-gray-500 mt-4 italic">
          No chunks retrieved yet. Enter a query to search your documents.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {retrievedChunks.map((chunk, index) => (
            <li
              key={index}
              className="p-3 border rounded-lg shadow-sm bg-gray-50"
            >
              <p className="text-gray-700">{chunk.text}</p>
              <p className="text-xs text-gray-500 mt-2">
                Relevance Score: {(chunk.score * 100).toFixed(1)}%
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
