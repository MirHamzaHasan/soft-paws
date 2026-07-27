# Task 042: Photo Baseline Tracker

- Status: `completed`
- Priority: `P2`
- Phase: `Best-In-Market Care Record`
- Depends on: `task041`

## Objective

Add a local-first Photo Baseline Tracker so caregivers can save dated visual references for skin, eyes, teeth, stool, body shape, posture, wounds, grooming, and other owner-observed changes without turning BarkLog into a diagnostic tool.

## Completion Notes

- Added `photo_baselines` to Supabase, WatermelonDB, typed Supabase rows, model classes, collection constants, and sync transport mappings.
- Added a local photo baseline repository for create, list by dog, list by category, delete, and local placeholder photo reference generation.
- Added category contracts and presentation helpers for safe labels, date normalization, captured-date labels, and newest-first sorting.
- Added `/photo-baselines` with a local-first Photo Baseline Tracker screen:
  - category chips
  - title
  - body area
  - captured date
  - local photo reference URI
  - notes
  - newest-first local record list
  - local delete action
  - explicit non-diagnostic safety copy
- Added Home and Profile entry points.
- Reused the existing `photo-compare` Premium gate for compare, cloud backup, future AI photo summaries, and future share-link inclusion.
- Updated agent-facing docs, architecture notes, current roadmap, best-in-market plan, and canonical source-of-truth sections.

## Implementation Baseline

Use the existing Expo Router, Tamagui-compatible React Native screen patterns, WatermelonDB local persistence, Supabase sync transport mappings, RevenueCat premium gates, and BarkLog safety language. This slice must not add a new image-picker or camera permission flow; it should store a local photo reference URI and notes so native capture can be added later with the correct permission plan.

## Scope

- Create a `photo_baselines` local and cloud data model.
- Add category options and presentation helpers for photo baseline records.
- Add a local repository for create, list, and delete operations.
- Add `/photo-baselines` route and screen.
- Support category, title, optional body area, captured date, optional photo reference URI, and notes.
- Add Home and Profile entry points.
- Add Premium gate for photo compare and future AI photo summaries.
- Add sync table mappings so Premium sync can back up and restore photo baseline records.
- Update agent-facing and product docs with the completed feature surface.
- Add focused tests for schema, repository behavior, and presentation helpers.

## Out of Scope

- Native camera capture.
- Image picker permissions.
- Supabase Storage upload.
- AI image analysis or diagnostic photo interpretation.
- Automated change detection.
- Vet-share attachment rendering.

## Data Contracts / Schema Changes

```ts
type PhotoBaselineCategory =
  | 'skin'
  | 'eyes'
  | 'teeth'
  | 'stool'
  | 'weight_shape'
  | 'mobility_posture'
  | 'wound'
  | 'grooming'
  | 'other';

type PhotoBaseline = {
  id: string;
  dog_id: string;
  user_id: string;
  category: PhotoBaselineCategory;
  title: string;
  body_area?: string | null;
  captured_at: string;
  photo_uri?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
};
```

## UX and Accessibility Requirements

- The screen must work as a list-first tool on small phones.
- Category chips must meet minimum touch targets.
- Save and delete actions must use haptics.
- Loading, empty, error, and saved states must be explicit.
- Empty copy should encourage adding a baseline without creating anxiety.
- Premium compare copy should frame comparison as organization, not medical interpretation.

## AI / Safety Requirements

- User-facing copy must never diagnose or interpret the photo.
- BarkLog may say photo baselines help organize observations and can support vet conversations.
- Any future AI photo or change summary must run only through Supabase Edge Functions.
- Do not imply BarkLog can identify wounds, infections, dental disease, parasites, or posture problems from photos.

## Premium / Free Behavior

- Free: create, view, delete, and locally store photo baseline records on the device.
- Free: include records in manual data export in a future export pass.
- Premium: cloud backup, restore, cross-device sync, photo compare, future AI summaries, and future vet-share inclusion.

## Acceptance Criteria

- `task042` is documented and sequenced after `task041`.
- Users can open Photo Baselines from Home and Profile.
- Users can save a baseline locally with category, title, captured date, optional body area, optional local photo reference, and notes.
- Users can view latest baselines newest-first with category labels and safety-minded copy.
- Users can delete local baseline records.
- Free users are not blocked from local baseline creation.
- Premium gates only apply to compare, cloud sync, AI summaries, and sharing extensions.
- `photo_baselines` is included in WatermelonDB, Supabase migration, typed Supabase rows, and sync transport mappings.
- Tests cover repository writes, date/category presentation, local schema, and sync collection contract.

## Validation

- `corepack pnpm check-types`
- `corepack pnpm exec eslint src/types/photoBaseline.ts src/types/photoBaseline.test.ts src/db/models/PhotoBaselineModel.ts src/db/photos/localPhotoBaselineRepository.ts src/db/photos/localPhotoBaselineRepository.test.ts src/features/photos/utils/photoBaselinePresentation.ts src/features/photos/utils/photoBaselinePresentation.test.ts src/features/photos/screens/PhotoBaselineTrackerScreen.tsx app/photo-baselines.tsx src/features/home/screens/HomeScreen.tsx src/features/profile/screens/DogProfileHubScreen.tsx src/db/schema.test.ts src/db/sync/transport.test.ts src/db/sync/engine.test.ts test/utils/builders.ts`
- `corepack pnpm test -- --coverage=false src/types/photoBaseline.test.ts src/features/photos/utils/photoBaselinePresentation.test.ts src/db/photos/localPhotoBaselineRepository.test.ts src/db/schema.test.ts src/db/sync/transport.test.ts src/db/sync/engine.test.ts src/db/sync/syncEdgeFunctionContracts.test.ts`
- `corepack pnpm web -- --port 8090`, then `curl -I -L http://localhost:8090/`, `curl -I -L http://localhost:8090/profile`, and `curl -I -L http://localhost:8090/photo-baselines`

Result: all validation commands passed. The three route smoke checks returned `HTTP/1.1 200 OK`.

Note: including this Markdown task file in the ESLint command fails because the current ESLint configuration parses Markdown as code. The final targeted ESLint command validates only touched TypeScript and route files.

## Commit Boundary

One commit only: task document, photo baseline model, local repository, sync support, Photo Baseline Tracker screen, Home/Profile entry points, premium compare gate, docs, and focused tests.
