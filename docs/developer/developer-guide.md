# Developer guide: BarkLog

Read [AGENTS.md](../../AGENTS.md), the [canonical spec](../source-of-truth/barklog-product-engineering.md), and [current product truth](../agentic/product-truth.md) first.

## Architecture

BarkLog uses Expo Router, React Native, TypeScript, Tamagui, Zustand, TanStack Query, and WatermelonDB. Keep route files thin and reusable feature code in `src/features/`. All owner, dog, and care records stay in WatermelonDB; no Firebase or other care-record sync is allowed. Keep Home and one-tap logging fast, with BarkLog tokens and Inter 400/500 only.

The first release is free, without ads, trial expiry, or purchase controls. Native AI uses a user-downloaded ONNX model first for supported factual journal actions; an optional Atlas fallback requires Firebase sign-in and BarkLog's server-side context policy. No AI provider or Firebase token belongs in client configuration or persistent storage. Health copy stays observational and escalates urgent issues.

## Build and configuration

`env.example` lists optional public client values. GameAnalytics uses separate Android and iOS game key/secret pairs. Keep signing secrets and AI provider keys outside Expo env files. See [environment management](../deployment/env-management.md) and [local builds](../release/local-build.md).

```sh
corepack pnpm install
corepack pnpm check-types
corepack pnpm test -- --runInBand
corepack pnpm release:check-local
```

After a clean native prebuild and Android release build, run `corepack pnpm release:check-native-capabilities`. Complete real-device QA using [native-device-qa-checklist.md](../deployment/native-device-qa-checklist.md). `pnpm web` helps route review but does not prove native behavior.
