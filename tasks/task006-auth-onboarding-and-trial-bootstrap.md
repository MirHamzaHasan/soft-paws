# Task 006: Auth, Onboarding, and Trial Bootstrap

- Status: `completed`
- Priority: `P0`
- Phase: `Foundation`
- Depends on: `task002`, `task004`, `task005`

## Objective

Implement the BarkLog account bootstrap flow from sign-up through trial activation.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for auth and onboarding work. Do not introduce a parallel styling system.

## Scope

- Supabase email/password auth
- session persistence
- auth route flow
- onboarding route flow
- user and first-dog creation path
- trial start and trial metadata initialization

## Out of Scope

- Apple Sign-In
- premium purchase flow

## Acceptance Criteria

- auth screens map to canonical routes
- a new account can complete onboarding and land in Home
- trial metadata is initialized correctly
- returning users are routed by session state

## Validation

- sign-up, sign-in, sign-out, and password reset flows work
- onboarding creates the required dog and user state

## Completed Work

- added a Supabase-backed auth session store and onboarding draft store for multi-screen bootstrap state
- wired root auth bootstrap plus guarded redirects for `(auth)`, `(onboarding)`, and `(tabs)` routes
- connected sign-up, sign-in, password reset, onboarding completion, and sign-out flows to the live auth client
- made Home, Profile, and Settings reflect the signed-in BarkLog user and primary dog instead of hardcoded placeholder copy

## Validation Notes

- `corepack pnpm check-types`
- `corepack pnpm exec eslint --fix src/api/auth.ts src/types/supabase.ts src/features/auth/components/AuthNavigationGate.tsx src/features/auth/hooks/useAuthSessionBootstrap.ts src/features/auth/screens/SignInScreen.tsx src/features/auth/screens/SignUpScreen.tsx src/features/auth/screens/ForgotPasswordScreen.tsx src/features/onboarding/screens/DogProfileSetupScreen.tsx src/features/onboarding/screens/PermissionsScreen.tsx src/features/onboarding/screens/TrialWelcomeScreen.tsx src/features/settings/screens/SettingsScreen.tsx src/features/home/components/HomeHeader.tsx src/features/home/screens/HomeScreen.tsx src/features/profile/screens/DogProfileHubScreen.tsx src/stores/useOnboardingDraftStore.ts app/_layout.tsx app/'(auth)'/_layout.tsx app/'(onboarding)'/_layout.tsx app/'(tabs)'/_layout.tsx`
- `corepack pnpm exec expo export --platform web`
- live cloud auth and onboarding still require the linked Supabase project and applied remote migration from `task004`
