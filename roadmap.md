# Roadmap

Punchlist after the move from Ragie to OpenAI file search. Ragie's hosted API shut down on July 19, 2026. Promotion of `dev` to `main` happens after QA, separately from this list.

## Needs a person (not this repo's CI)

- Deploy `firestore.rules` and `storage.rules` to the Firebase project. The repo copies are the source of truth (32 MB cap, MIME allowlist, client credit and role locks, payment writes denied). They are not deployed by CI or by app release.
- Optionally create a Stripe webhook endpoint for `payment_intent.succeeded` at `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET` in the host. Until then the route returns 503 and fulfillment depends on the success page, which is idempotent with the webhook path.
- QA the `dev` branch, then promote to `main`. Do not treat a green CI run as that promotion.
- Confirm whether the pinned model ids are still offered by each provider before changing them. The dashboard only calls `gpt-4o`. Suspected retirement of the other ids was not confirmed in code, so they were left as-is.
- CI already runs on Node 24 (`node-version: "24"`), which satisfies `firebase` 13 `engines` `node >= 24.12.0`.

## Dependency follow-ups

- TypeScript 7.0.2 is published and is not feasible here. `typescript-eslint` (via `eslint-config-next` 16.4) refuses TypeScript 7.0. The app stays on TypeScript `^6.0.3`. Revisit when typescript-eslint documents TS 7 support, or run ESLint against a side-by-side TypeScript 6 install.
- Keep the `jwks-rsa` → `jose` `5.10.0` override while `firebase-admin` 14 / `jwks-rsa` 4 loads `jose` with `require()`. `jose` 6 is ESM-only and throws `ERR_REQUIRE_ESM`.
- `npm audit` is clean. `glob` 10.x under `firebase-admin` → `rimraf` is deprecated upstream and is not an audit finding. Do not force-upgrade it ahead of `firebase-admin`.
- Latest majors already in tree as of this pass: Next 16.4, React 19.3, Firebase 13, firebase-admin 14, AI SDK 7, Stripe 23, Zod 4, ESLint 10, Tailwind 4, Vitest 5. The maintenance bump itself was patch-level (`ai`, `@ai-sdk/rsc`, `@ai-sdk/anthropic`, `@types/node`).

## Known limits and bugs

- Rate limits live in a process-local `Map`. They do not coordinate across serverless instances, and the map is cleared when it grows past 10,000 keys.
- Profile UI is view-only. `updateProfile` exists on the Zustand store and is not called by a form.
- The dashboard Delete button removes the Storage object, the Firestore document, and the OpenAI file when one was indexed. A failed upload still deletes the Storage object from the client.
- The generation server action accepts five model ids. The dashboard hardcodes `gpt-4o`, so the other providers are unused in the UI.
- When `STRIPE_WEBHOOK_SECRET` is unset, a buyer who never returns to the success page does not receive credits. That is the current degrade-safe behavior.
- `next/image` remote patterns allow only `lh3.googleusercontent.com` for profile photos. Other Google image hosts will fail the image optimizer.
- Vitest prints an ESM-as-CJS warning for `vitest.config.ts` because the config uses `__dirname`. Tests pass. Renaming the file to `.mts` needs a config rewrite, not a rename alone.
- `IMPROVEMENT_PLAN.md` and `agent-runs/` still describe the old Ragie flow. `README.md`, `spec.md`, `CLAUDE.md`, and `AGENTS.md` describe OpenAI file search. The spec file used to be `SPEC.md`; Git tracks it as `spec.md`.
- Security rules are a demo prototype. Review them before sharing the Firebase project more widely.
- In-memory credit refunds depend on the provider call throwing. A streamed response that later fails mid-read is not a separate refund path.

## Sensible next product work

- Profile edit form that writes only the editable fields (`email`, `contactEmail`, `displayName`, `photoUrl`, `emailVerified`).
- Document delete now removes the Storage object, the Firestore doc, and the OpenAI file. The indexed flag in Firestore is still named `uploadedToRagie` so the currently deployed security rules keep accepting the client update. A rules rename can wait for a Firebase deploy.
- A model picker wired to the existing server-action ids, after confirming each id is still valid.
- Shared rate limiting (Firestore, Redis, or the host's limiter) if the demo is exposed beyond a single instance.
- Webhook-first fulfillment once `STRIPE_WEBHOOK_SECRET` is set, with the success page remaining as the idempotent backup.
- Rename the Firestore indexed flag off `uploadedToRagie` only together with a Firebase rules deploy. Until then the client still writes that boolean after a successful index.
