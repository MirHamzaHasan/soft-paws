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
EXPO_PUBLIC_MIXPANEL_TOKEN=
EXPO_PUBLIC_SENTRY_DSN=
```

Firebase's Web API key and project ID and BarkLog's Atlas application UUID are public identifiers embedded in the Expo bundle. Use a **BarkLog-specific** Atlas application; Family Chef's app ID is not interchangeable. Keep provider API keys, Firebase ID/refresh tokens, Firebase service-account credentials, signing keys, and Atlas operator credentials out of Expo env files and source control.

The app reads Expo public values at bundle time. Restart Expo and rebuild after changing them. If Firebase or Atlas identifiers are absent or invalid, AI routes stay hidden; local logging and export remain available. AI routes also stay hidden in production until Atlas enforces the RevenueCat entitlement for the Firebase user.

## Web bridge

Deploy the Expo web export and `functions/` together as a Cloudflare Pages project. Set server-side `ATLAS_APP_ID` to the same BarkLog UUID embedded in the web build. Optionally set server-side `ATLAS_BASE_URL=https://api.atlas.dracoarts.com`. These are Pages environment bindings, not `EXPO_PUBLIC_*` variables. A real browser AI call requires the same-origin `/api/atlas-chat` Function; Expo's local web dev server does not provide it.

## Validation

Run `corepack pnpm release:check-local`, then build a signed native artifact for device QA. Verify Firebase sign-in, Atlas context headers, one real AI answer, and offline journaling independently. See [task052](../../tasks/task052-firebase-atlas-ai.md) for the remaining production checks.
