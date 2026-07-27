---
name: barklog-health-safety
description: BarkLog health-safety guidance for high-trust features. Use when Codex needs to plan, design, or review symptom mapping, triage, toxicity lookup, first-aid flows, vet reports, or AI-generated health narratives that could drift into unsafe or overconfident guidance.
---

# BarkLog Health Safety

Read [../../../docs/agentic/product-truth.md](../../../docs/agentic/product-truth.md) and [references/safety-boundaries.md](references/safety-boundaries.md).

## Safety Mode

Use this skill before finalizing any BarkLog feature that interprets symptoms, suggests urgency, identifies toxins, outputs first-aid steps, or summarizes health patterns with AI.

## Review Sequence

1. Classify the feature as low, medium, or high risk.
2. Separate factual organization from health interpretation.
3. Define escalation language for uncertainty and urgent cases.
4. Check whether the feature must work offline.
5. Check whether premium gating would undermine user trust.

## BarkLog Safety Rules

- do not write copy that sounds like diagnosis or certainty without clinical backing
- present urgent options clearly and early
- prefer `contact a vet now` over nuanced copy when the situation is ambiguous and potentially serious
- keep toxicity and emergency surfaces calm, short, and explicit
- keep Vet Report outputs factual, timestamped, and source-aware
