# Task 048: Production Artifacts And Store Submission

- Status: `in_progress`
- Priority: `P0`
- Depends on: `task047`

## Objective

Use the founder's locally signed artifacts for store review after physical device QA passes.

## Acceptance

- Final Android AAB uses `com.draco.arts.apps.bark.log.dogs.journal` and the backed-up permanent upload key. Final iOS archive uses `com.dracoarts.barklog` and a valid Apple signing identity.
- Store copy and screenshots describe a free local dog care journal, with no ads, purchases, subscription, diagnosis, cloud backup, or account requirement.
- Privacy and data safety disclosures match shipped analytics/crash SDK configuration and optional Firebase/Atlas behavior.
- Submission and any RuStore/Huawei store packaging are checked for store-specific policies and device behavior. No RevenueCat purchase setup is needed for the free build.
- [Preflight](../docs/release/preflight-local.md) records final artifact paths, device evidence, rollback/hotfix actions, release owner, and an explicit decision.

Do not mark complete until store submission and its final evidence are recorded.
