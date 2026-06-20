# Ragie API Demo Current-State Spec

## Purpose

This app demonstrates a user-scoped RAG workflow: users authenticate, upload documents, send documents to Ragie, retrieve chunks for a query, and generate streamed AI responses from the retrieved context.

## Current Implementation

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- Styling: Tailwind CSS 4 plus shared classes in `src/app/globals.css`.
- Authentication: Firebase Auth through `src/components/AuthProvider.tsx` and auth state in `src/zustand/useAuthStore.ts`.
- Persistence: Firestore stores profile, document metadata, and payments under `users/{uid}`.
- File storage: Firebase Storage stores documents under `users/{uid}/documents/{fileName}`.
- RAG integration: `src/actions/uploadToRagie.ts` uploads Firebase-hosted files to Ragie with user metadata, and `src/actions/retrieveChunks.ts` retrieves chunks filtered by user metadata. These actions verify Firebase ID tokens server-side and derive the UID from the decoded token.
- AI generation: `src/actions/generateActions.ts` streams model output with Vercel AI SDK providers.
- Payments and credits: Stripe checkout is initiated from server actions. Successful Stripe intents are verified against the authenticated Firebase UID and processed server-side into Firestore payment records and credit increments.

## User Workflows

- Home: `src/app/page.tsx` renders `RagieMain`.
- Dashboard: `src/app/dashboard/page.tsx` exposes file management and Ragie upload flows.
- Profile: `src/app/profile/page.tsx` shows and edits user profile data.
- Payment attempt and success pages support checkout and post-payment credit handling.
- Static informational pages exist for about, privacy, and terms.

## Data Boundaries

- Client components may read Firebase Auth state and user-owned Firestore documents.
- Server actions own calls to Ragie, Stripe, and AI providers.
- User-scoped server actions verify Firebase ID tokens with Firebase Admin before using a UID.
- Firestore and Storage rules enforce authenticated user scoping.
- Firestore rules allow users to read their own payment records and profile data, but payment records and credit balance mutations are server-owned.

## Validation

- Primary local quality gate: `npm run lint`.
- Broader runtime gate: `npm run build`.
- Firebase rules are present in `firestore.rules` and `storage.rules`; deployment/production validation is outside this local workflow.

## Architecture and Quality Risks

- Payment and user-scoped server actions now depend on Firebase Admin runtime configuration for token verification and Admin Firestore writes.
- Some README content appears stale relative to the Firebase Auth implementation and current package versions.
- Package audit output from GitHub during branch push reported vulnerabilities on the default branch; local audit and dependency cleanup should verify details before changing packages.

## Product Direction

No new product roadmap priority is approved by this codebase-improvement workflow. Future feature prioritization should go through `$sb-prd` or `$sb-pip`.
