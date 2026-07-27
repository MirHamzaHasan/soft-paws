# Task 046: Release Environment And Supabase Gates

- Status: `in_progress`
- Priority: `P0`
- Phase: `Native Release Build Readiness`
- Depends on: `task045`

## Objective

Configure and verify the external release environments needed for signed preview and production builds while keeping BarkLog's server boundary on Supabase only.

## Backend Boundary

BarkLog does not need a VPS, Express server, Next.js API server, or any extra runtime backend for release.

- The mobile app receives only public client values through EAS `EXPO_PUBLIC_*` variables.
- Supabase is the runtime backend for auth, database, storage, and Edge Functions.
- Server-only AI and privileged Supabase keys live only in Supabase Edge Function secrets.
- AI providers are never called from the mobile client.

## External Inputs

- EAS project access from `task045`.
- Preview and production Supabase project refs and anon keys.
- Preview and production RevenueCat public SDK keys.
- Preview and production Mixpanel tokens.
- Preview and production Sentry DSNs.
- Supabase Edge Function secrets for preview and production.
- RevenueCat entitlement, products, and offering configured for iOS and Android.

## In Progress Notes

- Started the local release-environment boundary slice while `task045` remains blocked on Expo login or a real EAS project UUID.
- Added `corepack pnpm release:check-env-boundary` to verify client files and local Expo env files do not contain server-only AI keys or Supabase service-role markers.
- The checker also confirms required `EXPO_PUBLIC_*` client keys are documented and parsed, EAS profile `EXPO_PUBLIC_APP_ENV` values match their profile names, and required Supabase Edge Function directories exist locally.
- External EAS env, Supabase secret, RevenueCat, Mixpanel, and Sentry dashboard evidence still requires project access.

## Scope

- Configure EAS `preview` and `production` environments with these client-safe values:

```txt
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_REVENUECAT_IOS_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
EXPO_PUBLIC_MIXPANEL_TOKEN
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_APP_ENV
```

- Configure Supabase Edge Function secrets outside the repo:

```txt
BARKLOG_TEXT_AI_PROVIDER
BARKLOG_TEXT_AI_BASE_URL
BARKLOG_TEXT_AI_API_KEY
BARKLOG_TEXT_AI_MODEL
BARKLOG_TEXT_AI_THINKING
BARKLOG_VISION_AI_PROVIDER
BARKLOG_VISION_AI_BASE_URL
BARKLOG_VISION_AI_API_KEY
BARKLOG_VISION_AI_MODEL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

- Verify required Supabase functions are deployed for the target environment:
  - `barklog-sync`
  - `ask-barklog-ai`
  - `generate-weekly-insight`
  - `generate-care-summary`
  - `generate-vet-report`
  - `generate-training-insight`
  - `toxicity-lookup`
  - household and vet-share functions when those flows are included in QA
- Record project names, owners, dates, and evidence in `docs/deployment/release-preflight-checklist.md`.

## Out Of Scope

- No server-only secrets in `app.json`, `eas.json`, `.env.local`, `env.example`, `app/`, or `src/`.
- No production build submission.
- No new feature work.
- No permission expansion.

## Acceptance Criteria

- EAS `preview` environment contains all required client-safe values.
- EAS `production` environment contains all required client-safe values.
- `EXPO_PUBLIC_APP_ENV` resolves to `preview` for preview builds and `production` for production builds.
- Supabase preview and production projects contain server-only Edge Function secrets.
- Required Edge Functions are deployed to the matching Supabase project.
- RevenueCat has the `premium` entitlement and iOS/Android products wired to the current offering.
- Mixpanel and Sentry projects are identified for preview and production evidence.
- Release preflight checklist includes the relevant project names or links without exposing secrets.

## Validation

```sh
corepack pnpm dlx eas-cli@latest env:list --environment preview
corepack pnpm dlx eas-cli@latest env:list --environment production
corepack pnpm release:check-env-boundary
corepack pnpm exec expo export --platform web
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" dist
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src
```

Expected result:

- EAS env lists show only client-safe `EXPO_PUBLIC_*` app values.
- Secret scans return no client-side matches.
- Supabase dashboard or CLI evidence confirms server-only secrets outside the app bundle.
