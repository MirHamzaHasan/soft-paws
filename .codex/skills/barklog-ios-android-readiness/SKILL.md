---
name: barklog-ios-android-readiness
description: BarkLog native-platform guidance for iOS and Android in Expo and React Native. Use when Codex needs to plan or implement permissions, camera flows, notifications, Apple Health or Google Fit, location, build configuration, store readiness, or platform-specific QA for BarkLog.
---

# BarkLog iOS Android Readiness

Read [../../../docs/agentic/product-truth.md](../../../docs/agentic/product-truth.md) and [references/platform-checklists.md](references/platform-checklists.md).

## Use Pattern

Use this skill before coding anything that touches permissions, operating-system behavior, native SDKs, or store-facing policy. Do not leave platform review to the end of implementation.

## Platform Review Sequence

1. List the exact device capabilities involved.
2. Define permission timing, fallback behavior, and denial handling.
3. Specify offline behavior and degraded mode.
4. Check release and review implications for both iOS and Android.
5. Add QA notes for at least one platform-specific edge case per surface.

## BarkLog Priorities

- emergency and health surfaces must stay fast even under weak connectivity
- reminder and notification flows must feel useful, not spammy
- Apple Health and Google Fit integrations must be clearly opt-in
- build or plugin changes must be called out explicitly in the task result
