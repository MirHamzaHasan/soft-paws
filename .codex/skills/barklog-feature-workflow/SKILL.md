---
name: barklog-feature-workflow
description: End-to-end BarkLog feature planning and delivery guidance. Use when Codex needs to turn BarkLog product requests into an implementation plan, backlog slice, acceptance criteria, validation checklist, or cross-functional workflow spanning product, UX, engineering, monetization, or safety.
---

# BarkLog Feature Workflow

Read [../../../docs/agentic/product-truth.md](../../../docs/agentic/product-truth.md) first, then [../../../docs/agentic/workflows.md](../../../docs/agentic/workflows.md), then [references/feature-delivery.md](references/feature-delivery.md).

## Operating Mode

Use this skill to frame the work before code starts. Identify the persona, the primary loop, the premium/free boundary, and whether the request carries platform or health-safety risk.

Choose only the minimum supporting BarkLog skills needed:

- UI or interaction-heavy work: `$barklog-ui-ux-journal`
- implementation work: `$barklog-react-native-tamagui`
- native or release work: `$barklog-ios-android-readiness`
- premium or retention work: `$barklog-monetization-engagement`
- health or emergency work: `$barklog-health-safety`

## Delivery Sequence

1. Define the feature in one sentence from the dog's caregiver perspective.
2. State the target persona and the primary value moment.
3. Split the slice into:
   - happy path
   - empty and first-run state
   - offline behavior
   - loading and failure states
   - premium or paywall behavior
   - analytics and notification implications
4. Turn the slice into acceptance criteria that can be tested.
5. Hand the implementation-facing portion to the relevant BarkLog skill.

## Output Contract

Produce a compact artifact with:

- feature summary
- affected screens or routes
- data or manager touchpoints
- free vs premium behavior
- safety or compliance notes
- validation plan

Keep the plan vertical. Prefer one end-to-end slice over parallel partial work across many screens.
