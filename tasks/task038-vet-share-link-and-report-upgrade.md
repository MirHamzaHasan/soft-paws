# Task 038: Vet Share Link and Report Upgrade

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market Reports`
- Depends on: `task037`

## Objective

Upgrade Vet Prep from static exports into a Premium vet-ready report and secure share-link flow while preserving free manual CSV/PDF export.

## Implementation Baseline

Use existing Vet Prep, export, Supabase, Premium Gate, and AI safety patterns. Share links require Premium because they depend on cloud-backed data.

## Scope

- define a Premium vet report builder using selected date ranges
- include health logs, medications, symptoms, mood, behavior, training, photos, notes, and owner questions
- add AI-generated visit summary and question list through Supabase Edge Functions
- create secure, time-limited vet share links
- add share-link management and revoke behavior
- preserve free raw manual export
- add report loading, empty, error, and expired-link states
- add tests for report content, gating, share-link permissions, and prompt safety

## Out of Scope

- real-time vet messaging
- clinic integration
- emergency triage
- changing free manual export

## Data Contracts / Schema Changes

Recommended share-link record:

```ts
type VetShareLink = {
  id: string;
  dog_id: string;
  user_id: string;
  range_start: string;
  range_end: string;
  token_hash: string;
  report_snapshot: Json;
  expires_at: string;
  revoked_at?: string | null;
  created_at: string;
};
```

Report sections:

- dog profile
- medications
- symptoms
- stool and appetite
- weight
- mood and behavior
- training notes
- photos
- owner notes
- AI-generated factual summary
- questions to ask

## UX and Accessibility Requirements

- Vet Prep shows free manual export and Premium report/share actions separately.
- Premium Gate appears only for generated report or share link actions.
- Report preview is scannable and printable.
- Expired or revoked links show a calm unavailable state.
- Do not use urgent health fear as upgrade copy.

## AI / Safety Requirements

- AI visit summary must be factual and timestamped.
- Never diagnose.
- Never recommend dosage changes.
- Questions should be framed for vet discussion.
- Urgent symptoms should route to emergency contact guidance instead of casual report generation.

## Premium / Free Behavior

- Free: manual CSV/PDF export.
- Premium: polished vet-ready report, AI summary, question list, secure cloud share link.

## Acceptance Criteria

- [x] Free users can still export raw data manually.
- [x] Free users see Premium Gate for generated report and share link.
- [x] Premium users can generate a report for a date range.
- [x] Premium users can create and revoke a time-limited vet share link.
- [x] Shared report respects token expiry and revoked state.
- [x] AI summary remains factual and non-diagnostic.

## Completion Notes

- Added `vet_share_links` Supabase schema with token hash, report snapshot, expiry, revoke timestamp, indexes, owner-scoped management, and Premium-scoped creation RLS.
- Added Vet Prep Premium upgrade actions for generated summaries, question lists, secure share links, and revoke behavior.
- Preserved the existing free PDF/print export path.
- Added `generate-vet-report` Edge Function with Premium checks before Anthropic calls and strict non-diagnostic output rules.
- Added `resolve-vet-share-link` Edge Function for public token resolution with expiry and revoke enforcement.
- Added public `/vet-share/[token]` route with unavailable/expired states.
- Updated Premium catalog copy for advanced vet reports and share links.

## Validation

- `corepack pnpm check-types`
- `corepack pnpm eslint src/features/insights/screens/VetVisitPrepScreen.tsx src/features/insights/api/insightsAiClient.ts src/features/insights/api/insightsAiClient.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts src/features/vet/api/vetShareLinkClient.ts src/features/vet/api/publicVetShareReportClient.ts src/features/vet/screens/VetShareReportScreen.tsx src/features/vet/utils/vetReportBuilder.ts src/features/vet/utils/vetReportBuilder.test.ts src/features/vet/utils/vetShareLinks.ts src/features/vet/utils/vetShareLinks.test.ts src/features/auth/utils/authRouting.ts src/features/auth/utils/authRouting.test.ts src/features/premium/data/premiumCatalog.ts src/features/premium/utils/premiumAccess.ts`
- `corepack pnpm jest src/features/vet/utils/vetReportBuilder.test.ts src/features/vet/utils/vetShareLinks.test.ts src/features/insights/api/insightsAiClient.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts src/features/auth/utils/authRouting.test.ts --runInBand --coverage=false`
- Expo web route smoke:
  - `curl -I http://localhost:8090/vet-prep`
  - `curl -I http://localhost:8090/vet-share/test-token`
  - `curl -I 'http://localhost:8090/premium-gate?feature=vet-pdf-reports'`

## Commit Boundary

One commit only: Premium vet report, AI visit summary, secure share links, revoke/expiry handling, free export preservation, and tests.
