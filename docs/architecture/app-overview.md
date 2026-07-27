# Architecture: App Overview

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## System Shape

BarkLog is a mobile app built around four cooperating layers:

1. Expo client
2. Local-first data layer
3. Supabase backend
4. Cross-cutting product services

## Client Layer

- Expo-managed React Native app
- Expo Router for route ownership
- Tamagui for BarkLog styling tokens and primitives
- Zustand for local UI and session-adjacent state
- TanStack Query for server state and mutation orchestration

## Local-First Data Layer

- WatermelonDB is the source of truth for local event persistence
- event logging writes must complete locally before any network dependency
- care calendar tasks also persist locally first in WatermelonDB before Premium sync
- photo baseline records persist locally first in WatermelonDB before Premium sync
- local data is later synchronized to Supabase in the background
- offline use is a product requirement, not an enhancement

## Backend Layer

- Supabase Auth for account lifecycle
- Supabase Postgres for BarkLog relational data
- Supabase Storage for photos and file exports
- Supabase Edge Functions for:
  - weekly insight generation
  - generated care summaries
  - training insight generation
  - vet-report generation
  - vet share-link resolution
  - household invite acceptance
  - toxicity lookup

## Cross-Cutting Services

- RevenueCat for entitlements and subscription state
- Expo Notifications for medication reminders and anomaly alerts
- Expo Notifications for explicit opt-in Care Calendar reminders
- HealthKit and Google Fit for walk and activity import
- Mixpanel for analytics
- Sentry for error monitoring

## Core Data Flow

1. User taps an event action on Home.
2. The event is written to WatermelonDB immediately.
3. The UI confirms the save with haptic plus toast.
4. Background sync pushes the event to Supabase.
5. Queries and derived views refresh from synchronized state.

Premium household collaboration expands sync scope from owned dogs to permitted shared dogs. RLS helpers and the `barklog-sync` Edge Function must both enforce role permissions before shared dog data is read or written.

## Care Calendar Boundary

- Care Calendar lives at `/care-calendar`.
- Free users can create local refill, preventive, grooming, vaccination, vet follow-up, training practice, and custom care tasks.
- Care task reminders are opt-in per task and must not block local saves when notification permission is denied.
- Premium smart automation covers care calendar sync, household coordination, and future smart checklists.

## Photo Baseline Boundary

- Photo Baseline Tracker lives at `/photo-baselines`.
- Free users can save dated visual references locally with category, title, body area, photo reference URI, and notes.
- The feature organizes owner observations only; it does not analyze photos or describe conditions.
- Premium covers photo compare, cloud backup, restore, future AI photo summaries, and future share-link inclusion.

## Safety Boundary

- Safety Center is a free offline-first route at `/safety`, with `/safety-center` as an alias.
- Emergency SOS, first-aid basics, CPR timer entry, core toxicity lookup, poison-control actions, and the local emergency card do not depend on Premium or AI.
- Safety content carries source/version/review metadata and stays factual, escalation-oriented, and non-diagnostic.

## AI Boundary

- AI providers are never called from the client.
- All AI access flows through Supabase Edge Functions.
- AI copy remains observational and non-diagnostic.
