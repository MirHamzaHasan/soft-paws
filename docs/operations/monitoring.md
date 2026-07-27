# Operations: Monitoring

## Canonical Stack

- Product analytics: Mixpanel
- Error reporting: Sentry
- Client env keys:
  - `EXPO_PUBLIC_MIXPANEL_TOKEN`
  - `EXPO_PUBLIC_SENTRY_DSN`
  - `EXPO_PUBLIC_APP_ENV`

## Instrumented Surfaces

- app open and user identification
- route-level screen views
- instant Home logging success and failure
- detailed logging success and failure
- medication notification permission requests and results
- onboarding native permission requests and results
- text, CSV, emergency summary, and PDF export success or failure
- emergency phone and clinic-search actions
- toxicity suggested-search selections

## Event Rules

- Do not send free-form notes, symptoms, chat text, or raw export content to analytics.
- Analytics payloads pass through `sanitizeTelemetryProperties`, which redacts note, symptom, prompt, answer, raw content, CSV/PDF, and export-shaped fields before sending to Mixpanel.
- Dog and user identifiers can be used for debugging joins, but medical details should stay out of event properties.
- Analytics failures must never block logging, emergency, medication, or export flows.
- Screen views are route-based and should remain low-cardinality.

## Launch Verification

Use [../deployment/observability-preview-checklist.md](../deployment/observability-preview-checklist.md) for preview-build evidence.

1. Set `EXPO_PUBLIC_MIXPANEL_TOKEN` and `EXPO_PUBLIC_SENTRY_DSN`.
2. Start the app with `EXPO_PUBLIC_APP_ENV=preview`.
3. Open Home, Timeline, Toxicity, Emergency, Settings, and Vet Visit Prep.
4. Confirm Mixpanel receives `screen_viewed`, `quick_log_saved`, `export_started`, and `export_completed`.
5. Trigger a controlled JS error in a non-production build and confirm Sentry receives it.
6. Confirm no event contains raw caregiver notes, symptoms, prompts, answers, CSV content, PDF text, or export content.
