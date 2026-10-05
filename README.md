# BarkLog

> Daily dog health, in one tap.

BarkLog is a local dog care journal for iPhone and Android. It helps caregivers log observations, review timelines, prepare records for vet visits, and find bounded safety guidance. It does not diagnose or replace veterinary care.

## Version 1.0.0

The first release is free: no ads, trial expiry, subscription, or purchase flow. All implemented local features are included. Care records stay in WatermelonDB on the device. Export CSV or PDF to keep a copy before uninstalling or clearing app data. Android uses `com.draco.arts.apps.bark.log.dogs.journal`; iOS uses `com.dracoarts.barklog`.

Native Ask AI uses optional, separately downloaded on-device models for supported factual journal questions and scene captions. Firebase sign-in is only for the optional Atlas fallback. Atlas AI remains hidden in production until BarkLog's server policy supports this free release and its health context checks pass. There is no Firebase care-record sync.

The source and local automated checks are being prepared for the founder's signed native builds. Device QA and store sign-off are still pending. See [local build instructions](docs/release/local-build.md), [release preflight](docs/release/preflight-local.md), and the [task index](tasks/README.md).

## Stack

Expo Router, React Native, TypeScript, Tamagui, Zustand, TanStack Query, and local WatermelonDB. GameAnalytics is optional native analytics. Notifications, local export, and on-device AI use native modules, so a native build is needed for full QA.

## Start locally

Install Node.js 20.19.4 or newer, Corepack, and Android Studio or Xcode. Then:

```sh
corepack enable
corepack pnpm install
corepack pnpm start
```

Copy `env.example` to an ignored `.env.local` for optional public integration values. See [environment management](docs/deployment/env-management.md). A Firebase, Atlas, GameAnalytics, Mixpanel, Sentry, or RevenueCat account is not required for basic local journaling. `corepack pnpm web` is useful for route visibility, but native builds are required to validate device behavior.

## Validate

```sh
corepack pnpm check-types
corepack pnpm test
corepack pnpm release:check-local
```

`release:check-local` checks source and Expo config. After clean prebuild and a signed Android build, run `corepack pnpm release:check-native-capabilities` against the generated manifests. The founder runs and signs the final builds; [local-build.md](docs/release/local-build.md) has the commands and device checklist.

## Repository

`app/` contains Expo Router routes; `src/` contains features and local data; `assets/` contains app assets; `docs/` holds the canonical spec and current release guides; `tasks/` retains the numbered work history and active backlog; `scripts/` holds validation and build tooling. Generated native projects, caches, local env files, signing credentials, and test output are ignored.

Read [AGENTS.md](AGENTS.md) and the [canonical product and engineering spec](docs/source-of-truth/barklog-product-engineering.md) before changing product behavior. Use Tamagui and BarkLog tokens, keep Home polished, store care records locally, and keep safety guidance observational and escalation aware.

## License

[MIT](LICENSE)
