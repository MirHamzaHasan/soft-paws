# BarkLog current feature status and roadmap

## Release status

BarkLog v1.0.0 is being prepared for founder-run local Android and iOS builds. Source checks and automated tests pass; signed production artifacts, physical-device QA, platform GameAnalytics evidence, and store submission remain to be recorded in [local preflight](../release/preflight-local.md).

The first release is free, with no ads, trial expiry, purchase flow, or paywall. The Android application ID is `com.draco.arts.apps.bark.log.dogs.journal`; iOS remains `com.dracoarts.barklog`.

## Included in v1.0.0

- Local dog profiles and unlimited local dog care logging, including quick logs, symptoms, medications, mood, behavior, and expanded event types.
- WatermelonDB timeline and event details, local care calendar and opt-in reminders, training content and progress, trends, Memory Book, expenses, and dated photo baselines.
- Free CSV and PDF export for the journal and vet prep. Export before uninstalling or deleting app data; there is no cloud care-record backup or sync.
- Offline Safety Center, toxicity lookup, first-aid basics, and emergency card, with escalation to veterinary help.
- Optional downloaded on-device AI models for supported factual journal answers, bounded conversation, and selected-photo scene captions. No model preloads on Home.
- Optional GameAnalytics integration using separate Android/iOS games. Mixpanel and Sentry remain optional build choices.

## Deferred or removed

- Photo compare and smart care automation are not implemented; their former Premium upsell cards are hidden.
- Household sharing, sitter mode, cloud care sync/backup, and vet share links were removed from the local-only release plan.
- Atlas-backed AI stays hidden in production until its server policy supports free access and BarkLog health context checks pass. Firebase sign-in is only for that optional fallback and never syncs care records.
- RevenueCat purchase flows, ads, and paid packaging are off for v1.0.0.

## Immediate next work

1. Founder configures optional GameAnalytics Android and iOS game keys, private signing materials, and the production public env file.
2. Founder makes local signed Android AAB/APK and iOS archive using [local-build.md](../release/local-build.md).
3. Run [native device QA](../deployment/native-device-qa-checklist.md), inspect the generated Android manifest, and verify configured analytics events.
4. Complete [store metadata and privacy checks](../deployment/store-submission-checklist.md) and record the release decision in [preflight-local.md](../release/preflight-local.md).

The numbered [task index](../../tasks/README.md) retains earlier work history. The [canonical spec](../source-of-truth/barklog-product-engineering.md) controls product decisions.
