# Release Preflight Checklist

## Release Decision

Do not mark BarkLog release-ready until every required gate below has a passing result, an owner, a date, and evidence such as a command log, build URL, dashboard screenshot, or linked QA note.

| Field | Value |
| ----- | ----- |
| App version | `1.0.0` |
| Build profile | `preview` first, then `production` |
| iOS build URL |  |
| Android build URL |  |
| Supabase project |  |
| RevenueCat project |  |
| Mixpanel project |  |
| Sentry project |  |
| Release owner |  |
| Decision | Blocked: local automated gates passed on 2026-05-04; preview-build, service-dashboard, native-device, and store-submission evidence still required |

## Required Automated Gates

| Gate | Command | Required Result | Status |
| ---- | ------- | --------------- | ------ |
| TypeScript | `corepack pnpm check-types` | exits `0` | Passed locally on 2026-05-04 |
| Lint | `corepack pnpm lint --quiet` | exits `0` | Passed locally on 2026-05-04 |
| Jest | `corepack pnpm test -- --runInBand` | exits `0` and coverage thresholds pass | Passed locally on 2026-05-04; 48 suites and 181 tests passed |
| Expo dependency check | `corepack pnpm exec expo install --check` | exits `0` | Passed locally on 2026-05-04 |
| Expo Doctor | `corepack pnpm dlx expo-doctor@latest` | all checks pass | Passed locally on 2026-05-04; 17 of 17 checks passed |
| Web export | `corepack pnpm exec expo export --platform web` | exits `0` and writes `dist` | Passed locally on 2026-05-04 |
| Client bundle secret scan | `rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" dist` | exits `1` with no matches | Passed locally on 2026-05-04 |
| Tracked client/example secret scan | `rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src` | exits `1` with no matches | Passed locally on 2026-05-04 |
| Android unwanted permission scan | `rg -n "READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|SYSTEM_ALERT_WINDOW" android/app/src/main/AndroidManifest.xml \| rg -v 'tools:node="remove"'` | exits `1` with no active permission declarations | Passed locally on 2026-05-04 |
| Android release merged manifest | `./gradlew :app:processReleaseMainManifest` and merged manifest permission scan | release manifest contains notification and billing only | Passed locally on 2026-05-04 |
| Local release gate bundle | `corepack pnpm release:check-local` | local EAS profile, environment boundary, native capability, release-script lint, and TypeScript gates pass | Passed locally on 2026-05-13 |
| Native release capabilities | `./gradlew :app:processReleaseMainManifest` then `corepack pnpm release:check-native-capabilities` | Android notification and billing are present; camera, location, media-library, microphone, storage, overlay, and health permissions stay absent from checked native files | Passed locally on 2026-05-13 |
| EAS project and profile lock | `corepack pnpm release:check-eas:linked` and `corepack pnpm dlx eas-cli@latest project:info --non-interactive` | real BarkLog EAS project UUID is configured; only `development` uses a development client; preview and production are not simulator builds | Pending Expo login and real EAS project UUID |
| Release environment boundary | `corepack pnpm release:check-env-boundary` | client files contain only `EXPO_PUBLIC_*` values; server-only AI and service-role keys stay scoped to Supabase Edge Function env handling | Pending task046 validation |
| Production readiness guard | `corepack pnpm release:check-production-readiness` | release preflight fields, gate statuses, store checklist, and rollback targets are complete before production builds | Pending preview-build and store-submission evidence |

## Local Automated Evidence

Captured on 2026-05-04 from this workspace:

- `corepack pnpm check-types` passed.
- `corepack pnpm lint --quiet` passed.
- `corepack pnpm test -- --runInBand` passed with 48 test suites and 181 tests.
- `corepack pnpm exec expo install --check` passed.
- `corepack pnpm dlx expo-doctor@latest` passed with 17 of 17 checks.
- `corepack pnpm exec expo export --platform web` passed and exported `dist`.
- `rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" dist` returned no matches.
- `rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src` returned no matches.
- `rg -n "READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|SYSTEM_ALERT_WINDOW" android/app/src/main/AndroidManifest.xml | rg -v 'tools:node="remove"'` returned no active unwanted permission declarations.
- `./gradlew :app:processReleaseMainManifest` passed and the release merged manifest contained only `android.permission.POST_NOTIFICATIONS` and `com.android.vending.BILLING` from the searched native permissions.

## Required Preview Build Gates

Follow [ios-mobile-build-and-test-instructions.md](ios-mobile-build-and-test-instructions.md) to create and test the iOS preview build on a real iPhone.

| Gate | Command Or Evidence | Required Result | Status |
| ---- | ------------------- | --------------- | ------ |
| iOS preview build | `eas build --profile preview --platform ios` | installable build URL recorded | Pending release environment |
| Android preview build | `eas build --profile preview --platform android` | installable build URL recorded | Pending release environment |
| Native device QA | [native-device-qa-checklist.md](native-device-qa-checklist.md) | all required rows pass on preview builds | Pending release environment |
| Auth lifecycle smoke | [auth-trial-data-lifecycle-smoke-test.md](auth-trial-data-lifecycle-smoke-test.md) | auth restore, onboarding, trial, and free rights pass | Pending release environment |
| Sync smoke | [watermelondb-supabase-sync-smoke-test.md](watermelondb-supabase-sync-smoke-test.md) | offline event sync and remote hydration pass | Pending release environment |
| RevenueCat sandbox | [revenuecat-sandbox-purchase-checklist.md](revenuecat-sandbox-purchase-checklist.md) | purchase, cancel, restore, and stale-cache cases pass | Pending release environment |

## Supabase Function Gates

| Function | Required Check | Status |
| -------- | -------------- | ------ |
| `barklog-sync` | deployed to staging or preview project and passes authenticated pull, push, retry, and conflict smoke test | Pending release environment |
| `ask-barklog-ai` | deployed with server-only text AI key and rejects free or expired users before model calls | Pending release environment |
| `generate-weekly-insight` | deployed with server-only text AI key and rejects free or expired users before model calls | Pending release environment |
| `generate-vet-report` | deployed with safe non-diagnostic copy and no raw content in telemetry | Pending release environment |
| `toxicity-lookup` | deployed and returns escalation copy for dangerous matches | Pending release environment |
| `accept-household-invite` | deployed if household invite QA is included | Pending release environment |
| `resolve-vet-share-link` | deployed if vet-share QA is included | Pending release environment |

## Observability Gates

| Surface | Required Event Or Error | Required Privacy Check | Status |
| ------- | ----------------------- | ---------------------- | ------ |
| Route navigation | Mixpanel `screen_viewed` | route name only; no caregiver note or symptom text | Pending release environment |
| Home quick log | Mixpanel `quick_log_saved` | event type and dog id only; no raw notes | Pending release environment |
| Signup contact preferences | Mixpanel `contact_preferences_saved` or `contact_preferences_skipped` | selected channel, selected goal, and consent booleans only; no preferred name, email, phone, or chat handle | Pending release environment |
| Export start and completion | Mixpanel `export_started` and `export_completed` | export type only; no CSV, PDF, or report content | Pending release environment |
| Controlled preview error | Sentry event from `release_preflight_controlled_error` or error-boundary test route | sanitized message and context only | Pending release environment |
| Telemetry failure mode | disable network or use invalid token temporarily in preview | logging, emergency, medication, and export flows still work | Pending release environment |

## Store Submission Gates

| Area | Required Result | Status |
| ---- | --------------- | ------ |
| App category and claims | BarkLog is described as a care journal and organization tool, not a veterinary authority | Pending |
| Health and safety copy | emergency and toxicity flows escalate to veterinarians or poison control | Pending |
| Permission copy | store metadata mentions only configured permissions in this build | Pending |
| Notification permission | described as medication reminders; no broad or spammy claims | Pending |
| Camera permission | omitted until camera-backed dog photos, receipt photos, or toxicity scanning ships | Pending |
| Location permission | omitted until BarkLog requests location for clinic lookup | Pending |
| Apple Health and Google Fit | omitted until explicit opt-in activity import ships | Pending |
| Privacy policy | mentions analytics, crash reporting, Supabase account data, optional contact preferences, purchases, and export rights | Pending |
| Free user rights | logging, timeline access, CSV export, and basic PDF export remain available | Pending |

## Rollback And Hotfix Gate

Before release, record the rollback target:

| Field | Value |
| ----- | ----- |
| Last known good app version |  |
| Last known good iOS build URL |  |
| Last known good Android build URL |  |
| Last known good Supabase function versions |  |
| RevenueCat rollback action | disable or hide affected offering without changing free rights |
| Server rollback action | redeploy last known good Supabase functions or disable risky feature flags |
| Store rollback action | pause phased rollout or cancel review before wider release |

Hotfix sequence:

1. Branch from the last known good release point.
2. Apply the minimal fix only.
3. Increment the app version or build number according to the store requirement.
4. Rerun every automated gate in this checklist.
5. Rebuild iOS and Android preview builds.
6. Verify the affected flow, observability event, and rollback target.
7. Promote to production builds only after the release owner signs off.
