import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - RAG Demo",
  description: "Privacy Policy for the RAG Demo application.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            1. Information We Collect
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Account information (email address, name, profile picture)</li>
            <li>Documents you upload to the service</li>
            <li>Queries and interactions with the AI system</li>
            <li>Payment information (processed securely through Stripe)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your documents for AI-powered retrieval</li>
            <li>Process transactions and send related information</li>
            <li>Respond to your comments and questions</li>
            <li>Send technical notices and support messages</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            3. Data Storage and Security
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Your data is stored securely using Firebase services with
            industry-standard encryption. Documents are stored in user-specific
            folders with access controls that prevent other users from accessing
            your content. We implement appropriate technical and organizational
            measures to protect your personal data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            4. Data Sharing
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell your personal information. We may share your
            information with third-party service providers who perform services
            on our behalf, such as payment processing (Stripe), cloud storage
            (Firebase), and AI processing (Ragie, OpenAI, Anthropic, Google).
            These providers are bound by contractual obligations to protect your
            data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            5. Your Rights
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Export your data in a portable format</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            6. Cookies
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We use essential cookies required for the service to function,
            including authentication cookies. We do not use tracking or
            advertising cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            7. Contact Us
          </h2>
          <p className="text-gray-600 leading-relaxed">
            If you have questions about this Privacy Policy, please contact us
            through the application.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
