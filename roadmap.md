# Roadmap

Punchlist after the move from Ragie to OpenAI file search. Ragie's hosted API shut down on July 19, 2026. Promotion of `dev` to `main` happens after QA, separately from this list.

## Needs a person (not this repo's CI)

- Deploy `firestore.rules` and `storage.rules` to the Firebase project. The repo copies are the source of truth (32 MB cap, MIME allowlist, client credit and role locks, payment writes denied). They are not deployed by CI or by app release.
- Optionally create a Stripe webhook endpoint for `payment_intent.succeeded` at `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET` in the host. Until then the route returns 503 and fulfillment depends on the success page, which is idempotent with the webhook path.
- QA the `dev` branch, then promote to `main`. Do not treat a green CI run as that promotion.
- Confirm whether the pinned model ids are still offered by each provider before changing them. The dashboard only calls `gpt-4o`. Suspected retirement of the other ids was not confirmed in code, so they were left as-is.
- CI already runs on Node 24 (`node-version: "24"`), which satisfies `firebase` 13 `engines` `node >= 24.12.0`.

## Dependency follow-ups

- TypeScript 7.0.2 is the `latest` dist-tag and is not feasible here. `typescript-eslint` 8.72.1 (pulled by `eslint-config-next` 16.4.3) declares a `typescript` peer of `>=4.8.4 <6.1.0`. The app stays on TypeScript `^6.0.3`, the newest release inside that range. Revisit when typescript-eslint accepts TypeScript 7.
- Keep the `jwks-rsa` → `jose` `5.10.0` override. `firebase-admin` 14.5.0 still depends on `jwks-rsa` 4.1.0, which loads `jose` with `require()`. `jose` 6.2.15 is ESM-only and throws `ERR_REQUIRE_ESM`. `5.10.0` is the newest `jose` 5 release.
- Keep the `@grpc/grpc-js` override. Transitive ranges still include `~1.9.0` and `^1.12.6`. The pin is now `1.14.7` (was `1.14.6`), the newest patch, which still contains the GHSA-m9gg-hp2v-232j and GHSA-f596-whhp-79r4 fixes.
- `glob` is overridden to `14.0.3`. GHSA-3g3m-2fjr-6pw4 covers `glob` `>=9.0.0 <=14.0.1` and has no backport. `firebase-admin` → `@google-cloud/firestore-api` → `google-gax` 5 → `rimraf` 5 still requests `glob` 10. `glob` 14 still exports `glob` and `globSync`, which is what `rimraf` 5 calls. Do not jump `google-gax` from 5 to 6 under `firestore-api`; that package requires `google-gax` `^5`.
- `minimatch` `11.0.4` is forced only for `eslint`, `@eslint/config-array`, and `@typescript-eslint/typescript-estree` (they use the `Minimatch` class or the named `minimatch` export). `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react` stay on `minimatch` 3.1.5. `minimatch` 11 removes the callable CommonJS export and `makeRe()`, and those plugins call both. GHSA-g3hv-75wg-m249 has no patched release below 11.0.1. `npm audit` therefore reports 5 moderate findings, all in that dev-only chain. Do not force `minimatch` 11 onto those plugins, and do not downgrade `eslint-config-next` to silence the audit.
- `postcss-selector-parser` stays overridden at `7.1.7`, which is also the latest release.
- `@types/node` stays on 24.x (`^24.19.2`) so the types match the Node 24 runtime. `26.x` is newer but describes a different runtime.
- Direct latest versions in this pass: Next 16.4.5, React 19.3.1, Firebase 13.2.0, firebase-admin 14.5.0, AI SDK `ai` 7.0.162 and `@ai-sdk/rsc` 3.0.162, Stripe 23.1.0, OpenAI SDK 7.50.0, Lucide 1.68.0, Zod 4.6.7, ESLint 10.14.0, Tailwind 4.3.4, Vitest 5.1.0. TypeScript stays on 6.0.3. Model ids were not changed.

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
