# BarkLog Feature Delivery Checklist

## Required Inputs

- user problem
- target persona
- feature pillar
- free or premium status
- native or health risk

## BarkLog Feature Brief

- Problem: what caregiving friction or anxiety is being reduced
- Value moment: what the user sees, learns, or finishes
- Trigger surface: home, insights, emergency, archive, onboarding, paywall
- Core action: the first tap or decision
- Data captured: event fields, attachments, notes, timestamps, dog scope
- Constraints: offline, native permissions, accessibility, safety, premium gating

## Exit Criteria

- the first-run state is specified
- the routine path is one-tap where possible
- offline behavior is explicit
- premium gating is ethical and clear
- analytics events are named
- validation commands are listed

## Skill Pairing Matrix

- routine logging and journaling UI: `feature-workflow` + `ui-ux-journal` + `react-native-tamagui`
- Apple Health, Google Fit, notifications, camera, or clinic lookup: add `ios-android-readiness`
- paywall, onboarding, streaks, or memory sharing: add `monetization-engagement`
- triage, toxicity, first aid, or vet exports: add `health-safety`
