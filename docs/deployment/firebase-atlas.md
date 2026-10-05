# Firebase Auth and Atlas AI setup

BarkLog stores owner and care records in WatermelonDB on the device. Supported factual Ask AI questions run through an optional downloaded model on native devices. Firebase is optional sign-in for Atlas fallback. Only a user-triggered action that needs Atlas sends selected summarized context. There is no Firebase care-record sync. See [local-ai-models.md](../engineering/local-ai-models.md).

## Firebase

Use the intended Firebase project and enable Authentication → Email/Password. Register BarkLog's web origin and native identifiers as needed (Android `com.draco.arts.apps.bark.log.dogs.journal`, iOS `com.dracoarts.barklog`). Put the project's public Web API key and project ID in an ignored `.env.local`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_ATLAS_APP_ID=
```

The Atlas UUID must belong to **BarkLog**, even if it shares Family Chef's Firebase project. Do not reuse Family Chef's Atlas UUID. Restart Expo and rebuild after changing public env values. Firebase ID and refresh tokens stay in memory, so closing the app signs the user out. No Firebase SDK, native plugin, `google-services.json`, or plist is needed for this email/password REST flow.

## Atlas

In Atlas, register BarkLog as its own application for the selected Firebase project. Configure Android, iOS, and the intended web origin, user enrollment policy, quotas, and least-privilege gateway scope. App Check must remain optional until BarkLog has a working platform token provider. Configure and test these required context features, then enable enforcement:

- `barklog.ask-barklog-ai`
- `barklog.weekly-insight`
- `barklog.care-summary`
- `barklog.training-insight`
- `barklog.vet-report`

The app rejects generated output unless Atlas returns matching `X-Atlas-Context-Checked: true` and `X-Atlas-Context-Feature`. All calls include the Firebase ID token, `X-Atlas-App-Id`, runtime platform, and one UUID idempotency key retained across a single 401 refresh retry. There is no Atlas API key in the app.

Native iOS and Android call Atlas directly. Browser AI calls same-origin `/api/atlas-chat`; deploy the `functions/` folder as Cloudflare Pages Functions alongside the web export and set the server binding `ATLAS_APP_ID` to the same BarkLog UUID. Optionally set server-only `ATLAS_BASE_URL` to `https://api.atlas.dracoarts.com`. Expo's local web dev server does not serve the Pages Function, so use a protected Pages preview for a real browser AI flow.

## Release checks

Atlas-backed AI routes remain hidden in `EXPO_PUBLIC_APP_ENV=production` until paid entitlement linkage is complete. The native local Ask AI route can appear without Atlas identifiers; its current Premium gate remains until packaging is decided. Before enabling paid Atlas AI in production, link BarkLog's stable local RevenueCat owner ID with the Atlas Firebase user/IAP identity and verify the entitlement at the server boundary. Client-side Premium checks alone do not protect model spend. Test a signed-in account on a native device against the current Atlas deployment, including a real Ask AI fallback answer, a care summary, an expired token retry, Atlas denial, offline logging, and sign-out. Basic logging, timeline, Safety Center, and free export must still work without sign-in or network.
