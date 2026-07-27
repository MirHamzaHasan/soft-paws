# Deployment: Environment Management

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Client-Safe Variables

These may ship in the Expo bundle:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=replace-with-supabase-anon-public-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=replace-with-revenuecat-ios-public-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=replace-with-revenuecat-android-public-key
EXPO_PUBLIC_MIXPANEL_TOKEN=replace-with-mixpanel-project-token
EXPO_PUBLIC_SENTRY_DSN=https://public@sentry.example.invalid/0
EXPO_PUBLIC_APP_ENV=development
```

Use plain-text or sensitive EAS visibility for client-side variables. Do not use secret visibility for values that must be embedded in the app bundle; embedded client values are public by definition.

## Server-Only Variables

These must never ship in the client, appear in `env.example`, or be placed under `EXPO_PUBLIC_*`:

- DeepSeek text AI API secret used by Supabase Edge Functions
- OpenAI vision AI API secret reserved for future Supabase Edge Function image understanding
- Supabase privileged admin key used by Supabase Edge Functions

The server secret names currently read by `supabase/functions/_shared/env.ts` are:

```env
BARKLOG_TEXT_AI_PROVIDER=deepseek
BARKLOG_TEXT_AI_BASE_URL=https://api.deepseek.com
BARKLOG_TEXT_AI_API_KEY=replace-with-deepseek-server-key
BARKLOG_TEXT_AI_MODEL=deepseek-v4-flash
BARKLOG_TEXT_AI_THINKING=disabled
BARKLOG_VISION_AI_PROVIDER=openai
BARKLOG_VISION_AI_BASE_URL=https://api.openai.com/v1
BARKLOG_VISION_AI_API_KEY=replace-with-openai-server-key
BARKLOG_VISION_AI_MODEL=gpt-5.4-nano
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-supabase-service-role-key
```

Set them through Supabase project secret management for each remote environment.
Legacy `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` values are unsupported by default.

## Environment Tiers

### Local Development

- Copy `env.example` to `.env.local`.
- Fill only client-safe `EXPO_PUBLIC_*` values in `.env.local`.
- Keep `.env.local` untracked. It is ignored by `.gitignore`.
- For local Supabase Edge Function work, place server-only values in an ignored file such as `.env.supabase.local` and pass it to the Supabase CLI. Do not put server-only values in `.env.local`, because Expo loads that file for app exports.

### Preview

- `eas.json` sets `EXPO_PUBLIC_APP_ENV=preview` for preview builds.
- `eas.json` maps the `preview` build profile to the EAS `preview` environment.
- Configure preview Supabase, RevenueCat, Mixpanel, and Sentry values in the EAS `preview` environment.
- Configure preview text AI, future vision AI, and Supabase privileged admin secrets in the preview Supabase project before testing Edge Functions.
- Use separate preview projects/keys from production.

### Production

- `eas.json` sets `EXPO_PUBLIC_APP_ENV=production` for production builds.
- `eas.json` maps the `production` build profile to the EAS `production` environment.
- Configure production client-safe values in the production EAS environment.
- Configure production server-only secrets in the production Supabase project only.
- Rotate production secrets outside the repository and never commit generated key material.

## Config Review

- `app.json` must not define server secrets or static environment values.
- `eas.json` may define `EXPO_PUBLIC_APP_ENV` and the selected EAS environment; other client-safe values should come from that selected EAS environment.
- Supabase Edge Functions may read server-only secrets with `Deno.env`, but app and `src/` code must not.

## Rules

- Store server-only secrets in Supabase Edge Function or deployment secret management.
- Never place server-only secrets in `EXPO_PUBLIC_*` variables.
- Keep staging and production keys separate.
- Validate required variables during deployment and startup.
- Before release, verify `corepack pnpm exec expo export --platform web` completes without adding server-only values to the bundle.
