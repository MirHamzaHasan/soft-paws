# Task 045: EAS Project Linking And Profile Lockdown

- Status: `in_progress`
- Priority: `P0`
- Phase: `Native Release Build Readiness`
- Depends on: `task044`

## Objective

Link BarkLog to the real Expo/EAS project and lock the build profiles so release candidates use signed `preview` or `production` builds, not iOS simulator or development-client builds.

## Release Build Position

- `development` is the only profile allowed to set `developmentClient: true`.
- `development` builds are for active debugging and may require a Metro/Expo dev server.
- `preview` builds are the first release-proof builds for real Android phones and registered iPhones.
- `production` builds are for TestFlight, App Store Connect, and Google Play only after preview QA passes.
- `expo run:ios`, `pnpm ios`, `start:dev-client`, and `eas build --profile development` are not release proof.

## External Inputs

- Real Expo account access for the BarkLog project.
- Real EAS project UUID for `com.dracoarts.barklog`.
- Apple Developer access for `com.dracoarts.barklog` before iOS preview builds.

Do not invent or commit a placeholder EAS project ID. Add the real UUID only after `eas init` or the Expo dashboard confirms it.

## Current Local Finding

`corepack pnpm dlx eas-cli@latest whoami` and `corepack pnpm dlx eas-cli@latest project:info --non-interactive` cannot complete in this workspace until Expo login or `EXPO_TOKEN` is available. The EAS project UUID must therefore be supplied by the release owner or discovered after `corepack pnpm dlx eas-cli@latest login`.

## In Progress Notes

- Added `corepack pnpm release:check-eas` for local app identity and profile lockdown checks.
- Added `corepack pnpm release:check-eas:linked` for the stricter linked-project gate that requires a real EAS project UUID.
- Updated release docs to require the linked-project check and `project:info` before preview builds.
- Left `app.json` unchanged because the real BarkLog EAS project UUID is still unavailable in this local session.

## Scope

- Add `expo.extra.eas.projectId` to `app.json` using the real EAS project UUID.
- Keep `ios.bundleIdentifier` as `com.dracoarts.barklog`.
- Keep `android.package` as `com.dracoarts.barklog`.
- Keep `version` as `1.0.0` until the release owner intentionally changes app versioning.
- Confirm `eas.json` keeps:
  - `development.environment` as `development`
  - `development.developmentClient` as `true`
  - `preview.environment` as `preview`
  - `preview.distribution` as `internal`
  - `production.environment` as `production`
  - `production.autoIncrement` as `true`
- Confirm `preview` and `production` do not set `developmentClient` or `ios.simulator`.

## Out Of Scope

- No new runtime backend.
- No Expo Updates rollout setup.
- No custom app server or API server.
- No camera, location, Apple Health, or Google Fit permission expansion.
- No production store submission in this task.

## Acceptance Criteria

- `app.json` contains a real `expo.extra.eas.projectId` value from the BarkLog EAS project.
- `corepack pnpm dlx eas-cli@latest project:info` shows the expected BarkLog EAS project.
- `corepack pnpm exec expo config --json` resolves:
  - app name `BarkLog`
  - slug `bark-log`
  - version `1.0.0`
  - iOS bundle identifier `com.dracoarts.barklog`
  - Android package `com.dracoarts.barklog`
  - EAS project ID under `extra.eas.projectId`
- `preview` and `production` profiles are confirmed not to be development-client or simulator profiles.
- Release docs and task notes clearly state that preview and production builds should launch without Metro.

## Validation

Run after the real project ID is added:

```sh
corepack pnpm exec expo config --json
corepack pnpm release:check-eas
corepack pnpm release:check-eas:linked
corepack pnpm dlx eas-cli@latest project:info
corepack pnpm dlx eas-cli@latest build:configure --platform all
```

Profile sanity checks:

```sh
rg -n '"developmentClient": true|"simulator": true' eas.json
rg -n '"preview"|"production"|"development"' eas.json
```

Expected result:

- Only the `development` profile contains `"developmentClient": true`.
- No profile contains `"simulator": true` unless a future explicitly named simulator-only profile is created.
- `preview` and `production` remain device/store build profiles.
