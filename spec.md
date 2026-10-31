# RAG Demo — current specification

This document describes the app as built on the `dev` branch. It is the specification of record. Older notes in `IMPROVEMENT_PLAN.md`, `CLAUDE.md`, `AGENTS.md`, and `agent-runs/` can lag behind this file.

## Purpose

Demonstrate a user-scoped RAG loop:

1. Authenticate with Firebase.
2. Upload an allowed document to Firebase Storage and record metadata in Firestore.
3. Index that Storage object with the OpenAI Files API into one vector store for the Firebase uid.
4. Retrieve chunks for a query from that vector store.
5. Answer the question with the Responses API `file_search` tool and show cited sources. The model id is the existing `gpt-4o`.
6. Meter the loop with credits purchased through Stripe.

## Stack

- Next.js 16.4 App Router, React 19.3, TypeScript 6.0.
- Tailwind CSS 4.
- Firebase Auth, Firestore, and Storage on the client; Firebase Admin 14 on the server.
- OpenAI official `openai` npm SDK: Files API (`purpose: assistants`), one vector store per uid, and Responses API `file_search`. `OPENAI_API_KEY` is read only on the server. A missing key returns an error result and does not throw to the browser.
- Vercel AI SDK (`ai` 7, `@ai-sdk/rsc`) remains available for the existing multi-model `generateWithChunks` action. Dashboard questions do not use that path.
- Stripe 23 for a single catalog PaymentIntent.
- Zustand for auth, profile, and payment client state.
- Vitest for unit tests. GitHub Actions runs lint, typecheck, test, and production build on Node 24 without secrets.

Model ids are part of the product behavior and are not changed by dependency maintenance:

| Caller id | Provider model |
| --- | --- |
| `gpt-4o` | `gpt-4o` |
| `gemini-1.5-pro` | `models/gemini-1.5-pro-latest` |
| `mistral-large` | `mistral-large-latest` |
| `claude-3-5-sonnet` | `claude-3-5-sonnet-20241022` |
| `llama-v3p1-405b` | `accounts/fireworks/models/llama-v3p1-405b-instruct` |

The dashboard always calls `gpt-4o`.

## Routes

| Path | Behavior |
| --- | --- |
| `/` | Marketing / signed-in home |
| `/dashboard` | File list, index, delete, chunk retrieval, cited answers |
| `/profile` | Read-only auth, credits, and payment history |
| `/payment-attempt` | Stripe Elements for the catalog amount. If `NEXT_PUBLIC_STRIPE_KEY` is missing, the page says Stripe is not configured |
| `/payment-success` | After a succeeded intent, calls the fulfill action and refreshes the profile |
| `/api/stripe/webhook` | Node runtime, dynamic. Verifies `payment_intent.succeeded` when configured |
| `/about`, `/privacy`, `/terms` | Static pages |

## Authentication and identity

- `AuthProvider` listens to `onAuthStateChanged` and mirrors the session into the Zustand auth store.
- Protected UI checks that store before rendering dashboard actions.
- On sign-in, the client writes a sanitized user document. It does not send `isAdmin`, `isAllowed`, `premium`, or `credits`.
- Every user-scoped server action requires a Firebase ID token, verifies it with Firebase Admin, and uses the decoded UID. The client-supplied user id is not trusted.
- Token verification uses Google's securetoken x509 certificates. `jwks-rsa` is a transitive dependency of `firebase-admin` and is pinned to `jose` 5.10.0 so its CommonJS `require("jose")` keeps working.

## Documents

Allowed types: PDF, `text/plain`, `text/markdown`, `text/csv`, DOC, DOCX, XLSX, PPTX. HTML and SVG are rejected. Max size is 32 MB. File names are sanitized and capped at 200 characters.

Storage objects use `users/{uid}/documents/{uuid}-{sanitizedName}` and `Content-Disposition: attachment`. Firestore document creates require `storagePath`. Client updates may change `uploadedToRagie` only. That boolean is the indexed flag kept so existing security rules still accept the client write. The vector store id is stored at `users/{uid}/search/store`. The OpenAI file id is stored at `users/{uid}/searchFiles/{documentId}`. Both are even document paths and are outside the client-writable rules, so only the Admin SDK writes them. Upload does not index. Indexing again when a file id is already saved returns that id and does not upload a second copy.

`indexDocument`:

- Authenticates first.
- Accepts a storage path or an `https` Firebase download URL whose bucket matches `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` and whose object path is under `users/{uid}/documents/`. It never `fetch`es the URL.
- Downloads bytes with the Admin bucket, checks existence, size, and content type, uploads the file with the OpenAI Files API, and attaches it without waiting for vector-store processing. Any saved copy, any copy tagged with this document, and any untagged copy with the same file name is removed first. The dashboard polls `indexStatus` until the file is `completed` or `failed`. A failed or cancelled file is removed and returned as `INDEX_PROCESSING_FAILED`.
- `POST /api/search/index`, `/api/search/status`, and `/api/search/ask` return JSON. The dashboard page and those routes set `maxDuration` to 60 seconds. The platform default of 15 seconds was killing the first cold call and leaving the attached file in place.
- Charges 5 credits. A missing `OPENAI_API_KEY` returns a clear error before the provider call.

`retrieveChunks` authenticates, caps the query at 4,000 characters, rate-limits, charges 1 credit, and searches that vector store.

`askDocuments` authenticates, rate-limits, charges 10 credits, and calls the Responses API with `file_search` and model `gpt-4o`. Before answering, it detaches vector-store files that do not match a current document, and extra copies of a current document, keeping the saved file id. Citations are limited to those documents, grouped one per document, with snippets merged and empty entries dropped. The dashboard calls it through `POST /api/search/ask`. `deleteDocument` removes the Firestore document before the slower Storage and vector-store cleanup, so a reload cannot show it again. It removes every vector-store copy of that document (saved file id, document tag, and the same filename) and deletes those OpenAI files. The dashboard waits for that result, checks the document is gone, and only then removes the row. A failure stays on screen and leaves the row in place when the document is still there. A status poll or a finishing index does not write a mapping or the indexed flag after the document is gone. A missing OpenAI file, Storage object, or Firestore document is treated as already gone. Re-index uses the same index action, which removes the previous copy before attaching. The document list is newest `createdAt` first, then id descending.

## Generation

`generateWithChunks` still authenticates, validates the query and chunks (at most 20 chunks, 8,000 characters each, 32,000 total), checks that the selected provider key is set, rate-limits, charges 10 credits, then streams with `@ai-sdk/rsc`. The dashboard Ask button does not call it. An unknown model id is unsupported. An empty key returns "The selected model is not configured". Model ids are unchanged.

## Credits and payments

- Profile create sets `credits` to 1,000. Clients cannot change `credits` afterward. Rules reject client writes that include role or credit fields.
- Catalog price is 9999 cents (USD $99.99) and grants 10,000 credits. Any other amount is rejected.
- `createCatalogPaymentIntent` requires a verified UID and `STRIPE_SECRET_KEY`. Missing Stripe config throws "Payments are not configured".
- Fulfillment requires status `succeeded`, a safe UID, matching product name, currency `usd`, and the catalog amount. It writes `users/{uid}/payments/{paymentIntentId}` and increments credits inside an Admin transaction. Repeating the same intent is a no-op.
- The success page calls that fulfillment path. The webhook does the same when `STRIPE_WEBHOOK_SECRET` is set: missing secret returns 503, a bad signature returns 400, ignored business-rule mismatches return 200, and unexpected errors return 500.
- Debits use an Admin transaction. "Not enough credits" and "Invalid credit cost" are not retried.

Per-instance in-memory limits (not shared across serverless replicas): upload 10 per 10 minutes, retrieve 30 per 5 minutes, generate 20 per 5 minutes.

## Security rules and headers

Firestore (`firestore.rules`):

- User document create and update are separate. Clients cannot set admin, allow-list, premium, or credit fields.
- Profile create requires `credits == 1000`. Profile update cannot change credits. Profile and user-doc deletes are denied.
- Payment reads are owner-only. Payment writes are denied for clients.
- Document creates require a valid `storagePath`. Document deletes are allowed for the owner. There is no delete button in the UI.

Storage (`storage.rules`):

- Create/update is separate from delete so `request.resource` is valid.
- 32 MB cap and an anchored content-type allowlist matching the app.
- Objects must live under `users/{uid}/documents/`.

`next.config.mjs` sends CSP (Stripe, Google auth, Firebase; `unsafe-inline` and `unsafe-eval` for Next.js), `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, and Permissions-Policy. HSTS is production-only. Dev CSP allows localhost HTTP and WebSocket for HMR. Images: `firebasestorage.googleapis.com` and `lh3.googleusercontent.com`. OpenAI is called only from server actions.

## Configuration

See `README.md` for the env var name list. Server secrets stay in server actions and host env. Empty Firebase, Stripe, and OpenAI config must not fail `next build`.

## Quality gate

`npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` must pass. CI uses `npm ci --ignore-scripts` with no Actions secrets.

## Out of scope for this spec

- Deploying Firebase rules or indexes (there is no `firestore.indexes.json`).
- Changing Vercel project settings or env values.
- Rotating or printing secrets.
- Changing AI provider model ids.
- Promoting `dev` to `main`.
