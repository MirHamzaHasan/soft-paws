# Launch Readiness Checklist

## Device Matrix

Use [release-preflight-checklist.md](release-preflight-checklist.md) as the release decision record.
Use [native-device-qa-checklist.md](native-device-qa-checklist.md) to capture the actual preview-build results for each native device.

- iPhone SE or similarly small iOS viewport
- current standard iPhone
- iPad portrait
- small Android phone
- large Android phone
- Expo web preview for route visibility

## Critical Flows

- auth restore and onboarding redirect
- auth, trial, and data lifecycle staging smoke test from [auth-trial-data-lifecycle-smoke-test.md](auth-trial-data-lifecycle-smoke-test.md)
- WatermelonDB to Supabase staging sync smoke test from [watermelondb-supabase-sync-smoke-test.md](watermelondb-supabase-sync-smoke-test.md)
- RevenueCat sandbox purchase and restore checklist from [revenuecat-sandbox-purchase-checklist.md](revenuecat-sandbox-purchase-checklist.md)
- dog profile setup
- Home instant Poop, Pee, Meal, Walk logging
- long-press detailed logging
- Timeline daily review
- medication create, reminder scheduling, and reminder denial fallback
- toxicity lookup with poison-control escalation
- Emergency SOS phone, first-aid, and clinic-search actions
- Ask BarkLog AI emergency-language escalation without model call
- weekly insight and Ask BarkLog AI Premium gates for free, expired, trial, and active users
- Vet Visit Prep PDF
- profile CSV export
- Memory Book and Expense Tracker premium gates

## RevenueCat QA

- Premium unlocks only after RevenueCat returns the `premium` entitlement.
- Cancelled purchases do not update Supabase subscription state.
- Restore purchases activates subscribed accounts.
- Restore purchases does not unlock non-subscribed accounts.
- Stale `active` cache downgrades to `expired` when restore returns no active
  entitlement.
- Free users keep logging, timeline access, CSV export, and basic PDF export.

## Permission QA

- Notifications accepted
- Notifications denied
- Notifications unavailable on web
- Health activity opt-in unavailable until native HealthKit or Google Fit adapter is configured
- Camera, location, HealthKit, and Google Fit permissions are absent from this build until those adapters are implemented
- Camera and location are not requested in native builds until a user-triggered feature that needs them is connected
- Emergency content remains visible without network or permission grants

## Export QA

- CSV export writes a native cache file before opening the iOS share sheet
- CSV export writes a native cache file before opening the Android share sheet
- CSV export falls back to the native share API when file sharing is unavailable
- Vet Visit Prep PDF opens the native share sheet on iOS and Android
- Web CSV export downloads through the browser
- Web PDF export opens the print dialog

## Observability QA

Use [observability-preview-checklist.md](observability-preview-checklist.md) for preview-build evidence.

- `screen_viewed` fires once per route transition
- `quick_log_saved` fires after local WatermelonDB write succeeds
- `quick_log_failed` fires only when the local save fails
- export events fire without sending file content
- analytics and crash payloads redact raw notes, symptoms, prompts, answers, CSV/PDF text, and export content
- Sentry fallback screen captures React render errors
- telemetry failures do not block user actions

## Store Review Notes

Use [store-submission-checklist.md](store-submission-checklist.md) before App Store or Google Play submission.

- BarkLog is a care journal and organization tool, not a veterinary authority.
- Emergency and toxicity copy escalates to vets or poison control.
- Health activity import is opt-in and additive.
- Free users keep logging, timeline access, CSV export, and basic PDF export.
