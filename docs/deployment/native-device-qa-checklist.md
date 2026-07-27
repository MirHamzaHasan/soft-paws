# Native Device QA Checklist

## Purpose

Use this checklist to validate BarkLog native behavior on iOS and Android preview builds before release.

Task023 completed the local hardening baseline on 2026-04-26. Physical iOS and Android preview-build evidence must be captured during release preflight before store submission.

## Native Capabilities In This Build

Before spending EAS build time, run:

```sh
./gradlew :app:processReleaseMainManifest
corepack pnpm release:check-native-capabilities
```

| Capability | Configured Permission | Prompt Timing | Expected Behavior |
| ---------- | --------------------- | ------------- | ----------------- |
| Notifications | Android `POST_NOTIFICATIONS`; iOS notification entitlement through Expo Notifications | Only after the caregiver enables reminders or saves a scheduled medication | Accepted permissions schedule medication notifications; denied permissions save the medication and show a safe fallback |
| Purchases | Android billing permission through RevenueCat; iOS StoreKit through RevenueCat | Only from paywall or restore-purchases flows | Premium unlocks only after RevenueCat entitlement verification |
| Camera | None | No prompt in this build | Camera copy explains that capture and toxicity scanning are not connected yet |
| Location | None | No prompt in this build | Emergency clinic search should open maps or external search without requesting BarkLog location access |
| Apple Health | None | No prompt in this build | Activity import copy explains that Apple Health is not connected yet |
| Google Fit | None | No prompt in this build | Activity import copy explains that Google Fit is not connected yet |

## Device Matrix

Record one result per build and device. A failure in Home, Timeline, Safety, Paywall, Profile, or Vet Prep is a release blocker until fixed or explicitly deferred.

| Platform | Device Class | Build | Result | Notes |
| -------- | ------------ | ----- | ------ | ----- |
| iOS | small iPhone, for example iPhone SE | Preview build | Not run in local task023 execution | Required before release |
| iOS | current standard iPhone | Preview build | Not run in local task023 execution | Required before release |
| iOS | iPad portrait | Preview build | Not run in local task023 execution | Required before release |
| Android | small phone | Preview build | Not run in local task023 execution | Required before release |
| Android | large phone | Preview build | Not run in local task023 execution | Required before release |
| Web | Expo web export | Local export | Covered by task023 validation | Use route visibility only, not as native proof |

## Notification QA

| Case | Steps | Expected Result | Preview Result |
| ---- | ----- | --------------- | -------------- |
| Notifications accepted | Create or edit a medication with reminders enabled, accept the system prompt, save | Medication saves and scheduled notification IDs are stored locally | Not run in local task023 execution |
| Notifications denied | Create or edit a medication with reminders enabled, deny the system prompt, save | Medication still saves; UI reports notifications are disabled; no crash | Covered by unit test, preview result required |
| Scheduler unavailable | Run on web or an unsupported notification environment | Medication still saves; app reports scheduling is unavailable | Covered by unit test, preview result required |
| Partial scheduler failure | Schedule multiple reminders where one native call fails | Successful reminders remain scheduled; failed reminders are reported through observability | Covered by unit test, preview result required |

## Export QA

| Case | Steps | Expected Result | Preview Result |
| ---- | ----- | --------------- | -------------- |
| CSV export on iOS | Export profile or timeline CSV from Profile | A `.csv` file is written to cache and opened in the iOS share sheet | Covered by unit test, preview result required |
| CSV export on Android | Export profile or timeline CSV from Profile | A `.csv` file is written to cache and opened in the Android share sheet | Covered by unit test, preview result required |
| PDF export on iOS | Export Vet Visit Prep PDF | PDF is generated and opened in the iOS share sheet | Preview result required |
| PDF export on Android | Export Vet Visit Prep PDF | PDF is generated and opened in the Android share sheet | Preview result required |
| Web export | Export CSV and PDF from web preview | CSV downloads through the browser; PDF opens print dialog | Covered by Expo web export and existing export behavior |

## Layout QA

Check each screen at small and large sizes. Treat clipped primary actions, overlapping text, hidden emergency actions, or blocked free export as release blockers.

| Screen | Small Phone | Large Phone | Tablet | Notes |
| ------ | ----------- | ----------- | ------ | ----- |
| Home | Not run in local task023 execution | Not run in local task023 execution | Not run in local task023 execution | Required before release |
| Timeline | Not run in local task023 execution | Not run in local task023 execution | Not run in local task023 execution | Required before release |
| Safety | Not run in local task023 execution | Not run in local task023 execution | Not run in local task023 execution | Required before release |
| Paywall | Not run in local task023 execution | Not run in local task023 execution | Not run in local task023 execution | Required before release |
| Profile | Not run in local task023 execution | Not run in local task023 execution | Not run in local task023 execution | Required before release |
| Vet Prep | Not run in local task023 execution | Not run in local task023 execution | Not run in local task023 execution | Required before release |

## Release Blocker Rules

- Permission prompts must appear only from relevant caregiver-triggered surfaces.
- Camera, location, Apple Health, and Google Fit must not appear in native manifests or store copy until adapters are implemented.
- Medication reminder failures must not block saving the medication record.
- CSV export and basic PDF export must remain available to free users.
- Export telemetry must not include raw file content, notes, prompts, symptoms, or report text.
