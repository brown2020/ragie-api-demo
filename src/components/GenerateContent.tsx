"use client";
import { useState } from "react";
import { postAction } from "@/lib/actionResponse";
import type { SearchSource } from "@/lib/openai-search";
import { useAuthStore } from "@/zustand/useAuthStore";
import ReactMarkdown from "react-markdown";
import { getFirebaseIdToken } from "@/firebase/firebaseClient";

export default function GenerateContent() {
  const [query, setQuery] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const uid = useAuthStore((state) => state.uid);

  const handleAsk = async (): Promise<void> => {
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
      setStatus("Searching...");
      setGeneratedContent("");
      setSources([]);

      const idToken = await getFirebaseIdToken();
      const answer = await postAction<{ answer: string; sources: SearchSource[] }>(
        "/api/search/ask",
        { query, idToken }
      );
      if (!answer.ok) {
        setError(answer.error.message);
        return;
      }

      setGeneratedContent(answer.data.answer);
      setSources(answer.data.sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
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
      void handleAsk();
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Ask a Question of the Documents
      </h1>
      <div className="mb-4">
        <label htmlFor="generate-query" className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          id="generate-query"
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your question here..."
          className="input-focus"
          disabled={isGenerating}
        />
        <button
          type="button"
          onClick={handleAsk}
          className={`btn-primary mt-3 ${isGenerating ? "btn-loading" : ""}`}
          disabled={isGenerating || !uid}
        >
          {status || "Ask Question"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm" role="alert">
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

      {sources.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-800">Sources</h2>
          <ul className="mt-2 space-y-2">
            {sources.map((source) => (
              <li
                key={`${source.fileId ?? source.filename}-${source.text ?? ""}`}
                className="p-3 border rounded-lg bg-white text-sm text-gray-700"
              >
                <p className="font-medium">{source.filename}</p>
                {source.text && <p className="mt-1 text-gray-600">{source.text}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
