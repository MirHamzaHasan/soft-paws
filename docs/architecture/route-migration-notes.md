# BarkLog Route Migration Notes

## Canonical Route Owners

- Auth screens now live under `app/(auth)/`.
- Onboarding screens now live under `app/(onboarding)/`.
- Primary app tabs now live under `app/(tabs)/`.
- Canonical pushed routes now use BarkLog product names such as `app/log/[eventType].tsx`, `app/event/[id].tsx`, `app/ask-ai.tsx`, `app/emergency.tsx`, and `app/add-medication.tsx`.

## Temporary Legacy Route Aliases

The following flat routes remain in `app/` as redirects only so older preview links and unfinished internal references do not hard-fail during migration:

- `/home`
- `/dog-profile-setup`
- `/dog-profile-hub`
- `/add-edit-medication`
- `/ask-barklog-ai`
- `/emergency-sos`
- `/expense-tracker`
- `/first-aid-guide`
- `/household-overview`
- `/log-poop-detail`
- `/log-meal-detail`
- `/log-walk-detail`
- `/log-medication-detail`
- `/log-symptom`
- `/photo-journal-gallery`
- `/subscription-management`
- `/timeline-daily`
- `/toxicity-scanner`
- `/vet-or-wait-triage`
- `/vet-visit-prep`

## Preview-Only Routes Still Kept

These routes are intentionally still outside the canonical BarkLog product map because they are useful prototype states or utilities:

- `/home-offline`
- `/timeline-empty`
- `/loading-skeleton`
- `/error-state`
- `/returning-user-greeting`
- `/premium-gate`
- `/design-system-preview`

## Source Folder Notes

- `src/features/*` remains the current source of truth for screen implementations while route ownership moves into the canonical Expo Router tree.
- `src/store/` is legacy. New Zustand work should land in `src/stores/` until the old store files are fully migrated.
- `src/components/ui`, `src/components/features`, `src/db`, `src/services`, and `src/theme` are the target shared foundation directories and should be preferred for future work.
