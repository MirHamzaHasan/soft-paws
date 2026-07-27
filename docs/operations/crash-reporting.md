# Operations: Crash Reporting

## Runtime Behavior

BarkLog captures JavaScript errors with the app-level observability boundary and global error handlers. Events are sent to Sentry when `EXPO_PUBLIC_SENTRY_DSN` is configured.

Crash reporting is fail-open:

- local logging remains available if Sentry is unreachable
- emergency and toxicity surfaces do not wait for telemetry
- export and share flows rethrow user-visible errors after capture

## Captured Context

- release: `barklog@<app version>`
- environment: `development`, `preview`, or `production`
- platform: `ios`, `android`, or `web`
- authenticated user id and email when available
- source tag for the failing flow

## Privacy Rules

- Do not attach raw journal notes, AI prompts, toxic exposure descriptions, PDFs, CSVs, or chat text.
- Crash context and message text pass through telemetry sanitizers before Sentry delivery.
- Use structured tags such as `source`, `surface`, `event_type`, and `capability`.
- Keep emergency and health-safety paths usable even when capture fails.

## Release Checks

1. Confirm `EXPO_PUBLIC_SENTRY_DSN` points to the correct Sentry project for the release channel.
2. Build a preview app and trigger a controlled screen-level exception.
3. Confirm the fallback screen appears and Sentry receives the event.
4. Confirm the app can recover with `Try again`.
5. Confirm no protected caregiver text appears in the event payload.
