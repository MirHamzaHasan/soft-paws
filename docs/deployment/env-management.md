# Deployment: Environment Management

Use [the canonical BarkLog spec](../source-of-truth/barklog-product-engineering.md) and [Firebase and Atlas setup](./firebase-atlas.md). `env.example` is the current client env template. Native builds use [local build instructions](../release/local-build.md).

## Client-safe values

Copy `env.example` to an ignored `.env.local` and fill only the values needed by this build:

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_ATLAS_APP_ID=
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
EXPO_PUBLIC_GAMEANALYTICS_ANDROID_GAME_KEY=
EXPO_PUBLIC_GAMEANALYTICS_ANDROID_SECRET_KEY=
EXPO_PUBLIC_GAMEANALYTICS_IOS_GAME_KEY=
EXPO_PUBLIC_GAMEANALYTICS_IOS_SECRET_KEY=
EXPO_PUBLIC_MIXPANEL_TOKEN=
EXPO_PUBLIC_SENTRY_DSN=
```

Firebase's Web API key and project ID and BarkLog's Atlas application UUID are public identifiers embedded in the Expo bundle. Use a **BarkLog-specific** Atlas application; Family Chef's app ID is not interchangeable. GameAnalytics Collection API game keys and their paired secret keys are also client-visible integration credentials. Create a separate GameAnalytics game for Android and iOS; both fields for that platform are required to enable it. The app sends only fixed event names and a pseudonymous local-owner identifier, not dog IDs or care text. Leave RevenueCat and Mixpanel blank for the free v1.0.0 build unless Mixpanel is intentionally enabled. Keep AI provider API keys, Firebase ID/refresh tokens, Firebase service-account credentials, signing keys, and Atlas operator credentials out of Expo env files and source control.

The app reads Expo public values at bundle time. Restart Expo and rebuild after changing them. If Firebase or Atlas identifiers are absent or invalid, Atlas AI routes stay hidden; local logging and export remain available. Atlas AI also stays hidden in production until its server policy supports this free release and BarkLog health context checks pass.

## Web bridge

Deploy the Expo web export and `functions/` together as a Cloudflare Pages project. Set server-side `ATLAS_APP_ID` to the same BarkLog UUID embedded in the web build. Optionally set server-side `ATLAS_BASE_URL=https://api.atlas.dracoarts.com`. These are Pages environment bindings, not `EXPO_PUBLIC_*` variables. A real browser AI call requires the same-origin `/api/atlas-chat` Function; Expo's local web dev server does not provide it.

## Validation

Run `corepack pnpm release:check-local`, then build a signed native artifact for device QA. Verify offline journaling first. If GameAnalytics is configured, verify events on both platforms in their own dashboard. Firebase sign-in, Atlas context headers, and a real AI answer remain separate optional non-production checks until server policy is ready. See [task052](../../tasks/task052-firebase-atlas-ai.md).
