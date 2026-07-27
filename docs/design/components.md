# BarkLog Component Registry

## Purpose

This document defines the target reusable component inventory for BarkLog under the canonical product and engineering spec.

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Rules

- Reuse shared components before building screen-specific wrappers.
- Preserve BarkLog tokens exactly.
- Prefer components that support both light and dark themes where applicable.
- Event color, premium gating, safety warnings, and accessibility states must be componentized rather than reimplemented ad hoc.

## Core UI Primitives

### AppScreen

- Responsibility: shared safe-area screen shell with padding, scroll handling, and background token wiring.
- Reuse for: all full-screen BarkLog routes.

### AppCard

- Responsibility: bordered BarkLog card with `Surface` background and token-driven spacing.
- Reuse for: summaries, settings rows, AI insight blocks, emergency callouts, and dashboard modules.

### PrimaryButton

- Responsibility: main CTA using `Ink` background and BarkLog radius contract.
- Reuse for: save, continue, export, subscribe, and confirm actions.

### SecondaryButton

- Responsibility: bordered or surface CTA for low-priority actions.
- Reuse for: compare, share, print, not now, and alternate plan selection.

### TextInputField

- Responsibility: labeled form field with BarkLog typography and error states.
- Reuse for: auth, onboarding, profile, medication, and expense forms.

### ToggleRow

- Responsibility: labeled toggle with explanation copy.
- Reuse for: permissions, notification settings, health-data sync, and medication with-food options.

### Pill

- Responsibility: rounded tokenized chip or badge.
- Reuse for: overlines, trial badges, filters, categories, and premium states.

### Avatar

- Responsibility: dog or user circular identity image with fallback initials or emoji.
- Reuse for: home header, profile header, dog switcher, and household overview.

### Toast

- Responsibility: lightweight success or feedback message for instant actions.
- Reuse for: logged event confirmation and save confirmations.

### LoadingSkeleton

- Responsibility: loading placeholder for every async screen.
- Reuse for: all loading states across auth, home, insights, and profile surfaces.

## Navigation Components

### TabBar

- Responsibility: bottom tab navigation for Home, Timeline, Insights, and Profile.
- Reuse for: root app navigation only.

### AppHeader

- Responsibility: standard screen header with title, back action, and optional trailing action.
- Reuse for: non-tab screens and pushed routes.

### BottomSheet

- Responsibility: bottom-sheet presentation shell.
- Reuse for: Dog Switcher and Premium Gate.

### DatePillRow

- Responsibility: horizontal day or range selector.
- Reuse for: Timeline and time-range selectors.

## Home and Logging Components

### EventButton

- Responsibility: one-tap event action tile using BarkLog event tokens, emoji, label, haptics, and pressed states.
- Reuse for: Poop, Pee, Meal, Walk, Medication, Symptom, Weight, and Grooming actions.

### DailySummaryCard

- Responsibility: concise same-day event summary.
- Reuse for: Home.

### AlertBanner

- Responsibility: inline anomaly or warning message with semantic tone.
- Reuse for: Home anomaly alerts and trial reminders.

### EventFormSection

- Responsibility: grouped section shell for event-detail screens.
- Reuse for: detail logging flows and medication forms.

### ChoiceChipGroup

- Responsibility: single-select or multi-select BarkLog chip group.
- Reuse for: symptom categories, symptom values, meal type, poop quality, side effects, and filters.

### TimelineRow

- Responsibility: event row with emoji or icon, event details, timestamp, and optional severity styling.
- Reuse for: Timeline.

### PhotoAttachmentField

- Responsibility: optional photo picker and preview slot.
- Reuse for: event details, symptoms, expenses, and record attachments.

## Insight Components

### StatCard

- Responsibility: compact metric card for weekly and monthly dashboards.
- Reuse for: Insights and Profile quick stats.

### AIInsightCard

- Responsibility: premium-tinted narrative card with overline and optional lock state.
- Reuse for: Weekly Dashboard and Memory Book narrative modules.

### ChartCard

- Responsibility: chart container with title, range, and loading / empty states.
- Reuse for: weekly charts, monthly trends, and expense tracking.

### ReportPreviewCard

- Responsibility: report section preview with export actions.
- Reuse for: Vet Visit Prep.

### ChatMessageBubble

- Responsibility: user and assistant message bubble system.
- Reuse for: Ask BarkLog AI.

## Safety Components

### ToxicityResultCard

- Responsibility: severity-coded toxicity result with next-step actions.
- Reuse for: Toxicity Scanner.

### EmergencyContactCard

- Responsibility: tappable emergency call and clinic action.
- Reuse for: Emergency SOS.

### FirstAidStepCard

- Responsibility: numbered instructional step with illustration and warning slots.
- Reuse for: First Aid topics.

### TriageQuestionBlock

- Responsibility: stepwise triage question and answer selection shell.
- Reuse for: Vet or Wait.

## Profile, Premium, and Multi-Dog Components

### AccordionSection

- Responsibility: expandable profile section wrapper.
- Reuse for: medications, vaccinations, grooming, allergies, vet info, and export sections.

### PlanCard

- Responsibility: premium plan display with price, savings, and CTA.
- Reuse for: Paywall and Subscription Management.

### PremiumGateSheet

- Responsibility: compact locked-feature explainer.
- Reuse for: Premium Gate.

### DogSwitcherCard

- Responsibility: dog selection row with active and inactive states.
- Reuse for: Dog Switcher.

### HouseholdDogRow

- Responsibility: per-dog summary row with quick actions.
- Reuse for: Household Overview.

### MemoryBookCard

- Responsibility: shareable monthly highlight card.
- Reuse for: Memory Book.

### ExpenseRow

- Responsibility: expense list row with amount, category, date, and receipt affordance.
- Reuse for: Expense Tracker.
