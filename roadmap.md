# Roadmap

Punchlist for the Ragie API demo after the security fixes and the October 2026 maintenance pass. Nothing here is a commitment to ship it in this branch. Promotion of `dev` to `main` happens after QA, separately from this list.

## Needs a person (not this repo's CI)

- Deploy `firestore.rules` and `storage.rules` to the Firebase project. The repo copies are the source of truth (32 MB cap, MIME allowlist, client credit and role locks, payment writes denied). They are not deployed by CI or by app release.
- Optionally create a Stripe webhook endpoint for `payment_intent.succeeded` at `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET` in the host. Until then the route returns 503 and fulfillment depends on the success page, which is idempotent with the webhook path.
- QA the `dev` branch, then promote to `main`. Do not treat a green CI run as that promotion.
- Confirm whether the pinned model ids are still offered by each provider before changing them. The dashboard only calls `gpt-4o`. Suspected retirement of the other ids was not confirmed in code, so they were left as-is.
- Decide whether CI should move from Node 22 to Node 24. `firebase` 13 declares `engines` `node >= 24.12.0`. Install warns `EBADENGINE` on Node 22; lint, tests, and the production build still pass. Do not bump the workflow until that decision is explicit.

## Dependency follow-ups

- TypeScript 7.0.2 is published and is not feasible here. `typescript-eslint` (via `eslint-config-next` 16.4) refuses TypeScript 7.0. The app stays on TypeScript `^6.0.3`. Revisit when typescript-eslint documents TS 7 support, or run ESLint against a side-by-side TypeScript 6 install.
- Keep the `jwks-rsa` → `jose` `5.10.0` override while `firebase-admin` 14 / `jwks-rsa` 4 loads `jose` with `require()`. `jose` 6 is ESM-only and throws `ERR_REQUIRE_ESM`.
- `npm audit` is clean. `glob` 10.x under `firebase-admin` → `rimraf` is deprecated upstream and is not an audit finding. Do not force-upgrade it ahead of `firebase-admin`.
- Latest majors already in tree as of this pass: Next 16.4, React 19.3, Firebase 13, firebase-admin 14, AI SDK 7, Stripe 23, Zod 4, ESLint 10, Tailwind 4, Vitest 5. The maintenance bump itself was patch-level (`ai`, `@ai-sdk/rsc`, `@ai-sdk/anthropic`, `@types/node`).

## Known limits and bugs

- Rate limits live in a process-local `Map`. They do not coordinate across serverless instances, and the map is cleared when it grows past 10,000 keys.
- Profile UI is view-only. `updateProfile` exists on the Zustand store and is not called by a form.
- Document delete exists in Firestore and Storage rules for the owner, and the client deletes a Storage object only when the metadata write fails. There is no delete button.
- The generation server action accepts five model ids. The dashboard hardcodes `gpt-4o`, so the other providers are unused in the UI.
- When `STRIPE_WEBHOOK_SECRET` is unset, a buyer who never returns to the success page does not receive credits. That is the current degrade-safe behavior.
- `next/image` remote patterns allow only `lh3.googleusercontent.com` for profile photos. Other Google image hosts will fail the image optimizer.
- Vitest prints an ESM-as-CJS warning for `vitest.config.ts` because the config uses `__dirname`. Tests pass. Renaming the file to `.mts` needs a config rewrite, not a rename alone.
- `IMPROVEMENT_PLAN.md`, `CLAUDE.md`, and `AGENTS.md` still describe older package generations and some pre-security-fix flows. `spec.md` and `README.md` are current. The spec file used to be `SPEC.md`; Git tracks it as `spec.md`.
- Security rules are a demo prototype. Review them before sharing the Firebase project more widely.
- In-memory credit refunds depend on the provider call throwing. A streamed response that later fails mid-read is not a separate refund path.

## Sensible next product work

- Profile edit form that writes only the editable fields (`email`, `contactEmail`, `displayName`, `photoUrl`, `emailVerified`).
- User-facing document delete that removes the Storage object, the Firestore doc, and the Ragie document.
- A model picker wired to the existing server-action ids, after confirming each id is still valid.
- Shared rate limiting (Firestore, Redis, or the host's limiter) if the demo is exposed beyond a single instance.
- Webhook-first fulfillment once `STRIPE_WEBHOOK_SECRET` is set, with the success page remaining as the idempotent backup.
- Align `CLAUDE.md` and `AGENTS.md` with `spec.md` the next time those guides are edited.
