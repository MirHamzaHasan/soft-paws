# Task 039: Household Sharing and Sitter Mode

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market Collaboration`
- Depends on: `task038`

## Objective

Add Premium household collaboration so families, sitters, and care helpers can coordinate dog care without losing the simplicity of the single-owner local logging loop.

## Implementation Baseline

Use Supabase Auth, RLS, Premium entitlement checks, existing dog/user models, and the cloud sync model from task032. Household sharing is cloud-backed and therefore Premium.

## Scope

- create household and membership schema
- define roles and permissions
- add invite, accept, remove, and leave flows
- add sitter mode with limited access and time-bound permissions
- show who logged each event where useful
- add shared care notes and handoff summary
- add household settings surface
- update sync and RLS rules for shared dogs
- add tests for permissions, membership, and shared event visibility

## Out of Scope

- public social sharing
- veterinary clinic integrations
- payments split across household members
- emergency paywall changes

## Data Contracts / Schema Changes

Recommended roles:

```ts
type HouseholdRole = 'owner' | 'caregiver' | 'sitter' | 'viewer';

type HouseholdPermission =
  | 'view_logs'
  | 'create_logs'
  | 'edit_own_logs'
  | 'manage_medications'
  | 'view_reports'
  | 'manage_members';
```

Recommended tables:

- `households`
- `household_members`
- `household_dogs`
- `household_invites`
- optional `care_handoffs`

Events should retain original `user_id` and optionally expose `logged_by` display metadata for shared views.

## UX and Accessibility Requirements

- Profile includes Household entry point for Premium users.
- Free users opening household actions see Premium Gate.
- Household screen shows members, roles, shared dogs, invites, and sitter mode.
- Sitter mode must make access limits clear.
- Permission errors must be calm and specific.
- Touch targets remain at least 44x44pt.

## AI / Safety Requirements

- Care Coordinator Agent may later summarize handoffs, but this task should not introduce new AI generation unless already available.
- Emergency information visible to authorized sitters must not be hidden behind extra paywalls.
- Shared health copy remains non-diagnostic.

## Premium / Free Behavior

- Free: single-device, single-owner local tracking.
- Premium: household sharing, sitter mode, shared cloud sync, shared reports, and role permissions.

## Acceptance Criteria

- Premium owner can create a household and invite members.
- Invited member can accept through `/household/invite/[token]` after Premium entitlement verification.
- Role permissions are enforced by client checks, Supabase RLS helpers, and sync dog-scope checks.
- Sitter mode supports limited access through `sitter_expires_at`.
- Shared events identify household-member logs in Timeline and Event Detail when the logger is not the current user.
- Free users cannot create or join cloud-backed households without the Household Sharing Premium gate.
- Tests cover owner, caregiver, sitter, viewer, expired sitter permissions, RLS helper contracts, and shared sync scoping.

## Completion Notes

- Added `households`, `household_members`, `household_dogs`, `household_invites`, and `care_handoffs` Supabase schema with RLS helpers for shared-dog visibility, shared log creation, member management, and Premium-only household creation.
- Added `accept-household-invite` Edge Function with Premium verification before membership creation, hashed invite tokens, expiry validation, revoked/accepted checks, and sitter access expiration.
- Updated `barklog-sync` so Premium users pull owned plus permitted shared dogs and logs; pushes remain scoped by `create_logs`, `manage_medications`, or owned-dog permissions.
- Added household permission utilities, invite token helpers, household API client, invite acceptance route, Profile entry point, and Household screen collaboration sections for members, invites, sitter mode, shared dogs, and care handoffs.
- Added Premium catalog support for `household-sharing`.
- Added Timeline and Event Detail metadata for shared events logged by another household member.

## Validation

- `corepack pnpm check-types`
- `corepack pnpm exec eslint src/features/household/screens/HouseholdOverviewScreen.tsx src/features/household/screens/HouseholdInviteAcceptScreen.tsx src/features/household/api/householdClient.ts src/features/household/api/householdEdgeFunctionContracts.test.ts src/features/household/utils/householdPermissions.ts src/features/household/utils/householdPermissions.test.ts src/features/household/utils/householdInviteTokens.ts src/features/archive/components/TimelineEventRow.tsx src/features/archive/screens/TimelineDailyScreen.tsx src/features/archive/screens/EventDetailScreen.tsx src/features/profile/screens/DogProfileHubScreen.tsx src/features/premium/utils/premiumAccess.ts src/features/premium/data/premiumCatalog.ts src/db/sync/syncEdgeFunctionContracts.test.ts supabase/functions/accept-household-invite/index.ts supabase/functions/barklog-sync/index.ts`
- `corepack pnpm test -- --coverage=false --runTestsByPath src/features/household/utils/householdPermissions.test.ts src/features/household/api/householdEdgeFunctionContracts.test.ts src/db/sync/syncEdgeFunctionContracts.test.ts`
- Expo web route smoke returned `200 OK` for `/household`, `/household/invite/test-token`, and `/premium-gate?feature=household-sharing` on local port `8090`; server was stopped after validation.
- Supabase migration reviewed for RLS, Premium gates, indexes, and shared dog helpers.

## Commit Boundary

One commit only: household schema, permissions, invite flows, sitter mode, shared event visibility, premium gates, and tests.
