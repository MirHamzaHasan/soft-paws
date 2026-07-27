# Task 014: Memory Book, Expense Tracker, and Export Completion

- Status: `completed`
- Priority: `P2`
- Phase: `Expansion and Retention`
- Depends on: `task010`, `task013`

## Objective

Finish BarkLog's retention and long-term ownership features.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for retention and export surfaces. Do not introduce a parallel styling system.

## Scope

- Memory Book
- Expense Tracker
- CSV export completion
- PDF vet-report completion
- share and download flows

## Out of Scope

- social feed features
- public community sharing

## Acceptance Criteria

- data export remains available in line with the BarkLog promise
- memory and expense features match the canonical spec
- generated outputs are shareable on mobile

## Validation

- CSV and PDF exports generate successfully
- share flows work on target platforms

## Completed Work

- Connected Memory Book to the selected dog's monthly event history, summary metrics, share/save story actions, and premium gate.
- Added the local expense repository and wired Expense Tracker create/list/export flows to WatermelonDB-backed expense data.
- Added reusable CSV, memory story, and vet report builders for caregiver exports.
- Completed web download plus native share flows for text exports, and PDF print/share flows for vet reports.
- Kept CSV and basic PDF export available outside the premium gate, while leaving Memory Book and Expense Tracker as premium retention features.
- Added profile data export so the selected dog's timeline can be exported from the Dog Profile hub.

## Validation Notes

- `corepack pnpm check-types`
- `corepack pnpm exec eslint src/db/events/localEventRepository.ts src/db/expenses/localExpenseRepository.ts src/db/expenses/index.ts src/db/index.ts src/features/export/services/exportDocumentService.ts src/features/export/utils/exportBuilders.ts src/features/archive/screens/MemoryBookScreen.tsx src/features/ledger/screens/ExpenseTrackerScreen.tsx src/features/insights/screens/VetVisitPrepScreen.tsx src/features/profile/screens/DogProfileHubScreen.tsx src/features/premium/data/premiumCatalog.ts src/features/premium/utils/premiumAccess.ts src/features/settings/screens/SubscriptionManagementScreen.tsx`
- `corepack pnpm exec expo export --platform web`
- Restarted Expo web preview on `http://localhost:8081` and confirmed `HTTP/1.1 200 OK`.
