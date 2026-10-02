# Store Submission Checklist

## Product Positioning

- BarkLog is a dog care journal, pattern organizer, and caregiver workflow tool.
- BarkLog does not diagnose, prescribe, or replace veterinary care.
- Emergency, toxicity, and first-aid surfaces escalate to veterinarians, emergency clinics, or poison-control resources.
- Free users keep basic logging, timeline access, CSV export, and basic PDF export.
- BarkLog is account-free and local-only. Care records remain on the device. Uninstalling the app or deleting its data removes the journal unless the caregiver kept an export.

## iOS Store Review

| Area | Current Build Position | Evidence |
| ---- | ---------------------- | -------- |
| Notifications | Used for medication reminders after caregiver action | `app.json` includes Expo Notifications and no broad notification claim |
| Camera | Not configured in this build | no `NSCameraUsageDescription` |
| Location | Not configured in this build | no `NSLocationWhenInUseUsageDescription` |
| Apple Health | Not configured in this build | no `NSHealthShareUsageDescription` or `NSHealthUpdateUsageDescription` |
| Purchases | RevenueCat verifies Premium entitlement before unlock | RevenueCat sandbox checklist |
| Health claims | Non-diagnostic wording and escalation required | safety and AI preflight checks |

## Android Play Review

| Area | Current Build Position | Evidence |
| ---- | ---------------------- | -------- |
| Notifications | Used for medication reminders after caregiver action | Android manifest declares `android.permission.POST_NOTIFICATIONS`; billing permission is present for RevenueCat purchases |
| Camera | Not configured in this build | no camera permission in `app.json` |
| Location | Not configured in this build | no coarse or fine location permission in `app.json` |
| Google Fit | Not configured in this build | no activity import permission or adapter |
| Purchases | RevenueCat verifies Premium entitlement before unlock | RevenueCat sandbox checklist |
| Health claims | Non-diagnostic wording and escalation required | safety and AI preflight checks |

## Metadata Checks

- App name: BarkLog.
- Subtitle or short description: care journal and organization language only.
- Long description: no diagnostic, treatment, or emergency response claims.
- Screenshots: Home, Timeline, Safety, Vet Prep, Profile, and Paywall match the submitted build.
- Privacy policy: explains local-only care storage, no account, free export, loss of unexported data when the app is deleted, RevenueCat purchases, Mixpanel analytics, and Sentry crash reporting.
- Data safety labels match the shipped SDKs. BarkLog does not collect signup contact preferences.

## Submission Blockers

- Any metadata that says BarkLog diagnoses illness.
- Any permission listed in store metadata that is not configured in the build.
- Any configured native permission without a user-triggered product surface.
- Any failed RevenueCat restore or entitlement gate.
- Any preview-build telemetry event containing raw notes, symptoms, prompts, answers, CSV content, PDF text, export content, phone numbers, chat handles, email addresses, or preferred names.
