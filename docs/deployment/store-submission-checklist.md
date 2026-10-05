# Store Submission Checklist

## Product Positioning

- BarkLog is a dog care journal, pattern organizer, and caregiver workflow tool.
- BarkLog does not diagnose, prescribe, or replace veterinary care.
- Emergency, toxicity, and first-aid surfaces escalate to veterinarians, emergency clinics, or poison-control resources.
- Version 1.0.0 includes all implemented local features for free, with no ads or in-app purchases.
- BarkLog is account-free and local-only. Care records remain on the device. Uninstalling the app or deleting its data removes the journal unless the caregiver kept an export.

## iOS Store Review

| Area | Current Build Position | Evidence |
| ---- | ---------------------- | -------- |
| Notifications | Used for medication reminders after caregiver action | `app.json` includes Expo Notifications and no broad notification claim |
| Camera | Not configured in this build | no `NSCameraUsageDescription` |
| Photo selection | Caregiver can select a photo for a local caption | Expo image picker purpose string; no photo upload for local caption |
| Location | Not configured in this build | no `NSLocationWhenInUseUsageDescription` |
| Apple Health | Not configured in this build | no `NSHealthShareUsageDescription` or `NSHealthUpdateUsageDescription` |
| Purchases | None in v1.0.0 | No paywall or purchase flow |
| Health claims | Non-diagnostic wording and escalation required | safety and AI preflight checks |

## Android Play Review

| Area | Current Build Position | Evidence |
| ---- | ---------------------- | -------- |
| Notifications | Used for medication reminders after caregiver action | Android manifest declares `android.permission.POST_NOTIFICATIONS`; Play billing is blocked |
| Camera | Not configured in this build | no camera permission in `app.json` |
| Photo selection | Uses the system picker for a local caption | no broad media-library permission |
| Location | Not configured in this build | no coarse or fine location permission in `app.json` |
| Google Fit | Not configured in this build | no activity import permission or adapter |
| Purchases | None in v1.0.0 | No paywall or purchase flow |
| Health claims | Non-diagnostic wording and escalation required | safety and AI preflight checks |

## Metadata Checks

- App name: BarkLog.
- Subtitle or short description: care journal and organization language only.
- Long description: no diagnostic, treatment, or emergency response claims.
- Screenshots: Home, Timeline, Safety, Vet Prep, and Profile match the submitted build.
- Privacy policy: explains local-only care storage, no required account, free export, loss of unexported data when the app is deleted, and configured GameAnalytics analytics or optional crash reporting.
- Data safety labels match the shipped SDKs. BarkLog does not collect signup contact preferences.

## Submission Blockers

- Any metadata that says BarkLog diagnoses illness.
- Any permission listed in store metadata that is not configured in the build.
- Any configured native permission without a user-triggered product surface.
- Any paywall, purchase, trial expiry, or ad surface in the free v1.0.0 build.
- Any preview-build telemetry event containing raw notes, symptoms, prompts, answers, CSV content, PDF text, export content, phone numbers, chat handles, email addresses, or preferred names.
