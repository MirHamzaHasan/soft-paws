# Native device QA

Use a locally built Release artifact on each platform. Record device model, OS, build path, result, and any failure in [local preflight](../release/preflight-local.md). Android and iOS native behavior must be checked separately; Expo web is only a route preview.

## Install and identity

- [ ] Android APK installs and launches without Metro; Android ID is `com.draco.arts.apps.bark.log.dogs.journal`.
- [ ] Android signed AAB and merged release manifest contain no Play billing permission. Run `corepack pnpm release:check-native-capabilities` after the Android release build.
- [ ] iOS Release archive installs and launches with bundle ID `com.dracoarts.barklog`.
- [ ] App version/build numbers match `app.json`; no debug menu, ad, trial timer, paywall, or purchase control appears.

## Offline journal

- [ ] With airplane mode on, onboard a dog and save quick walk, meal, pee, and poop logs.
- [ ] Save detailed symptom, medication, mood, and behavior observations. Review them in Timeline and restart the app to confirm persistence.
- [ ] Check multi-dog switching, training sessions, trends, Memory Book, expenses, care calendar, and photo baselines without a purchase prompt.
- [ ] Export CSV and PDF, open each native share sheet, and confirm data is accurate.
- [ ] Open Safety Center, toxicity lookup, first aid, and the emergency card offline; urgent actions remain visible and appropriately escalate.
- [ ] Trigger reminder permission acceptance and denial. A denied prompt must not stop a medication record from saving.
- [ ] Download optional local AI models only from a user action, use a supported factual question and photo caption, then remove the models. Verify Home does not download or load a model.
- [ ] Use Settings to delete all local data; onboarding returns and old records do not reappear.

## Error and privacy paths

- [ ] Check small and large device layouts, screen reader labels, loading/empty states, retry copy, and user-safe errors on Home, Timeline, Safety, Profile, and Vet Prep.
- [ ] Confirm camera, location, microphone, health, and broad Android media-library permissions are absent. The user-triggered iOS photo picker may use its declared photo-library purpose string.
- [ ] With GameAnalytics configured, check each platform's Live Events for a launch, quick log, and export. Confirm no dog ID, note, symptom text, prompt, answer, or export content is sent.
- [ ] Disable network during logging and export; telemetry failure must not block care actions.

Record failures and retests before marking task047 complete.
