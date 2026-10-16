---
name: kmp-template
description: Implement BarkLog features on the Draco Kotlin Multiplatform base with shared Compose UI, local SQLite, native adapters and verified vertical slices.
---

Read AGENTS.md, docs/engineering-instructions.md, the canonical BarkLog spec,
docs/architecture.md and the exact task from tasks/README.md before implementation.
Use docs/agentic/workflows.md for delivery and docs/design/components.md for UI.

Keep the base's shared Compose UI strategy; SwiftUI hosts it on iOS. Shared
presentation, domain and data have separate responsibilities. AppContainer owns
dependencies; ModuleRegistry owns lifecycle. Domain has no UI/platform imports.

Care persistence must use the task002 SQLite design, never sample snapshots or
preferences. Failed writes do not publish success. Preserve unknown legacy device
files. Current preview shells are not implemented journal features.

Integrations require docs/plugins.md and template/plugins.json. Sync generated
registration through python3 tools/plugins.py. Removed cloud/paid providers
cannot be restored by toggling flags. The free/local product rules govern which
services are allowed. Handle both platforms, explicit permission timing, denial,
offline operation, lifecycle, cancellation and appropriate failure states.

Run python3 tools/verify.py after behavior changes, --isolated for locked Android
outputs and --ios on a Mac for native host verification. Follow docs/validation.md
for device QA. Update tasks and actual feature status; report checks executed and
what remains unverified. Never infer performance improvement from compilation.
