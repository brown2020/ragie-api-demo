# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

This is a **RAG API Demo** - a full-stack Next.js application demonstrating retrieval-augmented generation with OpenAI file search, multi-provider AI model support, payment processing, and document management.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4, Lucide icons
- **State Management**: Zustand 5
- **Authentication**: Firebase Auth (Google, email/password, email link)
- **Database/Storage**: Firebase Firestore + Firebase Storage
- **Payments**: Stripe
- **Search**: OpenAI Files API, Vector Stores, and Responses API file search (`openai` npm SDK)
- **AI Providers**: OpenAI, Anthropic, Google AI, Mistral, Fireworks (via AI SDK)

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Homepage
│   ├── about/              # About page
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   ├── dashboard/          # File management dashboard
│   ├── profile/            # User profile page
│   ├── payment-attempt/    # Stripe checkout
│   └── payment-success/    # Payment confirmation
├── components/             # React components
│   ├── AuthProvider.tsx    # Firebase Auth context provider
│   ├── AuthModal.tsx       # Sign in/sign up modal
│   ├── FileManagement.tsx  # Upload, index, and delete documents
│   ├── GenerateContent.tsx # Query + AI content generation
│   ├── QueryRetrieval.tsx  # Chunk retrieval display
│   ├── Header.tsx          # Navigation with auth
│   ├── Footer.tsx          # Footer with links
│   └── ...
├── actions/                # Next.js Server Actions
│   ├── index.ts            # Barrel exports
│   ├── indexDocument.ts    # Index a Storage file into the user's vector store
│   ├── retrieveChunks.ts   # Vector store search
│   ├── askDocuments.ts     # Responses API file_search answers with citations
│   ├── generateActions.ts  # Multi-provider AI generation
│   └── paymentActions.ts   # Stripe payment handling
├── zustand/                # Zustand state stores
│   ├── index.ts            # Barrel exports
│   ├── useAuthStore.ts     # Authentication state
│   ├── usePaymentsStore.ts # Payment history
│   └── useProfileStore.ts  # User profile + credits
├── types/                  # TypeScript type definitions
│   └── index.ts            # Centralized types
├── firebase/               # Firebase initialization
│   ├── firebaseClient.ts   # Client-side config
│   └── firebaseAdmin.ts    # Server-side admin SDK
└── lib/                    # Utilities
    ├── index.ts            # Barrel exports
    ├── convertToSubcurrency.ts
    └── openai-search.ts    # Files, vector stores, and file_search helper
```

## Key Architecture Patterns

### Authentication Flow
1. Firebase Auth handles authentication (Google, email/password, email link)
2. `AuthProvider` component wraps app with auth context
3. `onAuthStateChanged` listener updates Zustand auth store
4. User profile fetched and synced to Firestore on sign in
5. Protected routes check auth state before rendering

### Data Scoping
All data is user-scoped:
- Documents: `users/{uid}/documents`
- Payments: `users/{uid}/payments`
- Profile: `users/{uid}/profile/userData`
- OpenAI vector store id and file ids: `users/{uid}/search` (server only)

### Server Actions Pattern
Server actions receive userId from client and validate:
```typescript
export async function indexDocument(fileRef: string, fileName: string, documentId: string, idToken: string) {
  const uid = await verifyFirebaseIdToken(idToken);
  // ... rest of implementation
}
```

### Credits System
Uses Firestore transactions for atomic credit operations to prevent race conditions:
```typescript
await runTransaction(db, async (transaction) => {
  const docSnap = await transaction.get(userRef);
  const currentCredits = docSnap.data().credits;
  if (currentCredits < amount) return false;
  transaction.update(userRef, { credits: increment(-amount) });
  return true;
});
```

### AI Generation
Uses Vercel AI SDK with streaming responses via `@ai-sdk/rsc`. Supports multiple providers configured in `generateActions.ts`.

## Code Conventions

- **Components**: PascalCase, marked with `"use client"` for client components
- **Server Actions**: Files use `"use server"` directive
- **Hooks/Stores**: `use` prefix (e.g., `useAuthStore`)
- **Path Alias**: `@/*` maps to `./src/*`
- **Styling**: Tailwind utility classes, use `btn-primary` and `input-focus` classes
- **Imports**: Use barrel exports from index files (e.g., `from "@/zustand"`)

## Environment Variables

Required environment variables:
- Firebase Client: `NEXT_PUBLIC_FIREBASE_APIKEY`, `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECTID`, `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID`, `NEXT_PUBLIC_FIREBASE_APPID`
- Firebase Admin: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- AI APIs: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `MISTRAL_API_KEY`, `FIREWORKS_API_KEY`
- Stripe: `NEXT_PUBLIC_STRIPE_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PRODUCT_NAME`
- OpenAI file search: `OPENAI_API_KEY` (server only)

## Security

- Firebase security rules enforce user-scoped access with field validation
- Storage rules limit file size (100MB) and validate file types
- Payments cannot be updated or deleted after creation
- Sensitive fields (isAdmin, isAllowed, premium) are protected from client modification
- Server actions validate userId before any operation
