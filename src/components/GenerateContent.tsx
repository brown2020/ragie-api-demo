"use client";
import { useState } from "react";
import { retrieveChunks } from "@/actions/retrieveChunks";
import { generateWithChunks } from "@/actions/generateActions";
import { readStreamableValue } from "@ai-sdk/rsc";
import { useAuthStore } from "@/zustand/useAuthStore";
import ReactMarkdown from "react-markdown";

type Chunk = {
  text: string;
  score: number;
};

type RetrievalResponse = {
  scored_chunks: Chunk[];
};

export default function GenerateContent() {
  const [query, setQuery] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const uid = useAuthStore((state) => state.uid);

  const handleAsk = async (): Promise<void> => {
    // Validate input
    if (!query?.trim()) {
      setError("Please enter a question");
      return;
    }

    if (!uid) {
      setError("Please sign in to ask questions");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setStatus("Retrieving...");
      setGeneratedContent("");

      // Step 1: Retrieve chunks from Ragie
      const data: RetrievalResponse = await retrieveChunks(query, uid);

      if (!data.scored_chunks || data.scored_chunks.length === 0) {
        setError(
          "No relevant content found. Please upload some documents first."
        );
        return;
      }

      // Step 2: Generate content using the retrieved chunks
      setStatus("Generating...");

      const result = await generateWithChunks(
        data.scored_chunks.map((chunk) => chunk.text),
        query,
        "gpt-4o"
      );

      // Stream the response
      for await (const content of readStreamableValue(result)) {
        if (content) {
          setGeneratedContent(content.trim());
        }
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsGenerating(false);
      setStatus("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
    if (error) setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !isGenerating) {
      handleAsk();
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Ask a Question of the Documents
      </h1>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your question here..."
          className="input-focus"
          disabled={isGenerating}
        />
        <button
          onClick={handleAsk}
          className={`btn-primary mt-3 ${isGenerating ? "btn-loading" : ""}`}
          disabled={isGenerating || !uid}
        >
          {status || "Ask Question"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-800">Generated Content</h2>
      <div className="mt-4 p-4 border rounded-lg shadow-sm bg-gray-50 min-h-[100px]">
        {generatedContent ? (
          <div className="text-gray-700 markdown-content">
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 italic">
            Ask a question to generate content from your documents.
          </p>
        )}
      </div>
    </div>
  );
}
