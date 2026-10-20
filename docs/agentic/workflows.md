# BarkLog KMP delivery workflow

1. Read the canonical spec and exact task. Check dependencies and actual status.
2. Define caregiver value, screen ID, record fields and native capabilities.
3. Implement one end-to-end slice: success, first-run/empty, loading, errors,
   offline, cancellation, accessibility and platform behavior.
4. Persist in SQLite through the domain repository; publish after commit.
5. Validate relevant JVM/domain/storage tests, Android builds/lint and iOS host.
6. Record device evidence separately, update task and feature status honestly.

Local care tools, mobile reports and raw CSV are free. The owner's task033
direction makes report/Memory Book PDF, print and PDF sharing Premium; prices
and real billing remain deferred. No analytics event is delivered by default. Future
telemetry requires an owner request, minimal non-care properties, and a non-blocking
adapter. Permission prompts are triggered by an explicit caregiving action.

Use the repository KMP skill. Shared Compose presentation, platform-free domain,
local data implementations and AppContainer dependency wiring replace the old
Expo/Tamagui/WatermelonDB flow. Do not reinstate the previous managers as architecture.
