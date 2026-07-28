# Task 045: EAS Project Linking And Profile Lockdown

- Status: `in_progress`
- Priority: `P0`
- Phase: `Native Release Build Readiness`
- Depends on: `task044`

## Objective

Link BarkLog to the real Expo/EAS project and lock the Android and iOS build profiles so release candidates on both platforms use signed `preview` or `production` builds, not simulator, Expo Go, or development-client builds.

## Release Build Position

- `development` is the only profile allowed to set `developmentClient: true`.
- `development` builds are for active debugging and may require a Metro/Expo dev server.
- `preview` builds are the first release-proof builds for real Android phones and registered iPhones.
- `production` builds are for TestFlight, App Store Connect, and Google Play only after preview QA passes.
- `expo run:android`, `expo run:ios`, `pnpm android`, `pnpm ios`, `start:dev-client`, and `eas build --profile development` are not release proof.

## External Inputs

- Real Expo account access for the BarkLog project.
- Real EAS project UUID for `com.dracoarts.barklog`.
- Android signing configuration managed or confirmed through EAS for `com.dracoarts.barklog`.
- Apple Developer access for `com.dracoarts.barklog` before iOS preview builds.
- At least one physical Android phone and one registered iPhone are required later in `task047` for signed preview-build QA.

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
- Run EAS build configuration for both Android and iOS and confirm both platforms resolve to the same BarkLog EAS project.
- Confirm `eas.json` keeps:
  - `development.environment` as `development`
  - `development.developmentClient` as `true`
  - `preview.environment` as `preview`
  - `preview.distribution` as `internal`
  - `production.environment` as `production`
  - `production.autoIncrement` as `true`
- Confirm `preview` and `production` do not set `developmentClient`, `ios.simulator`, or any Android emulator-only configuration.

## Out Of Scope

- No new runtime backend.
- No Expo Updates rollout setup.
- No custom app server or API server.
- No camera, location, Apple Health, or Google Fit permission expansion.
- No production store submission in this task.

## Acceptance Criteria

- `app.json` contains a real `expo.extra.eas.projectId` value from the BarkLog EAS project.
- `corepack pnpm dlx eas-cli@latest project:info` shows the expected BarkLog EAS project.
- EAS build configuration completes for both Android and iOS without changing either application identifier.
- `corepack pnpm exec expo config --json` resolves:
  - app name `BarkLog`
  - slug `bark-log`
  - version `1.0.0`
  - iOS bundle identifier `com.dracoarts.barklog`
  - Android package `com.dracoarts.barklog`
  - EAS project ID under `extra.eas.projectId`
- Android and iOS `preview` and `production` profiles are confirmed not to be development-client, simulator, or emulator-only profiles.
- Release docs and task notes clearly state that Android and iOS preview and production builds should launch without Metro, Expo Go, or a development-client launcher.

## Validation

Run after the real project ID is added:

```sh
corepack pnpm exec expo config --json
corepack pnpm release:check-eas
corepack pnpm release:check-eas:linked
corepack pnpm dlx eas-cli@latest project:info
corepack pnpm dlx eas-cli@latest build:configure --platform android
corepack pnpm dlx eas-cli@latest build:configure --platform ios
```

Profile sanity checks:

```sh
rg -n '"developmentClient": true|"simulator": true' eas.json
rg -n '"preview"|"production"|"development"' eas.json
```

Expected result:

- Only the `development` profile contains `"developmentClient": true`.
- No profile contains `"simulator": true` unless a future explicitly named simulator-only profile is created.
- Android and iOS both retain `com.dracoarts.barklog` as their application identifier.
- Android and iOS `preview` and `production` profiles remain signed device/store build profiles.
- Actual signed build URLs, installation, and physical-device behavior remain acceptance criteria for `task047`.
