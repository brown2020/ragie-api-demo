# Repository Guidance

## Project Shape

This repository is a Next.js 16 App Router demo for retrieval-augmented generation with Ragie. The app uses React 19, TypeScript, Tailwind CSS 4, Firebase Auth, Firestore, Firebase Storage, Stripe, Zustand, and Vercel AI SDK providers.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Use `npm run lint` as the primary quality gate. Use `npm run build` when source changes affect routing, server actions, package versions, or runtime behavior.

## Important Files

- `src/app/`: Next.js routes and root layout.
- `src/components/`: Client UI, auth provider, dashboard, profile, payment, retrieval, and generation components.
- `src/actions/`: Server actions for Ragie upload/retrieval, AI generation, and Stripe checkout.
- `src/firebase/`: Firebase client and admin initialization.
- `src/zustand/`: Client state stores for auth, profile/credits, and payments.
- `src/lib/`: Shared utility and Ragie error helpers.
- `firestore.rules` and `storage.rules`: Firebase access rules.
- `agent-runs/`: Resumable codebase-improvement run reports.

## Architecture Notes

- The root layout wraps pages with `AuthProvider`, `Header`, `Footer`, and a toast provider.
- Firebase Auth is the current authentication source. `AuthProvider` listens with `onAuthStateChanged` and mirrors auth details into the Zustand auth store.
- User data is scoped under Firestore paths such as `users/{uid}/profile/userData`, `users/{uid}/documents`, and `users/{uid}/payments`.
- Document files are uploaded to Firebase Storage under `users/{uid}/documents/{fileName}` before being sent to Ragie through server actions.
- Ragie calls use the server-side `RAGIE_API_KEY` environment variable and include `userId` metadata/filtering.
- AI generation uses `@ai-sdk/rsc` streaming and provider packages for OpenAI, Google, Mistral, Anthropic, and Fireworks-compatible OpenAI calls.
- Stripe checkout is handled through server actions, while payment and credit state is stored in Firebase.

## Working Rules

- Preserve current Firebase Auth behavior; older README references to Clerk are stale.
- Keep server-only secrets in server actions or environment variables. Do not expose provider keys in client state or public environment variables.
- Do not broaden user-scoped Firestore or Storage rules without explicit security review.
- Keep fixes small and verifiable. Separate correctness fixes, dependency updates, and UI cleanup into separate commits when practical.
- Prefer existing path aliases (`@/*`) and local barrel exports where already present.
- Before pushing changes, inspect the diff and run `npm run lint` at minimum.
