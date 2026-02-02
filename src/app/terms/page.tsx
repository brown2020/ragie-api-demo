import Link from "next/link";

export const metadata = {
  title: "Terms of Service - RAG Demo",
  description: "Terms of Service for the RAG Demo application.",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing and using RAG Demo (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            2. Description of Service
          </h2>
          <p className="text-gray-600 leading-relaxed">
            RAG Demo provides a document upload and AI-powered question-answering
            service. Users can upload documents, which are processed and indexed
            to enable intelligent retrieval and AI-generated responses to user
            queries.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            3. User Accounts
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            To use certain features of the Service, you must create an account.
            You are responsible for:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            4. Acceptable Use
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Upload content that violates any laws or regulations</li>
            <li>Upload malicious software or harmful content</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Upload content that infringes intellectual property rights</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            5. Content Ownership
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You retain ownership of all content you upload to the Service. By
            uploading content, you grant us a limited license to process, store,
            and analyze your content solely for the purpose of providing the
            Service to you. We do not claim ownership of your content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            6. Credits and Payments
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The Service uses a credit-based system. Credits are non-refundable
            and non-transferable. We reserve the right to modify pricing and
            credit allocation at any time with reasonable notice. All payments
            are processed securely through Stripe.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The Service is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of the
            Service. AI-generated responses may not always be accurate and
            should not be relied upon for critical decisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            8. Termination
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may terminate or suspend your account at any time for violation
            of these Terms. Upon termination, your right to use the Service will
            immediately cease. You may also delete your account at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            9. Changes to Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to modify these Terms at any time. We will
            notify users of significant changes. Continued use of the Service
            after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            10. Contact
          </h2>
          <p className="text-gray-600 leading-relaxed">
            If you have questions about these Terms of Service, please contact
            us through the application.
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
