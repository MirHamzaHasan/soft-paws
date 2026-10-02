# Task 052: Firebase sign-in for Atlas AI

- Status: `in_progress` (code and mocked validation pass; BarkLog Atlas registration and live device flow pending)
- Priority: `P0`
- Depends on: `task051` local care journal

## Decision

Firebase handles email/password sign-in for AI only. Atlas routes AI requests. WatermelonDB remains the sole owner, dog, and care-record store; there is no Firebase sync. The local RevenueCat identity remains the local owner ID. Basic logging, timeline, safety tools, and free export work without Firebase or Atlas.

## Implemented slice

- `/ai-sign-in` supports sign-in, account creation, reset email, and sign-out. Firebase ID and refresh tokens stay in process memory. App restart requires another sign-in.
- Premium Ask AI, weekly insights, care summaries, training insight, and vet report adapters call Atlas `/v1/chat` with the Firebase ID token and BarkLog Atlas app ID. Native uses Atlas directly; web uses same-origin `/api/atlas-chat` through a Cloudflare Pages Function. A 401 triggers one forced token refresh and reuses the original idempotency key.
- Every request requires Atlas's enabled/tested BarkLog context policy. If Atlas does not return matching context-check headers, generated text is rejected. AI responses are bounded and checked for diagnostic claims; urgent chat questions are handled locally with vet escalation.
- AI uses only selected, user-triggered summarized context. The journal remains local; the selected summary is transmitted to Atlas for that action.
- `env.example` documents public Firebase and Atlas identifiers. No provider key or Firebase session is stored in Expo env, WatermelonDB, or MMKV.

## Required external setup and acceptance

1. Use a Firebase project with Email/Password Auth enabled. Add its public Web API key and project ID to ignored local Expo env files.
2. Register a **BarkLog-specific** application in Atlas for that Firebase project. Configure allowed platforms/origins, enrollment policy, quotas, and the five `barklog.*` context features used by the app. Test and enable the context policy. Set its public UUID as `EXPO_PUBLIC_ATLAS_APP_ID`. Do not reuse Family Chef's Atlas app ID.
3. Confirm whether Atlas IAP enforcement should protect Premium AI usage. BarkLog currently uses a local owner UUID for RevenueCat while Firebase provides a separate UID; a reviewed account-to-purchase linking design is required before paid AI is sold in production.
4. For web, deploy the `functions/` directory with the Expo web export on Cloudflare Pages and set server binding `ATLAS_APP_ID` to BarkLog's UUID. See [firebase-atlas.md](../docs/deployment/firebase-atlas.md).
5. On a signed native build, sign in and generate a real Ask AI answer and one care summary through the current Atlas deployment. Verify support request IDs, context-check headers, no diagnostic output, and offline logging with AI unavailable. Repeat on a protected Pages web preview.
6. Re-run full tests, typecheck, local release gates, Android/iOS build and device QA. `task051` device smoke remains open.

## Local validation

- Public Firebase API key and project ID were copied from the Family Chef development env into BarkLog's ignored `.env.local` without exposing values in source or output. BarkLog's Atlas UUID is intentionally absent until its own application is registered.
- `corepack pnpm check-types` and `corepack pnpm release:check-local`: passed.
- Full Jest: 40 suites and 127 tests passed. Firebase refresh, Atlas 401 retry/idempotency, same-origin web bridge, fail-closed context, optional env parsing, Premium and urgent question gates covered.
- Expo web and Android JS exports: passed. These verify bundles, not signed-in live requests or device installation.
- Live Firebase/Atlas call: pending BarkLog application ID and policy.
- 2026-10-03 local recheck: 41 Jest suites and 129 tests, typecheck, local release gates, targeted AI lint, and production Android JS export passed. The AI sign-in route now redirects when AI is disabled, and an unset build environment fails closed alongside production. Live Atlas validation still needs BarkLog's app UUID and policy.
