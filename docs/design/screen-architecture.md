# BarkLog Screen Architecture

## Canonical Source

This doc maps the route and screen structure defined in [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md).

## Primary Tab Architecture

### Tabs

- Home: `app/(tabs)/index.tsx`
- Timeline: `app/(tabs)/timeline.tsx`
- Insights: `app/(tabs)/insights.tsx`
- Profile: `app/(tabs)/profile.tsx`

### Pushed and Modal Surfaces

- Event detail logging: `app/log/[eventType].tsx`
- Symptom logging: `app/log/symptom.tsx`
- Timeline event detail: `app/event/[id].tsx`
- Photo Journal: `app/photo-journal.tsx`
- Monthly Trends: `app/monthly-trends.tsx`
- Vet Visit Prep: `app/vet-prep.tsx`
- Ask BarkLog AI: `app/ask-ai.tsx`
- Toxicity Scanner: `app/toxicity.tsx`
- Emergency SOS: `app/emergency.tsx`
- First Aid Guide: `app/first-aid/[topic].tsx`
- Vet or Wait Triage: `app/triage.tsx`
- Add / Edit Medication: `app/add-medication.tsx`
- Settings: `app/settings.tsx`
- Memory Book: `app/memory-book.tsx`
- Expense Tracker: `app/expenses.tsx`
- Paywall: `app/paywall.tsx`
- Subscription Management: `app/subscription.tsx`
- Dog Switcher: `app/dog-switcher.tsx`
- Household Overview: `app/household.tsx`
- Add Dog: `app/add-dog.tsx`

## Auth and Onboarding Route Groups

### Auth

- `app/(auth)/welcome.tsx`
- `app/(auth)/sign-up.tsx`
- `app/(auth)/sign-in.tsx`
- `app/(auth)/forgot-password.tsx`

### Onboarding

- `app/(onboarding)/dog-profile.tsx`
- `app/(onboarding)/permissions.tsx`
- `app/(onboarding)/trial-welcome.tsx`

## Screen Inventory

### Authentication

- `A1` Welcome / Splash
- `A2` Sign Up
- `A3` Sign In
- `A4` Forgot Password

### Onboarding

- `O1` Dog Profile Setup
- `O2` Permissions
- `O3` Trial Welcome

### Home and Logging

- `H1` Home
- `H2` Log Poop Detail
- `H3` Log Meal Detail
- `H4` Log Walk Detail
- `H5` Log Medication Detail
- `H6` Log Symptom

### Timeline

- `T1` Timeline
- `T2` Event Detail
- `T3` Photo Journal Gallery

### Insights

- `I1` Weekly Dashboard
- `I2` Monthly Trends
- `I3` Vet Visit Prep
- `I4` Ask BarkLog AI

### Emergency and Safety

- `E1` Toxicity Scanner
- `E2` Emergency SOS
- `E3` First Aid Guide
- `E4` Vet or Wait Triage

### Profile and Settings

- `P1` Dog Profile Hub
- `P2` Add / Edit Medication
- `P3` Settings
- `P4` Memory Book
- `P5` Expense Tracker

### Subscription

- `S1` Paywall
- `S2` Subscription Management
- `S3` Premium Gate

### Multi-Dog

- `M1` Dog Switcher
- `M2` Household Overview
- `M3` Add Dog

## Journey Map

### Journey A: New User to First Log

- Welcome
- Sign Up
- Dog Profile Setup
- Permissions
- Trial Welcome
- Home
- first event logged

### Journey B: Daily Check-In

- Home
- one-tap event logging
- optional detail logging
- same-day summary refresh
- Timeline verification

### Journey C: Concern to Action

- Home or Profile
- Symptom logging or Toxicity Scanner
- Vet or Wait or Emergency SOS
- First Aid topic if relevant
- call, share, or continue monitoring

### Journey D: Observation to Insight

- Home logging over time
- Timeline review
- Weekly Dashboard
- AI observation or AI chat
- Vet Visit Prep export

### Journey E: Single Dog to Household

- Home
- Dog Switcher
- Add Dog
- Household Overview

## Architecture Rules

- Home is the highest-priority and highest-frequency surface.
- Timeline is the factual source of truth for what was logged.
- Insights is the meaning layer over event history.
- Profile is the management and record-keeping layer.
- Emergency and toxicity actions must stay reachable from high-frequency surfaces.
- Premium gates should sit on advanced value surfaces, not basic care surfaces.
