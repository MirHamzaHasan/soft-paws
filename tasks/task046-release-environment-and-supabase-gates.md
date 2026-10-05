# Task 046: Local Release Environment

- Status: `in_progress`
- Priority: `P0`
- Depends on: `task051` local build path

## Objective

Prepare public client configuration and private signing inputs for BarkLog v1.0.0 local builds. The old Supabase and EAS gates were removed by task051.

## Acceptance

- `app.json` has version `1.0.0`, Android ID `com.draco.arts.apps.bark.log.dogs.journal`, and the intended iOS bundle ID.
- `corepack pnpm release:check-local` passes before build. After clean prebuild and Android release build, `corepack pnpm release:check-native-capabilities` passes against generated manifests with no Play billing permission.
- `.env.production` contains only client-visible `EXPO_PUBLIC_*` values. RevenueCat and Mixpanel are blank for this release unless Mixpanel is intentionally enabled. GameAnalytics uses separate Android and iOS key/secret pairs, if enabled.
- Signing keystore, passwords, provisioning files, Firebase tokens, and AI provider secrets remain outside the public client config and source control.
- Founder records platform game identifiers, signing ownership, and build environment in [local preflight](../docs/release/preflight-local.md).

See [local-build.md](../docs/release/local-build.md) and [env-management.md](../docs/deployment/env-management.md).
