# Ragie AI Retrieval-Augmented Generation (RAG) with Next.js 16

Welcome to the **Ragie AI RAG Demo** — a Next.js 16 application that uses the Vercel AI SDK (v4) with server actions to implement Retrieval-Augmented Generation (RAG) using the Ragie API. This project demonstrates an effective way to leverage AI for context-aware content generation by retrieving and generating information based on user queries.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [What is Retrieval-Augmented Generation (RAG)?](#what-is-retrieval-augmented-generation-rag)
- [About Ragie](#about-ragie)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [File Management](#file-management)
  - [Retrieving Chunks](#retrieving-chunks)
  - [Retrieving and Generating Content](#retrieving-and-generating-content)
- [Streaming Responses](#streaming-responses)
  - [Server Action for Streaming](#server-action-for-streaming)
  - [Client-Side Handling of Streaming Responses](#client-side-handling-of-streaming-responses)
- [Upcoming Features](#upcoming-features)
- [Deployment](#deployment)
- [License](#license)
- [Contact](#contact)

## Overview

This project uses Next.js 14, Vercel AI SDK, and the Ragie API to build an interactive web application that utilizes Retrieval-Augmented Generation (RAG). The application enables users to upload documents, retrieve content chunks from them, and generate AI responses based on those chunks in real-time.

## Features

- **File Management**: Upload documents to Firebase Storage and manage them in Firestore.
- **Retrieval of Chunks**: Fetch relevant content chunks using the Ragie API based on user queries.
- **Content Generation**: Generate responses using various AI models (OpenAI, Google, Anthropic, Mistral, Fireworks) with retrieved information.
- **Real-Time Streaming**: Stream AI-generated responses to the client in real-time using Vercel AI SDK.
- **User Authentication**: Secure access to different parts of the app with Clerk middleware.
- **Planned Feature**: Enable users to add their own API keys via the client and choose to use their keys or purchase project credits.

## What is Retrieval-Augmented Generation (RAG)?

**Retrieval-Augmented Generation (RAG)** is an advanced AI technique that enhances the generation of content by combining information retrieval with natural language generation.

### How RAG Works

1. **Retrieval**: When a user asks a question, relevant chunks of information are fetched from a dataset using a retrieval API (like Ragie) to provide context.
2. **Generation**: An AI model generates a response using the retrieved information. The generated content is thus more accurate and contextually relevant to the user’s query.

### Why RAG is Important

- **Enhanced Relevance**: By grounding AI responses in actual, relevant data, RAG significantly improves the relevance and accuracy of generated content.
- **Scalability**: RAG can handle a broad range of queries by dynamically retrieving only the necessary information, which reduces the need for fine-tuning large models on specific datasets.
- **Real-Time Interaction**: Streaming responses allow for real-time interaction, providing immediate feedback to the user.

RAG is particularly valuable in applications such as customer support, research, content creation, and anywhere precise and relevant information needs to be generated dynamically.

## About Ragie

**Ragie** is a powerful API platform that provides secure retrieval-augmented generation capabilities for developers. With Ragie, you can efficiently retrieve and generate relevant content based on user queries by integrating various documents and metadata.

### Key Concepts

1. **Documents**:

   - Files are imported into Ragie as documents. Their contents are processed to extract semantic information, enabling efficient retrieval.
   - Ragie supports various file types, including structured and unstructured data. Even images within documents are processed to extract their semantic data.
   - Documents can include optional metadata, which can be used later to filter retrieval results. The file associated with a document can be updated, replacing the previous version in future retrieval results.

2. **Metadata**:

   - An arbitrary object that is stored with a document and can be used to pre-filter retrieval results. This is useful for various use cases, such as implementing permissions, categorization, and search optimization.

3. **Retrieval**:

   - A natural language query can be made using Ragie’s retrieval API, optionally including a metadata filter. This returns a list of relevant content chunks that are suitable for providing context to a large language model (LLM). Ragie supports various options that allow users to trade-off between retrieval speed and quality.

4. **Connectors**:

   - Ragie offers out-of-the-box connectors to simplify document ingestion from commonly used services such as Google Drive, Notion, Confluence, Salesforce, Jira, and Onedrive. Changes made in the connected service are synchronized with Ragie automatically.

5. **SDKs**:
   - Ragie provides SDKs in popular programming languages such as TypeScript and Python, offering a smoother developer experience by abstracting direct HTTP calls.

### How Ragie Works

- **Data Loading**: Data is loaded into Ragie by posting files to the `/documents` endpoint. Metadata can be attached to documents to support flexible filtering at retrieval and generation time.
- **Retrieval**: Once documents are in Ragie, you can semantically search them using the `/retrievals` endpoint. The API allows options like `rerank` to improve retrieval quality.
- **Generation**: Using the chunks retrieved, Ragie can provide relevant context to language models, which can then generate accurate responses based on the data provided.

## Technologies Used

- **Next.js 16**: A powerful React framework optimized for web application development.
- **React 19**: The latest version of the library for web and native user interfaces.
- **Vercel AI SDK (v4)**: A toolkit to enhance AI capabilities in Next.js applications.
- **Ragie API**: An API to retrieve content chunks from datasets for context-aware generation.
- **Firebase**: For managing file uploads and storing metadata.
- **TypeScript**: A superset of JavaScript for type-safe code.
- **Tailwind CSS (v4)**: A utility-first CSS framework for efficient styling.
- **Clerk**: A platform for user authentication and access control.
- **Stripe**: For handling payment processing.

## Getting Started

### Prerequisites

- **Node.js** (v20 or higher recommended)
- **npm** (v10 or higher)
- A **Ragie API Key** (Sign up at [Ragie](https://docs.ragie.ai/docs/tutorial))
- A **Firebase Project** (See [Firebase Setup](https://firebase.google.com/))
- A **Clerk Account** (Sign up at [Clerk](https://clerk.dev))

### Installation

Clone this repository and install the dependencies:

```bash
git clone https://github.com/brown2020/ragie-ai-rag-demo.git
cd ragie-ai-rag-demo
npm install
```

### Environment Variables

Create a `.env` file in the root directory and set the following variables:

```plaintext
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_public_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=your_clerk_sign_in_url
NEXT_PUBLIC_CLERK_SIGN_UP_URL=your_clerk_sign_up_url

# AI Model API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
MISTRAL_API_KEY=your_mistral_api_key
OPENAI_API_KEY=your_openai_api_key
FIREWORKS_API_KEY=your_fireworks_api_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PRODUCT_NAME=your_stripe_product_name
NEXT_PUBLIC_STRIPE_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=your_firebase_measurement_id

# Firebase Server Config
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERTS_URL=your_firebase_client_certs_url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# Ragie API Key
RAGIE_API_KEY=your_ragie_api_key
```

## Usage

### File Management

1. **Upload Documents**:

   - Go to the \*\*File Management\*\* page and upload documents to Firebase Storage. The metadata for each document will be stored in Firestore.

2. **Manage Documents**:
   - View the list of uploaded documents, and upload them to Ragie for retrieval-augmented generation.

### Retrieving Chunks

1. **Enter Query**:
   - On the **Query Retrieval** page, enter a question or query.
2. **Retrieve Chunks**:
   - The application uses Ragie to retrieve relevant content chunks from the uploaded documents. The retrieved chunks are displayed on the page.

### Retrieving and Generating Content

1. **Ask a Question**:
   - On the **Generate Content** page, enter a question.
2. **Retrieve and Generate**:
   - The application first retrieves relevant chunks using Ragie and then generates a response based on these chunks using an AI model. The response is streamed to the client in real-time.

## Streaming Responses

### Server Action for Streaming

The `generateWithChunks` function in `src/actions/generateActions.ts` demonstrates how to use the Vercel AI SDK (v4) to handle streamed responses using `streamText` and `createStreamableValue`.

```typescript
import { createStreamableValue } from "ai/rsc";
import { streamText } from "ai";

// ... (model selection logic)

async function generateResponse(systemPrompt: string, userPrompt: string, modelName: string) {
  const model = await getModel(modelName);
  
  const result = streamText({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
```

### Client-Side Handling of Streaming Responses

```typescript
const result = await generateWithChunks(
  data.scored_chunks.map((chunk) => chunk.text),
  query,
  "gpt-4o"
);

// Correctly stream the response to handle progressive updates
for await (const content of readStreamableValue(result)) {
  if (content) {
    setGeneratedContent((prevContent) => prevContent + content.trim());
  }
}
```

## Upcoming Features

- **Client-Side API Key Management**: Allow users to input their own API keys in the client and choose whether to use their own keys or purchase project credits.
- **Dynamic API Key Selection**: Users can toggle between using their API keys or the project's keys.

## Deployment

Deploy the application on Vercel:

1. Install the Vercel CLI: `npm i -g vercel`.
2. Run `vercel` and follow the prompts to deploy.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For more information, feel free to contact:

- **GitHub**: [brown2020](https://github.com/brown2020)
- **Email**: [info@ignitechannel.com](mailto:info@ignitechannel.com)
