import Link from "next/link";

export const metadata = {
  title: "About - RAG Demo",
  description: "Learn about the RAG Demo application and its features.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About RAG Demo</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            What is RAG?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            RAG (Retrieval-Augmented Generation) is a technique that combines
            the power of large language models with external knowledge
            retrieval. Instead of relying solely on the model&apos;s training
            data, RAG systems can access and incorporate relevant information
            from your own documents to provide more accurate and contextual
            responses.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            How It Works
          </h2>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>
              <strong>Upload Documents:</strong> Add your PDF files, text
              documents, or other content to the system.
            </li>
            <li>
              <strong>Automatic Processing:</strong> Documents are processed and
              indexed for efficient retrieval.
            </li>
            <li>
              <strong>Ask Questions:</strong> Query your documents using natural
              language questions.
            </li>
            <li>
              <strong>Get Answers:</strong> Receive AI-generated responses based
              on your document content.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Features</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Secure document storage with user-scoped access</li>
            <li>Multiple AI model support (GPT-4, Claude, Gemini, and more)</li>
            <li>Real-time streaming responses</li>
            <li>Credit-based usage system</li>
            <li>Easy document management</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Technology Stack
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Built with Next.js, React, Firebase, and powered by the Ragie API
            for document retrieval. The application uses multiple AI providers
            through the Vercel AI SDK for flexible model selection.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/" className="btn-primary inline-block">
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
