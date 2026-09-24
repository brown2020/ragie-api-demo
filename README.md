# RAG Demo (ragie-api-demo)

A Next.js demo that walks users through a **retrieval-augmented generation (RAG)** workflow: sign in, upload documents, index them with [Ragie](https://www.ragie.ai/), retrieve relevant chunks for a query, and stream an AI answer grounded in that context. Credits for generation are purchased via Stripe.

**Live demo:** [https://ragdemo-three.vercel.app](https://ragdemo-three.vercel.app)

## Features

- **Firebase Auth** — email/password, Google sign-in, and email-link sign-in
- **Document management** — upload files to Firebase Storage, track metadata in Firestore, delete or send documents to Ragie
- **Ragie integration** — upload documents with user-scoped metadata; retrieve scored chunks filtered by the authenticated user
- **Multi-model generation** — stream answers with OpenAI (`gpt-4o`), Google (`gemini-1.5-pro`), Mistral (`mistral-large`), Anthropic (`claude-3-5-sonnet`), or Fireworks (`llama-v3p1-405b`) via the Vercel AI SDK
- **Credits & Stripe checkout** — buy credits; payment intents are verified server-side against the Firebase UID
- **Profile** — view and edit user profile data stored under `users/{uid}`
- **Fixture mode** — set `RAGIE_USE_FIXTURES=true` to short-circuit Ragie calls for CI / local demos without spending API credits

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js `^16.3.6` (App Router) |
| UI | React `^19.2.5`, Tailwind CSS `^4.2.4`, Lucide icons |
| Language | TypeScript `^5.9.3` |
| Auth / data | Firebase `^12` (Auth, Firestore, Storage) + Firebase Admin `^13` |
| RAG | Ragie HTTP API |
| AI | Vercel AI SDK (`ai` `^6`, `@ai-sdk/*`, `@ai-sdk/rsc`) |
| Payments | Stripe (`stripe` `^22`, `@stripe/react-stripe-js`) |
| State | Zustand `^5` |
| Tests | Vitest `^5` |
| Lint | ESLint `^10` + `eslint-config-next` |

## Project structure

```
src/
  app/                 # App Router pages (home, dashboard, profile, payments, about/privacy/terms)
  actions/             # Server Actions: Ragie upload/retrieve, AI generate, Stripe payments
  components/          # UI: auth, dashboard panels, payments, layout chrome
  firebase/            # Client + Admin Firebase init
  lib/                 # Helpers, Ragie fixtures, auth error mapping
  zustand/             # Auth, profile, and payments stores
firestore.rules        # User-scoped Firestore rules
storage.rules          # User-scoped Storage rules
.env.example           # Env var names (no secrets)
.github/workflows/ci.yml
```

Key routes:

| Path | Purpose |
| --- | --- |
| `/` | Landing / signed-in home |
| `/dashboard` | File management, query retrieval, content generation |
| `/profile` | User profile |
| `/payment-attempt` | Stripe checkout |
| `/payment-success` | Post-payment confirmation |
| `/about`, `/privacy`, `/terms` | Static info pages |

## Getting started

### Prerequisites

- Node.js 22+ (CI uses Node 22)
- npm
- Firebase project (Auth, Firestore, Storage)
- Ragie API key
- At least one AI provider API key
- Stripe account (for payments)

### Clone and install

```bash
git clone https://github.com/brown2020/ragie-api-demo.git
cd ragie-api-demo
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in values. **Never commit real keys.**

| Variable | Purpose | Where to get it |
| --- | --- | --- |
| `RAGIE_API_KEY` | Ragie API authentication | [Ragie dashboard](https://www.ragie.ai/) |
| `RAGIE_USE_FIXTURES` | `true` to use fixture Ragie responses (CI/local) | Set locally / in CI |
| `OPENAI_API_KEY` | OpenAI models via AI SDK | [OpenAI](https://platform.openai.com/) |
| `ANTHROPIC_API_KEY` | Anthropic models via AI SDK | [Anthropic](https://console.anthropic.com/) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini via AI SDK | [Google AI Studio](https://aistudio.google.com/) |
| `MISTRAL_API_KEY` | Mistral models via AI SDK | [Mistral](https://console.mistral.ai/) |
| `FIREWORKS_API_KEY` | Fireworks / Llama via AI SDK | [Fireworks](https://fireworks.ai/) |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key | Stripe Dashboard → API keys |
| `STRIPE_SECRET_KEY` | Stripe secret key (server) | Stripe Dashboard → API keys |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | Product label used in payment intents | Your choice / Stripe product name |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Firebase web client config | Firebase Console → Project settings |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Firebase Auth domain | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Firebase project id | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Firebase Storage bucket | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Firebase messaging sender id | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APPID` | Firebase web app id | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Optional Analytics measurement id | Firebase Console |
| `FIREBASE_TYPE` | Service account type (`service_account`) | Firebase service account JSON |
| `FIREBASE_PROJECT_ID` | Admin SDK project id | Service account JSON |
| `FIREBASE_PRIVATE_KEY_ID` | Admin SDK private key id | Service account JSON |
| `FIREBASE_PRIVATE_KEY` | Admin SDK private key (PEM, newlines escaped) | Service account JSON |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK client email | Service account JSON |
| `FIREBASE_CLIENT_ID` | Admin SDK client id | Service account JSON |
| `FIREBASE_AUTH_URI` | Usually `https://accounts.google.com/o/oauth2/auth` | Service account JSON |
| `FIREBASE_TOKEN_URI` | Usually `https://oauth2.googleapis.com/token` | Service account JSON |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Google certs URL | Service account JSON |
| `FIREBASE_CLIENT_CERTS_URL` | Client cert URL | Service account JSON |
| `FIREBASE_UNIVERSE_DOMAIN` | Usually `googleapis.com` | Service account JSON |

> Note: `.env.example` may still list Clerk variables; this app uses **Firebase Auth only** and does not depend on Clerk.

### Firebase setup

1. Create a Firebase project and enable **Email/Password**, **Google**, and (optionally) **Email link** sign-in.
2. Create a web app and copy the client config into the `NEXT_PUBLIC_FIREBASE_*` vars.
3. Generate a service account key and map its fields to the `FIREBASE_*` Admin vars (escape newlines in `FIREBASE_PRIVATE_KEY`).
4. Deploy or paste `firestore.rules` and `storage.rules` so users can only access `users/{uid}/...` data and storage paths.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For CI-style runs without Ragie credits:

```bash
RAGIE_USE_FIXTURES=true npm test
RAGIE_USE_FIXTURES=true npm run build
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit tests) |
| `npm run doctor` | `react-doctor` offline check |

## Testing and CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes to `dev` / `main` and on pull requests:

1. `npm ci --ignore-scripts`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test` with `RAGIE_USE_FIXTURES=true`
5. `npm run build` with `RAGIE_USE_FIXTURES=true`

Client Firebase/Stripe/Ragie keys are optional for this gate; Admin/client init soft-fails when unset so the quality gate can pass without secrets.

## Deployment

Typical target is **Vercel** (see live demo URL). Configure the same environment variables in the Vercel project settings. Deploy Firestore and Storage rules from this repo to your Firebase project before enabling production traffic.

`next.config.mjs` allows remote images from `firebasestorage.googleapis.com` and `lh3.googleusercontent.com` (Google profile photos).

## Contributing

1. Work on the `dev` branch.
2. Keep changes focused; run `npm run lint`, `npm run typecheck`, and `npm test` before pushing.
3. Do not commit `.env.local` or any real secrets.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
