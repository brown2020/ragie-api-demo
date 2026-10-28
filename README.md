# RAG Demo (ragie-api-demo)

A Next.js demo of a user-scoped **retrieval-augmented generation (RAG)** workflow: sign in with Firebase, upload documents, index them with [Ragie](https://www.ragie.ai/), retrieve scored chunks for a query, and stream an AI answer grounded in that context. Credits are purchased through Stripe.

**Live demo:** [https://ragdemo-three.vercel.app](https://ragdemo-three.vercel.app)

## Features

- **Firebase Auth** — email/password, Google sign-in, and email-link sign-in. Server actions verify a Firebase ID token and derive the UID server-side.
- **Document management** — upload PDF, plain text, Markdown, CSV, DOC, DOCX, XLSX, or PPTX files (32 MB max) to Firebase Storage under a unique `users/{uid}/documents/{uuid}-{name}` path, and track metadata in Firestore. There is no user-facing delete control; a failed metadata write deletes the Storage object as cleanup.
- **Ragie integration** — the server reads the user's Storage object with the Admin SDK (it does not fetch a caller-supplied URL), uploads it to Ragie with user-scoped metadata, and retrieves chunks filtered to that user.
- **Generation** — the dashboard streams answers with OpenAI `gpt-4o` through the Vercel AI SDK. The server action can also call Google `gemini-1.5-pro`, Mistral `mistral-large`, Anthropic `claude-3-5-sonnet`, or Fireworks `llama-v3p1-405b` when those model ids are passed. The dashboard does not expose a model picker.
- **Credits and Stripe** — new profiles start with 1,000 credits. A catalog pack is 10,000 credits for $99.99. Upload costs 5, retrieval costs 1, and generation costs 10; the debit is refunded if the provider call throws. Intents are created and fulfilled server-side against the Firebase UID. `POST /api/stripe/webhook` accepts a signed `payment_intent.succeeded` event when `STRIPE_WEBHOOK_SECRET` is set; without that secret the route returns 503 and the success page still fulfills the payment idempotently.
- **Profile** — view auth details, credit balance, and payment history. The page does not edit profile fields.
- **Fixture mode** — `RAGIE_USE_FIXTURES=true` short-circuits live Ragie calls for CI and local builds. It does not prove live retrieval quality.
- **Baseline headers** — CSP, `X-Frame-Options`, `nosniff`, Referrer-Policy, and Permissions-Policy on every route. HSTS is sent only when `NODE_ENV=production`.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js `^16.4.3` (App Router) |
| UI | React `^19.3.1`, Tailwind CSS `^4.3.3`, Lucide `1.63.0` |
| Language | TypeScript `^6.0.3` |
| Auth / data | Firebase `^13.1.0` (Auth, Firestore, Storage) + Firebase Admin `^14.5.0` |
| RAG | Ragie HTTP API |
| AI | Vercel AI SDK (`ai` `^7.0.156`, `@ai-sdk/*`, `@ai-sdk/rsc` `^3.0.156`) |
| Payments | Stripe `^23.0.1`, `@stripe/react-stripe-js` `^7.0.1` |
| State | Zustand `^5.0.16` |
| Validation | Zod `^4.6.7` |
| Tests | Vitest `^5.0.5` |
| Lint | ESLint `^10.13.0` + `eslint-config-next` `^16.4.3` |

`firebase-admin` 14 pulls in `jwks-rsa` 4, which loads `jose` with `require()`. `package.json` overrides `jwks-rsa`'s `jose` to `5.10.0` because `jose` 6 is ESM-only. Leave that override in place.

## Project structure

```
src/
  app/                 # App Router pages and the Stripe webhook route
  actions/             # Server actions: Ragie upload/retrieve, AI generate, Stripe
  components/          # Auth, dashboard, profile, payments, layout
  firebase/            # Client and Admin Firebase init
  lib/                 # Billing, credits, rate limits, storage checks, fixtures
  zustand/             # Auth, profile, and payments stores
firestore.rules        # User-scoped Firestore rules (deploy separately)
storage.rules          # User-scoped Storage rules (deploy separately)
.env.example           # Env var names and placeholders (no real secrets)
spec.md                # Current-state specification
roadmap.md             # Next steps, known limits, open issues
.github/workflows/ci.yml
```

| Path | Purpose |
| --- | --- |
| `/` | Landing / signed-in home |
| `/dashboard` | Upload, send to Ragie, retrieve chunks, generate |
| `/profile` | View profile, credits, and payments |
| `/payment-attempt` | Stripe checkout for the catalog pack |
| `/payment-success` | Confirm payment and fulfill credits |
| `/api/stripe/webhook` | Signed `payment_intent.succeeded` handler |
| `/about`, `/privacy`, `/terms` | Static pages |

## Getting started

### Prerequisites

- Node.js 22 (CI and local verification use Node 22). The Firebase client packages declare a higher `engines` range; install may warn, and the app still builds on Node 22.
- npm
- A Firebase project with Auth, Firestore, and Storage
- A Ragie API key
- An OpenAI API key for the dashboard flow (other provider keys only if those models are called)
- A Stripe account for checkout

### Install

```bash
git clone https://github.com/brown2020/ragie-api-demo.git
cd ragie-api-demo
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in your own values. Never commit real keys. Names only:

| Variable | Required for | Purpose |
| --- | --- | --- |
| `RAGIE_API_KEY` | Live indexing and retrieval | Ragie API authentication |
| `RAGIE_USE_FIXTURES` | CI / local without Ragie | Set to `true` to skip live Ragie calls |
| `OPENAI_API_KEY` | Dashboard generation | OpenAI `gpt-4o` |
| `ANTHROPIC_API_KEY` | Only if that model is called | Anthropic |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Only if that model is called | Google Gemini |
| `MISTRAL_API_KEY` | Only if that model is called | Mistral |
| `FIREWORKS_API_KEY` | Only if that model is called | Fireworks |
| `NEXT_PUBLIC_STRIPE_KEY` | Checkout UI | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Creating and fulfilling payments | Stripe secret key (server) |
| `STRIPE_WEBHOOK_SECRET` | Optional | Webhook signing secret. Unset: route returns 503 |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | Fulfillment | Product label checked before credits are granted |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Client auth | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Client auth | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Client auth | Firebase project id |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Uploads | Storage bucket name |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Client auth | Messaging sender id |
| `NEXT_PUBLIC_FIREBASE_APPID` | Client auth | Web app id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Optional | Analytics measurement id |
| `FIREBASE_PROJECT_ID` | Admin SDK | Service account project id |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK | Service account client email |
| `FIREBASE_PRIVATE_KEY` | Admin SDK | Service account private key |
| `FIREBASE_TYPE` | Admin SDK | Service account type |
| `FIREBASE_PRIVATE_KEY_ID` | Admin SDK | Service account key id |
| `FIREBASE_CLIENT_ID` | Admin SDK | Service account client id |
| `FIREBASE_AUTH_URI` | Admin SDK | OAuth auth URI |
| `FIREBASE_TOKEN_URI` | Admin SDK | OAuth token URI |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Admin SDK | Google certs URL |
| `FIREBASE_CLIENT_CERTS_URL` | Admin SDK | Client cert URL |
| `FIREBASE_UNIVERSE_DOMAIN` | Admin SDK | Google API universe domain |

Admin init runs only when `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are set, so lint, typecheck, tests, and the production build succeed with those variables empty.

This app uses Firebase Auth. It does not read Clerk variables.

### Firebase and Stripe setup

1. Enable Email/Password, Google, and optionally Email link sign-in.
2. Copy the web app config into the `NEXT_PUBLIC_FIREBASE_*` names.
3. Map a service account into the `FIREBASE_*` names.
4. Deploy `firestore.rules` and `storage.rules` yourself. This repository does not deploy them. No composite index file is required; payment history sorts on the automatic `createdAt` index.
5. Optionally add a Stripe endpoint for `payment_intent.succeeded` at `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
RAGIE_USE_FIXTURES=true npm test
RAGIE_USE_FIXTURES=true npm run build
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run doctor` | `react-doctor` offline check |

## Testing and CI

`.github/workflows/ci.yml` runs on pushes to `dev` and `main`, and on pull requests, with Node 22 and no secrets:

1. `npm ci --ignore-scripts`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test` with `RAGIE_USE_FIXTURES=true`
5. `npm run build` with `RAGIE_USE_FIXTURES=true`

## Deployment

The usual host is Vercel. Set the environment variable names above in the host's project settings. Deploy the Firestore and Storage rules to Firebase before production traffic. `next.config.mjs` allows Next.js images from `firebasestorage.googleapis.com` and `lh3.googleusercontent.com` only.

Work lands on `dev`. Promotion to `main` is a separate QA step. Do not commit `.env.local` or real secrets.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
