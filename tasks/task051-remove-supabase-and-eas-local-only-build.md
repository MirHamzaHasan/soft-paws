# Task 051: Remove Supabase And EAS For A Local-Only Build

- Status: `in_progress` (Android emulator offline smoke and signed local QA build passed; physical Android and iOS device QA pending)
- AI and account-free acceptance items in this task were superseded by `task052`: Firebase sign-in is optional for Atlas AI only. The WatermelonDB journal and local build requirements remain.
- Priority: `P0`
- Phase: `Architecture Rebaseline`
- Depends on: none
- Blocks: `task046` through `task049` (they must be re-scoped after this lands)
- Supersedes: `task045` (EAS project linking) and the Supabase dashboard evidence in `task046`

## Objective

Make BarkLog a fully local, account-free app that builds on a developer machine without Supabase or EAS. All care data lives in WatermelonDB on the device. Native builds come from `expo prebuild` plus the local Android Gradle / Xcode toolchains.

Done means: the app installs from a local build, onboards a dog, logs care events, shows the timeline and exports a report with no network backend. There are also zero `@supabase/*` imports and no `eas.json`.

## Why

- The owner has decided not to run a Supabase backend or use EAS.
- BarkLog is not released yet, so there are no production users or remote data to migrate.
- The current release gates (`task045` to `task048`) are blocked on EAS linking and Supabase dashboard evidence that will never exist under this decision.

## Current Supabase Footprint (audited 2026-10-02)

| Area | Where | What it does today |
|---|---|---|
| Client | `src/api/supabaseClient.ts`, `src/services/supabaseAuthStorage*.ts`, `src/types/supabase.ts` | Creates the Supabase client and persists the auth session |
| Auth and account | `src/api/auth.ts`, `src/stores/useAuthSessionStore.ts`, `src/features/auth/hooks/useAuthSessionBootstrap.ts`, `app/(auth)/*` | Email/password sign-up, sign-in, password reset, session bootstrap |
| User and dog records | `src/api/auth.ts` (`users`, `dogs` queries) | Bootstrap reads users and dogs from **Supabase**, even though WatermelonDB already has `users` and `dogs` tables |
| Onboarding | `src/api/auth.ts` `completeOnboardingForCurrentUser`, `createDogForCurrentUser` | Writes the first dog to Supabase |
| Contact preferences | `src/api/contactPreferences.ts`, `app/(onboarding)/contact-preferences.tsx` | Stores contact PII in Supabase only (`task050`) |
| Training content | `src/api/training.ts`, `supabase/migrations/*028_seed_initial_training_programs.sql` | Training programs and steps are fetched from Supabase |
| Sync and backup | `src/db/sync/*`, `app/sync-backup.tsx` | WatermelonDB to Supabase sync (`task020`, `task032`, `task033`) |
| Household and sitter | `src/features/household/*`, `app/household*.tsx`, `app/household/invite/[token].tsx` | Shared dogs, invites, roles (`task039`) |
| Vet share links | `src/features/vet/api/vetShareLinkClient.ts`, `app/vet-share/[token].tsx` | Hashed public share links (`task038`) |
| AI | `src/features/assistant/api/aiAgentClient.ts`, `src/features/insights/api/insightsAiClient.ts` | Calls Edge Functions for Ask AI, insights, care summaries, vet reports, training insights |
| RevenueCat | `src/features/premium/services/revenueCatService.ts` | Uses the Supabase user ID as the RevenueCat `appUserID` |
| Server | `supabase/` (config, 9 Edge Functions, 13 migrations, seed) | Backend code |
| Env and scripts | `env.example`, `src/utils/clientEnv.ts`, `scripts/check-release-env-boundary.js` | Requires `EXPO_PUBLIC_SUPABASE_*` |

About 40 source and test files in `src/` reference Supabase.

## Current EAS Footprint

- `eas.json` (development / preview / production profiles, `submit`)
- `scripts/check-eas-release-config.js`, plus the `release:check-eas` and `release:check-eas:linked` package scripts
- `scripts/run-local-release-gates.js` (runs the EAS check)
- EAS references in `src/features/observability/services/analyticsService.ts`, `crashReportingService.ts` and `observabilityReleasePreflight.test.ts`
- `EXPO_PUBLIC_APP_ENV` is injected by the EAS profiles and must come from local env files instead
- `expo-dev-client` is present; it still works with local builds and can stay

## Product Decisions (defaults — confirm before Phase 3)

These change what users see. Each has a recommended default.

1. **Accounts: removed.** There is no sign-up or sign-in. On first launch the app creates one local owner record in WatermelonDB and goes straight to dog-profile onboarding.
2. **Cloud sync, backup and restore: removed.** Data lives only on the device. Manual export (PDF/CSV) stays free and is the only backup path. Settings must clearly say "Data is stored only on this device."
3. **Household sharing and sitter mode: removed.** These need a shared server and can't work local-only.
4. **Vet share links: removed.** The vet report stays available as a local PDF export and share-sheet file.
5. **Contact preferences (`task050`): removed.** There is nowhere to store the data, and no PII is collected.
6. **AI features: hidden behind a disabled feature flag, not deleted.** The guardrail "never call AI providers from the client" still applies, so with no backend, AI can't run. This covers the Ask AI, AI Agent Center, generated insights, care summaries, vet report AI summaries and training personalization entry points. The deterministic, non-AI summaries stay.
7. **Training programs: bundled locally.** Move the seed content from the SQL migration into a typed local data module that ships with the app.
8. **RevenueCat: kept, with an anonymous app user ID.** RevenueCat works without a backend and with local builds. Use a stable, locally generated anonymous ID stored on the device. Premium keeps gating training sessions and progress, photo compare and smart care-calendar automation. Premium no longer includes sync, backup, sharing or AI. Re-check the paywall copy so it doesn't sell removed features.
9. **Observability: Sentry and Mixpanel kept as-is** (they don't depend on Supabase or EAS). Only the EAS-specific release metadata is removed.

## Phases

Work in this order. The app must still compile, pass tests and launch at the end of every phase.

### Phase 1 — Make WatermelonDB the only source for the user and dogs

- Add a local owner repository (`src/db/users/` or similar) that creates and reads the single local user record. The ID comes from `expo-crypto` `randomUUID()` and is created once.
- Change dog create, read and update to go through WatermelonDB (`DogModel`) instead of `src/api/auth.ts`.
- Change `useAuthSessionBootstrap` into a local profile bootstrap: load the local user and dogs, then work out onboarding status with the existing `deriveOnboardingStatus`.
- Rename the store shape away from the Supabase `Session`. For example, `useAuthSessionStore` becomes `useLocalProfileStore` with `profileStatus: 'loading' | 'needs_onboarding' | 'ready'`. Remove the `@supabase/supabase-js` `Session` type.
- Keep `user_id` columns as they are and fill them with the local owner ID. No schema change is needed.

### Phase 2 — Remove auth and account routes

- Delete `app/(auth)/*` and `app/(onboarding)/contact-preferences.tsx`.
- Update `src/features/auth/utils/authRouting.ts` (or its replacement) so first launch goes to `/(onboarding)/dog-profile` and finished onboarding goes to `/(tabs)`.
- Remove sign-out from Settings and Profile. Replace it with "Delete all data on this device", which needs a confirmation and wipes the WatermelonDB database.
- Delete `src/api/auth.ts`, `src/api/contactPreferences.ts` and their tests.

### Phase 3 — Remove cloud-only features

- Delete sync: `src/db/sync/*` and `app/sync-backup.tsx`. Drop any `synced` flag logic that is only used by sync. Keep the column if removing it would need a WatermelonDB migration that isn't worth it.
- Delete household: `src/features/household/*`, `app/household.tsx`, `app/household-overview.tsx` and `app/household/invite/[token].tsx`.
- Delete vet share links: `src/features/vet/api/vetShareLinkClient.ts` and `app/vet-share/[token].tsx`. Keep local vet report export.
- Remove the Home, Profile and Settings entry points, premium catalog items and analytics events for the removed features.
- Update `src/features/premium/data/premiumCatalog.ts` and the paywall copy.

### Phase 4 — AI behind a disabled flag

- Add an `aiFeatures` flag to `feature-flags.json` and set it to `false`.
- Hide every AI entry point when the flag is off. Routes that are opened directly (`/ask-ai`, `/ask-barklog-ai`, `/ai-agents`) redirect to Home.
- Replace the Supabase function calls in `aiAgentClient.ts` and `insightsAiClient.ts` with a clean "AI unavailable" result. Never call a provider from the client.
- Keep the deterministic insight and summary utilities working.

### Phase 5 — Bundle training content locally

- Port the programs and steps from `supabase/migrations/202604270028_seed_initial_training_programs.sql` into `src/features/training/data/trainingPrograms.ts`.
- Move the useful checks from `supabase/migrations/trainingProgramSeeds.test.ts` next to that module.
- Change `src/api/training.ts` to read from the local module. Keep the same TanStack Query option signatures so the screens don't change.
- Check that the free weekly rotation (`freeTrainingRotation.ts`) still selects programs the same way.

### Phase 6 — RevenueCat anonymous identity

- Change `revenueCatService.ts` to take the local owner ID (or use RevenueCat anonymous IDs) instead of a Supabase user ID.
- Re-run `revenueCatService.test.ts` and update it.

### Phase 7 — Delete Supabase completely

- Delete `src/api/supabaseClient.ts`, `src/services/supabaseAuthStorage*.ts`, `src/types/supabase.ts` and the `supabase/` folder.
- Remove `@supabase/supabase-js` from `package.json` and run `pnpm install`.
- Remove `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `env.example` and `src/utils/clientEnv.ts`.
- Update `src/utils/barklogErrorMessages.ts` to remove Supabase-specific error mapping.
- Update `scripts/check-release-env-boundary.js` so it no longer expects Supabase variables, but still blocks any server or AI secrets from the client bundle.

### Phase 8 — Remove EAS and add local build scripts

- Delete `eas.json`, `scripts/check-eas-release-config.js`, and the `release:check-eas` and `release:check-eas:linked` scripts.
- Remove the EAS step from `scripts/run-local-release-gates.js`. While editing it, add `shell: process.platform === 'win32'` to `spawnSync` so the gates run on Windows.
- Make `scripts/check-native-release-capabilities.js` say "run prebuild first" instead of crashing when `android/` or `ios/` is missing.
- Remove the EAS metadata from `analyticsService.ts`, `crashReportingService.ts` and their tests.
- Add local build scripts:
  - `"prebuild": "expo prebuild --clean"`
  - `"build:android:debug": "expo run:android"`
  - `"build:android:release": "expo prebuild -p android && cd android && gradlew assembleRelease"` (or `bundleRelease` for an AAB)
  - `"build:ios:release"` documented for macOS only (`expo run:ios --configuration Release`)
- Set `EXPO_PUBLIC_APP_ENV` from local `.env.development` and `.env.production` files instead of EAS profiles.
- Document Android release signing with a local keystore, kept out of git. `android/` is regenerated by prebuild, so the signing config must be applied by a config plugin or a documented post-prebuild step.

### Phase 9 — Documentation and guardrails

- `AGENTS.md`: replace the `Supabase` stack requirement with "local-only, WatermelonDB". Replace "Use Supabase Edge Functions only" with "AI is disabled until a server boundary exists; never call AI providers from the client." Remove the Supabase and EAS backlog notes.
- `docs/source-of-truth/barklog-product-engineering.md` and `docs/agentic/product-truth.md`: record the local-only decision.
- Privacy and store copy: no account, data stays on the device, and deleting the app deletes the data.
- `tasks/README.md`: mark `task045` as superseded and re-scope `task046` to `task048` to local signed builds and manual store upload.
- Add a short `docs/release/local-build.md` covering prebuild, Android signing, building an AAB and APK, iOS on a Mac, and version bumps (`appVersionSource` used to be EAS-managed).

## Acceptance Criteria

- `grep -rn "supabase" src app scripts package.json env.example` returns nothing.
- There is no `supabase/` folder and no `eas.json`.
- A fresh install (with app data cleared) goes straight to dog-profile onboarding. You can add a dog, log at least a walk, a meal, a symptom and a medication, see them on the timeline, and export a PDF, all in airplane mode.
- Restarting the app keeps all the data, and onboarding doesn't show again.
- "Delete all data on this device" wipes everything and returns to onboarding.
- Safety Center, toxicity lookup, first aid and the emergency card still work offline and for free.
- No AI entry point is visible, and opening an AI route directly redirects safely.
- Training hub shows the bundled programs. The free weekly program rotates, and Premium gates sessions and progress.
- The paywall and premium catalog don't mention sync, backup, sharing or AI.
- `corepack pnpm check-types` passes.
- `corepack pnpm test` passes, with tests for removed features deleted rather than skipped.
- `corepack pnpm release:check-local` passes on Windows.
- `corepack pnpm build:android:release` produces a signed release APK or AAB on a local machine, and it installs and launches on a device.

## Validation on 2026-10-02

- `corepack pnpm check-types`, `corepack pnpm test` (36 suites, 119 tests), and `corepack pnpm release:check-local` passed on Windows.
- `corepack pnpm build:android:release` produced `android/app/build/outputs/apk/release/app-release.apk` and `android/app/build/outputs/bundle/release/app-release.aab` using an ignored disposable test keystore. APK v2 and AAB JAR signatures verified. This is build validation, not a production signing identity.
- `corepack pnpm release:check-native-capabilities` passed against the merged Android release manifest.
- On 2026-10-03, an API 36 Android emulator ran a fresh signed release APK with Wi-Fi and cellular data disabled. Dog onboarding, walk/meal/symptom/medication logs, Timeline, restart persistence, free PDF generation through Android Share, Safety Center, offline chocolate lookup, first aid CPR, emergency card, and Delete All Data returning to onboarding passed. The first APK exposed a Zustand v5 selector loop on dog onboarding; that was fixed in all three onboarding screens before the passing rebuild. Home's secondary log actions were restored as a compact horizontal row so Symptom is reachable without hiding the daily summary.
- Final local recheck on 2026-10-03: 41 Jest suites and 129 tests, typecheck, targeted lint, local release gates, signed APK v2 verification, and AAB JAR verification passed. QA artifacts use the standard Android debug key and are not production upload artifacts. Physical Android installation and iOS build/device smoke still need device and Mac access.

## Risks

- **Data loss expectations.** With no backup, losing the phone loses the data. Settings and onboarding must say so plainly and point to manual export.
- **Paywall value drops.** Premium loses sync, backup, sharing and AI. Review whether the remaining Premium set is worth paying for before shipping. This belongs in a separate monetization task.
- **WatermelonDB schema.** Don't drop columns unless needed. Any schema change needs a WatermelonDB migration in `src/db/migrations.ts`.
- **iOS builds need macOS.** Local iOS release builds and the `task049` iOS Simulator check can't run on Windows.

## Out Of Scope

- Any replacement backend (Firebase, custom server, etc.).
- Re-enabling AI through a new server boundary.
- Fixing the CRLF / Prettier lint noise on Windows (do that in its own small change).
