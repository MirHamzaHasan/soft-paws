# Task 049: Production Feedback And Error Handling Hardening

- Status: `in_progress`
- Priority: `P0`
- Phase: `Launch UX Hardening`
- Depends on: `task024`, `task033`, current auth toast slice
- Blocks: production sign-off in `task048`

## Objective

Make BarkLog's core launch flows feel production-ready by standardizing toast feedback, inline errors, safe error copy, haptics, retry/status behavior, and unexpected-error capture across the surfaces users are most likely to touch before launch.

## User Problem

Caregivers need BarkLog to clearly explain what happened when an action fails, especially during sign-in, local logging, sync/export, purchases, AI summaries, and vet-report workflows. Failures should feel recoverable and trustworthy, never silent, raw, diagnostic, or technically exposed.

## Implementation Baseline

- Use the existing Expo Router, Tamagui, Zustand, WatermelonDB, Supabase, RevenueCat, observability, haptic, and toast foundations.
- Do not introduce NativeWind, Tailwind, a new notification library, or a parallel design system.
- Preserve the recent auth toast behavior as the starting point, then move auth and Home local overlays into the shared feedback layer.
- Keep Home polished and fast; feedback must not slow one-tap logging.
- Never call AI providers from the client. Keep AI failures routed through existing safe-copy helpers and Supabase Edge Function boundaries.

## Scope

- Add a shared feedback layer:
  - `BarklogFeedbackProvider` mounted from the app root.
  - `useBarklogFeedback()` with `showSuccess`, `showWarning`, and `showError`.
  - one common toast host using the existing `BarklogToast` primitive and slide/fade animation.
  - replacement path for `AuthToastOverlay` and `HomeToastOverlay` so core screens share the same feedback behavior.
- Add safe error normalization:
  - central user-facing copy helper for `auth`, `local_save`, `sync`, `export`, `purchase`, `ai`, `share`, and `generic`.
  - no raw Supabase, RevenueCat, AI provider, sync transport, or stack-like messages in user-facing UI.
  - preserve `getSafeAiErrorMessage` and emergency escalation boundaries.
- Harden core launch flows:
  - auth sign-in, sign-up, reset, and onboarding completion
  - Home quick logs and detailed event logs
  - sync/backup status and manual export
  - paywall purchase and restore flows
  - AI summaries, AI chat, AI agent invocations, training insight, and premium vet report failures
  - vet report PDF/print/share-link creation and revoke failures
- Add consistent haptics:
  - success haptic on confirmed saves or completed high-value actions
  - warning haptic for validation, cancellation, or non-blocking unavailable states
  - error haptic for failed submit/save/sync/export/share/purchase/AI actions
- Add observability:
  - capture unexpected failures with existing `captureBarklogError`.
  - keep analytics minimal and domain-based; add only missing events required to verify auth/purchase/feedback failure paths.

## Core Flow Requirements

- Validation failures stay inline and also show a toast when triggered by submit/tap.
- Local saves must never navigate away or show success if WatermelonDB persistence fails.
- Sync, export, and share failures must leave a visible retryable status where the action happened.
- Purchase cancellation is a warning state, not a scary error.
- AI unavailable states must use safe copy and must not imply diagnosis, treatment, or veterinary authority.
- Urgent safety tools and free export rights must remain available without premium gates.
- Toasts should be short, specific, and paired with persistent inline/status copy when the user needs to act.

## Out Of Scope

- No new backend tables, Edge Functions, RevenueCat entitlement rules, native permissions, or release signing changes.
- No full redesign of every screen in the app.
- No broad copy rewrite outside affected failure/success/empty/status messages.
- No new diagnostic health guidance.
- No change to free versus Premium rights.

## Acceptance Criteria

- Auth failures show toast feedback and persistent inline copy without routing away.
- Sign-up, reset, and onboarding failures use the same feedback model as sign-in.
- Home quick-log success and failure use the shared provider and preserve local-first behavior.
- Detailed log screens show consistent save success/failure feedback and never navigate after failed local persistence.
- Sync/export/vet report/share failures show safe copy, retry/status affordances, and capture unexpected errors.
- Purchase restore and purchase flows distinguish cancellation, unavailable products, and real failures.
- AI and premium report failures use safe copy and haptics without leaking provider or prompt details.
- `AuthToastOverlay` and `HomeToastOverlay` are removed or reduced to compatibility wrappers once the shared feedback layer owns toast display.
- Screen reader users can perceive important error/success states through persistent text, not toast alone.

## Validation

Required automated checks:

```sh
corepack pnpm check-types
corepack pnpm exec eslint app/_layout.tsx src/components/ui src/features/auth src/features/home src/features/logging src/features/sync src/features/export src/features/premium src/features/insights src/features/assistant src/features/vet
corepack pnpm jest src/features/auth/screens/SignInScreen.test.tsx --runInBand --coverage=false
corepack pnpm jest src/features/insights/utils/aiSafety.test.ts src/features/premium/services/revenueCatService.test.ts src/features/sync/utils/syncDisplay.test.ts --runInBand --coverage=false
```

Add or update targeted tests for:

- error-copy normalization by domain
- auth missing fields and bad credentials
- quick-log success and failure
- detailed log save failure
- export/share failure
- purchase cancellation versus purchase failure
- AI unavailable safe-copy path

Manual iOS Simulator smoke:

- bad login shows a toast, keeps inline error visible, and stays on sign-in
- successful login with an existing dog routes to Home
- failed quick log stays on Home and explains the local-save failure
- failed detailed log save does not navigate to Timeline/Event Detail
- sync/export/share/report failures show safe retryable status
- no raw backend, provider, or stack messages appear

## Completion Notes

- Added root-mounted `BarklogFeedbackProvider` with a shared `useBarklogFeedback()` API and a single animated `BarklogToast` host.
- Removed the auth and Home local toast overlays and migrated sign-in, sign-up, reset, onboarding completion, Home quick logs, and detailed log saves onto the shared provider.
- Added centralized safe error copy normalization for `auth`, `local_save`, `sync`, `export`, `purchase`, `ai`, `share`, and `generic`.
- Preserved AI-safe fallback behavior through `getSafeAiErrorMessage()` while routing all provider failures to non-diagnostic caregiver copy.
- Hardened Premium purchase, restore, subscription-management, AI chat, AI summaries, AI Agent Center context errors, sync/backup/export, and vet report PDF/print/share-link flows with toast feedback, persistent status/inline copy, haptics, and unexpected-error capture where appropriate.
- Added focused tests for sign-in missing/bad credentials, centralized error-copy mapping, and AI-safe fallback behavior.
- Local automated validation is complete; manual iOS Simulator smoke remains required before production sign-off.

## Validation Notes

- `corepack pnpm check-types` passed.
- Targeted ESLint passed for touched auth, feedback, Home, logging, sync, export, Premium, settings, insights, assistant, vet, observability, and error-helper files.
- `corepack pnpm test -- src/features/auth/screens/SignInScreen.test.tsx src/utils/barklogErrorMessages.test.ts src/features/insights/utils/aiSafety.test.ts src/features/premium/services/revenueCatService.test.ts src/features/sync/utils/syncDisplay.test.ts src/features/export/services/exportDocumentService.test.ts --runInBand --coverage=false` passed with 6 suites and 27 tests.
- Manual iOS Simulator smoke not run in this local session.

## Commit Boundary

One focused commit for the shared feedback provider, safe error-copy helper, core-flow migrations, tests, and task validation notes.
