# Observability Preview Checklist

## Setup

Use preview client-safe environment values:

```env
EXPO_PUBLIC_APP_ENV=preview
EXPO_PUBLIC_MIXPANEL_TOKEN=replace-with-preview-mixpanel-token
EXPO_PUBLIC_SENTRY_DSN=https://public@sentry.example.invalid/0
```

Server-only AI and Supabase privileged keys must remain in Supabase function secrets only.

## Mixpanel Verification

| Flow | Expected Event | Required Properties | Forbidden Properties |
| ---- | -------------- | ------------------- | -------------------- |
| Open app and navigate between tabs | `screen_viewed` | `screen_name`, `route_group`, `platform`, `app_version`, `build_channel` | notes, symptoms, prompts, answers |
| Save a Home quick log | `quick_log_saved` | dog id, event type, sync status where available | free-form note text |
| Trigger a failed local quick log in a controlled test state | `quick_log_failed` | failure source and event type | raw error text containing caregiver health details |
| Export CSV or text | `export_started`, `export_completed` | `export_type`, `surface` | CSV rows, PDF text, report body, raw export content |

## Sentry Verification

| Flow | Expected Result | Required Privacy Check |
| ---- | --------------- | ---------------------- |
| Trigger a controlled preview-only JS error | Sentry receives one event | message and context are sanitized |
| Trigger a render error through the app boundary | fallback screen appears | no raw caregiver notes or prompts in event extra |
| Disable network and retry a user flow | user flow still works or fails with UI copy | telemetry failure does not block caregiver action |

## Required Evidence

- Mixpanel dashboard screenshot or event export showing `screen_viewed`.
- Mixpanel dashboard screenshot or event export showing `quick_log_saved`.
- Mixpanel dashboard screenshot or event export showing `export_started` and `export_completed`.
- Sentry issue link or screenshot for the controlled preview error.
- Confirmation that payload search finds no raw notes, symptoms, prompts, answers, CSV content, PDF text, or export content.

## Local Automated Coverage

`src/features/observability/services/observabilityReleasePreflight.test.ts` verifies that release-critical Mixpanel and Sentry payloads pass through BarkLog telemetry redaction before network delivery.
