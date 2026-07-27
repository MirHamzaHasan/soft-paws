# BarkLog Pre-Implementation Readiness

## Purpose

This document lists the setup work and confirmations required before feature implementation starts against the canonical BarkLog spec.

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Already Locked by Spec

- product positioning
- free versus premium boundaries
- design tokens
- event color system
- navigation architecture
- target file structure
- database schema
- AI prompt boundaries
- RevenueCat product set
- haptics, animation, dark mode, and accessibility rules

## Foundation Setup Checklist

### Project Setup

- Expo app scaffold aligned to the target route structure
- TypeScript strict mode enabled
- Tamagui installed and configured with BarkLog tokens
- Inter font loading strategy defined
- Lucide React Native installed and tree-shaking confirmed

### Backend and Data

- Supabase project created
- all SQL tables and policies migrated
- Supabase Storage buckets defined for dog photos, receipts, and event images
- WatermelonDB schema mirrors the event and profile model
- local-first event write path designed
- background sync strategy defined from WatermelonDB to Supabase

### Auth and Subscription

- Supabase Auth configured for email/password
- RevenueCat app and products configured:
  - `barklog_annual`
  - `barklog_monthly`
- trial timestamps and entitlement checks mapped into the user model

### AI and Edge Functions

- Supabase Edge Function scaffolds created:
  - `generate-weekly-insight`
  - `generate-vet-report`
  - `toxicity-lookup`
- AI provider API keys stored server-side only
- no direct client path to AI providers exists

### Native Integrations

- Expo Notifications strategy defined for:
  - medication reminders
  - anomaly alerts
- HealthKit and Google Fit scope and permission flow documented
- camera permissions and fallback behavior documented for toxicity scanning and event photos
- location behavior defined for emergency clinic lookup

### Design and Content Dependencies

- breed list source selected
- toxicity knowledge base source selected
- American Red Cross first-aid content acquisition confirmed
- healthy weight range source confirmed
- emergency clinic lookup provider confirmed
- body-map illustration asset defined
- chart style contract defined

## Readiness Questions Before Coding

Answer `yes` before implementation starts:

1. Is the new canonical spec accepted as the repo source of truth?
2. Are old prototype-only assumptions explicitly retired or marked legacy?
3. Are the BarkLog route groups and file structure accepted as implementation targets?
4. Is local-first logging fully defined from tap to eventual sync?
5. Are AI, toxicity, and emergency safety boundaries approved?
6. Are premium entitlements mapped to exact features?
7. Are design tokens loaded into the styling system?
8. Are environment variables separated into client-safe and server-only groups?
9. Are analytics, Sentry, and notification responsibilities assigned?
10. Are store-launch dependencies known for iOS and Android?

## Start Gate

Do not start BarkLog feature implementation until:

- foundation work is scheduled
- data-layer setup is scheduled
- auth and entitlement ownership is clear
- content sources for safety surfaces are identified
- the team agrees that the canonical spec, not the older prototype docs, governs future work
