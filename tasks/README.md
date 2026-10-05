# BarkLog task index

The numbered files in this folder are an implementation record. Earlier Supabase, EAS, household-sharing, and paid-access tasks document superseded work; they are not instructions for the v1.0.0 build. Use the [canonical spec](../docs/source-of-truth/barklog-product-engineering.md), [current product truth](../docs/agentic/product-truth.md), and [local build guide](../docs/release/local-build.md) for current decisions.

## Current release work

| Task | Current status |
| --- | --- |
| [task046](task046-release-environment-and-supabase-gates.md) | Local public env and signing evidence still needed; its Supabase gates are obsolete. |
| [task047](task047-preview-builds-and-native-device-qa.md) | Physical Android and iOS QA still needed using locally built artifacts. |
| [task048](task048-production-builds-store-submission-and-rollback.md) | Signed production artifacts, store upload, and rollback evidence pending. |
| [task049](task049-production-feedback-and-error-handling-hardening.md) | Manual native feedback and error flow QA pending. |
| [task051](task051-remove-supabase-and-eas-local-only-build.md) | Local-only journal and build path implemented; physical and iOS QA pending. |
| [task052](task052-firebase-atlas-ai.md) | Optional Firebase/Atlas adapter implemented; production Atlas policy and live checks pending. |
| [task053](task053-local-first-mobile-ai.md) | Native local model path implemented; iOS and physical-device QA pending. |
| [task054](task054-local-conversation-and-photo-captions.md) | Local conversation/caption path implemented; public model downloads and native QA pending. |

The v1.0.0 decision is free access to all implemented local features, with no ads or purchase flow. GameAnalytics is optional and requires separate Android and iOS game key/secret pairs. Current release evidence belongs in [preflight-local.md](../docs/release/preflight-local.md).

## Historical tasks

- `task001`–`task044` record earlier implementation and product plans. Current behavior may differ where `task051`–`task054` or the v1.0.0 release decision superseded them.
- `task032` and `task033` describe the removed care sync path; `task038` and `task039` describe removed share-link and household features.
- `task045` EAS linking and `task050` contact capture are removed from the local-only release path.
- [production-readiness-plan.md](production-readiness-plan.md) is historical planning context.

Do not mark release work complete until the founder records signed artifact paths, device tests, store metadata, and a release decision in the current preflight.
