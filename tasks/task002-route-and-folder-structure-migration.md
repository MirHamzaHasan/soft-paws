# Task 002: Route and Folder Structure Migration

- Status: `completed`
- Priority: `P0`
- Phase: `Foundation`
- Depends on: `task001`

## Objective

Move the app toward the canonical BarkLog route map and folder structure while preserving the current Tamagui screen implementations.

## Implementation Baseline

Use the existing `Tamagui` screen and component foundation during route migration. Do not couple route restructuring to a styling-system rewrite.

## Scope

- create `(auth)`, `(onboarding)`, and `(tabs)` route groups
- align pushed routes to the canonical names
- thin route files in `app/`
- preserve screen-level Tamagui layouts while route ownership changes
- establish target directories:
  - `src/components/ui`
  - `src/components/features`
  - `src/db`
  - `src/stores`
  - `src/services`
  - `src/theme`
- define migration handling for current legacy feature folders

## Out of Scope

- final screen polish
- data sync implementation

## Acceptance Criteria

- route tree matches the canonical BarkLog navigation model
- folder structure supports the production stack
- old and new route ownership is not ambiguous
- existing Tamagui screens continue to resolve through the updated route tree
- migration notes exist for any legacy folders left in place temporarily

## Validation

- Expo Router resolves the updated route tree
- no duplicate route ownership remains
- critical entry paths can be previewed without broken navigation

## Delivery Notes

- created canonical `app/(auth)`, `app/(onboarding)`, and `app/(tabs)` route groups
- created canonical pushed routes for `log`, `event`, `ask-ai`, `emergency`, `first-aid`, `triage`, `add-medication`, `expenses`, `subscription`, `household`, `photo-journal`, `toxicity`, and `vet-prep`
- converted legacy flat route files to redirects where the path changed, and removed duplicate owners where the canonical path stayed the same
- updated in-app navigation strings and custom bottom-tab route maps to the canonical BarkLog paths
- added `docs/architecture/route-migration-notes.md` to document temporary legacy aliases, preview-only routes, and folder migration handling
- added a placeholder canonical event-detail screen so `/event/[id]` resolves before the full timeline-detail slice lands

## Validation Evidence

- `corepack pnpm check-types`
- `corepack pnpm exec eslint ...` on all touched route and screen files
- `corepack pnpm exec expo export --platform web`
