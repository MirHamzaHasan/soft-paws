# BarkLog Best-In-Market Product and Monetization Plan

Status: `strategy proposal`

Last updated: `2026-04-27`

This document is a standalone product and monetization strategy for the next BarkLog planning cycle. It does not replace the canonical source of truth until the decisions here are explicitly approved and merged into [barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md).

## 1. Executive Direction

BarkLog should become an offline-first dog care operating system: fast enough for daily one-tap logging, complete enough to replace scattered notes and screenshots, trustworthy enough for stressful health moments, and intelligent enough to turn consistent tracking into useful summaries.

The core business model should be generous on-device and paid for leverage:

- Free users can track a complete dog care record offline on one device.
- Premium users unlock cloud sync, backup, restore, AI, summaries, advanced reports, household sharing, training tracking, and automation.
- Emergency and safety-critical guidance stays free and direct.
- Manual export remains free so BarkLog keeps the data-freedom promise.

This model lets BarkLog compete with four categories at once:

- pet health record apps: BarkLog is faster, dog-only, and more useful day to day
- hardware health trackers: BarkLog is software-only and does not require a collar purchase
- vet-connected apps: BarkLog is owner-controlled and useful even without a clinic relationship
- training apps: BarkLog connects training to real mood, behavior, and care history

## 2. Strategic Positioning

### Core Promise

Daily dog care, tracked offline in seconds, upgraded into cloud-backed intelligence when the owner wants summaries, sync, training progress, or AI support.

### Best-In-Market Thesis

BarkLog should win by combining five things that are usually split across different apps:

1. **Fast local logging**
   - one-tap daily events
   - full detail logging when needed
   - usable without network

2. **Complete care history**
   - health, behavior, mood, training, medications, records, expenses, photos, and notes
   - local Timeline as the factual record
   - free manual export

3. **Trustworthy safety layer**
   - emergency SOS
   - first-aid basics
   - core toxicity lookup
   - sober escalation language

4. **Premium intelligence**
   - weekly and monthly summaries
   - trend detection
   - AI agents
   - vet-ready reports
   - training personalization

5. **Premium continuity**
   - cloud backup
   - cross-device sync
   - restore
   - multi-dog and household sharing
   - sitter and vet links

### Competitive Frame

| Category | Competitor Pattern | BarkLog Advantage |
| --- | --- | --- |
| Hardware trackers | Activity, sleep, alerts, GPS, device dependency | No hardware required; logs behavior, symptoms, meds, training, expenses, and records |
| Pet record apps | Records, reminders, appointments, multi-pet storage | Dog-only depth, faster daily loop, AI summaries, richer training and behavior layer |
| Vet-connected apps | Clinic reminders, appointments, prescriptions, provider records | Owner-controlled record, useful across every vet, free manual export |
| Training apps | Guided courses, behavior help, progress plans, assistant chat | Training tied to real care history, mood, behavior, and session outcomes |
| AI pet apps | Instant answers and generic recommendations | Context-aware, non-diagnostic AI grounded in the dog's logged history |

## 3. Monetization Strategy

### Chosen Packaging

Use one paid tier: `Premium`.

Keep the paid model easy to understand:

- Free = offline tracking and safety basics on this device
- Premium = backup, sync, summaries, AI, reports, training tracking, and sharing

### Paid Boundary

Premium should unlock leverage, not basic care.

Paid:

- cloud backup
- cross-device sync
- restore from cloud
- multi-dog sync
- household sharing
- sitter/vet sharing links
- AI summaries
- Ask BarkLog AI
- specialized AI agents
- generated health, behavior, mood, medication, expense, and training summaries
- training progress tracking
- training session analytics
- personalized training insights
- advanced trend dashboards
- vet-ready PDF reports
- photo compare
- memory book generation
- advanced automation

Free:

- offline local logging
- local Timeline on the same device
- manual CSV export
- manual PDF export
- basic medication reminders on-device
- emergency SOS
- first-aid basics
- core toxicity lookup without AI
- one static training program per week
- local notes and photos

### Sync Decision

All cloud sync is Premium.

This means the free plan must make the device-local boundary obvious:

- "Saved on this device"
- "Export anytime"
- "Upgrade for backup and sync"
- "Premium keeps BarkLog backed up across devices"

Free users must not be led to believe their data is backed up when it is not. If account creation remains part of the free flow, the app must clearly separate account identity from cloud data backup.

### Summary Decision

Raw logs are free. Generated summaries are paid.

Free users can view and export the facts they entered:

- individual events
- local Timeline
- raw records
- notes
- photos
- medications
- expenses

Premium users get generated interpretation layers:

- weekly health summaries
- monthly trend summaries
- behavior summaries
- mood summaries
- medication adherence summaries
- nutrition consistency summaries
- expense summaries
- training summaries
- AI-generated vet prep

### Training Decision

One static training program per week is free.

Free training includes:

- browsing static weekly program
- reading static steps
- manually trying the program offline
- no progress analytics
- no cloud tracking
- no personalized AI
- no session history sync

Premium training includes:

- unlimited program access
- enrollment and progress tracking
- training sessions
- success ratings
- program completion stats
- behavior and mood correlation
- personalized training insight
- cross-device training continuity

## 4. Paid / Not-Paid Rules

### Always Free

- First logged event
- Basic offline logging
- Local Timeline
- Manual export
- Emergency SOS
- First-aid basics
- Core toxicity lookup
- Basic medication reminder scheduling
- Viewing raw local records
- Deleting user data

### Always Premium

- Cloud writes for backup and sync
- Restore from cloud
- Cross-device continuity
- Household collaboration
- Share links with live or cloud-backed data
- AI generation
- Generated summaries
- Advanced charts and trend interpretation
- Personalized training progress
- Premium reports and polished exports beyond basic manual export

### Never Monetize in a Way That Erodes Trust

- Do not block an urgent emergency action.
- Do not block a first-aid instruction needed in the moment.
- Do not hide user-entered data behind a paywall.
- Do not block data deletion.
- Do not make the free user think cloud backup exists when it does not.
- Do not use medical fear to force conversion.

### Good Upgrade Moments

- User tries to enable backup.
- User opens summary card.
- User asks BarkLog AI.
- User tries to start tracking training progress.
- User tries to generate a vet-ready report.
- User adds a second dog with sync needs.
- User invites a household member or sitter.
- User tries to restore data on a new device.

### Bad Upgrade Moments

- During first log.
- Inside Emergency SOS.
- Before showing basic toxicity result.
- While saving medication or symptom data.
- When a user tries to export raw data.
- After frightening health language.

## 5. Freemium Feature Matrix

| Feature | Free Offline | Premium Sync | Premium AI | Premium Training | Future |
| --- | --- | --- | --- | --- | --- |
| Poop, pee, meal, walk logs | Yes | Cloud backup and sync | Summaries | No | Health imports |
| Medication logs | Yes | Cloud backup and sync | Adherence summary | No | Refill integrations |
| Symptom logs | Yes | Cloud backup and sync | Pattern summary | No | Vet follow-up mode |
| Mood logs | Yes | Cloud backup and sync | Mood pattern summary | Training context | Mood trend widgets |
| Behavior logs | Yes | Cloud backup and sync | Trigger and frequency summary | Training context | Behavior plan library |
| Grooming logs | Yes | Cloud backup and sync | Routine summary | No | Groomer handoff |
| Weight logs | Yes | Cloud backup and sync | Trend summary | No | Goal planning |
| Notes and photos | Yes | Cloud backup and sync | Photo change summaries | Training context | Photo baseline tracker |
| Timeline | Local only | Cross-device | Timeline AI recap | Training events | Shared timeline |
| Manual CSV export | Yes | No added requirement | No | No | No |
| Manual PDF export | Yes | No added requirement | No | No | No |
| Vet-ready report | Basic manual export | Cloud-backed report data | AI summary and questions | Training section | Vet share portal |
| Emergency SOS | Yes | Saved contacts sync | No urgent AI gate | No | Clinic lookup |
| First-aid basics | Yes | Offline pack sync | No urgent AI gate | No | Source updates |
| Core toxicity lookup | Yes | Search history sync | Camera/AI assist | No | Weight-aware ingestion |
| Training weekly program | One static program/week | No progress sync | No personalization | Static only | Community programs |
| Training hub | Browse limited | Sync program access | Program suggestions | Unlimited tracking | Trainer marketplace |
| Training sessions | Local attempt note only | Session backup | Session insights | Full tracking | Video review |
| Household sharing | No | Yes | Care summaries | Shared progress | Roles and permissions |
| Multi-dog | One dog local | Unlimited synced dogs | Multi-dog insights | Multi-dog training | Breeder/foster mode |
| Expenses | Local tracking | Cloud backup and sync | Expense summary | No | Insurance export |
| Memory book | Basic saved photos | Cloud media | AI story | Milestones | Printed products |
| Ask BarkLog AI | No or tiny trial quota | Context sync | Yes | Training context | Agent center |

## 6. Full Feature Catalog

### Care Logging

Core events:

- Poop
- Pee
- Meal
- Walk
- Medication
- Symptom
- Grooming
- Weight
- Mood
- Behavior
- Training attempt
- Note
- Photo

Best-in-market additions:

- water intake
- sleep/rest observation
- vomiting
- coughing/sneezing
- seizure episode tracking
- heat cycle tracking where relevant
- allergy flare log
- mobility observation
- dental care
- parasite prevention
- vet visit
- vaccination
- lab result
- prescription refill
- body condition score
- appetite score
- pain/discomfort observation, worded carefully as owner-observed behavior

Free behavior:

- log locally
- view local Timeline
- export raw data manually

Premium behavior:

- sync and backup
- trend summaries
- recurring patterns
- anomaly-style observations without diagnosis

### Health Records

Record types:

- vaccinations
- medications
- allergies
- known conditions
- vet contacts
- insurance details
- microchip
- license
- diet and feeding instructions
- lab results
- surgery/procedure history
- parasite prevention
- dental records
- emergency card

Best-in-market additions:

- document wallet
- recurring care calendar
- refill planning
- vet follow-up mode
- sitter handoff mode
- boarding packet
- emergency medical summary

Free behavior:

- local record storage
- manual export

Premium behavior:

- cloud backup
- share links
- generated vet report
- AI-generated visit prep

### Mood and Behavior

Mood values:

- happy
- calm
- anxious
- lethargic
- hyper
- clingy
- off

Behavior values:

- barking
- pulling
- jumping
- aggression
- anxiety
- destructive
- reactivity
- other

Best-in-market additions:

- trigger heatmap
- context breakdown
- time-of-day behavior pattern
- pre/post walk mood comparison
- guest reactivity tracker
- separation comfort tracker
- training correlation

Free behavior:

- offline event logging
- local Timeline

Premium behavior:

- behavior summaries
- mood summaries
- AI pattern observations
- training personalization

### Training

Training surfaces:

- free weekly static program
- premium training hub
- program detail
- session logger
- progress tracker
- completion summary
- training insight card

Program categories:

- obedience
- leash skills
- puppy basics
- socialization
- behavior modification
- tricks
- enrichment
- senior dog enrichment

Best-in-market additions:

- 10-minute daily plan
- behavior-linked recommendations
- breed and age context
- progress history
- session success ratings
- mood during training
- household trainer assignment
- "what to practice today" card
- desensitization sound library
- calm-down routine library
- enrichment games library

Free behavior:

- one static program per week
- read-only steps
- no tracked progress

Premium behavior:

- unlimited programs
- enrollment
- tracking
- sync
- AI personalization
- progress analytics

### Safety

Safety surfaces:

- Emergency SOS
- first-aid basics
- toxicity lookup
- emergency card
- poison-control call action
- vet contact call action
- share medical summary

Best-in-market additions:

- offline emergency pack
- nearest emergency clinic lookup when location is enabled
- urgent symptom checklist
- safe transport checklist
- CPR timer
- toxin dose context where evidence-backed
- medication list handoff

Free behavior:

- urgent actions
- first-aid basics
- core toxicity lookup
- emergency card local view

Premium behavior:

- cloud-synced emergency card
- share link
- AI-assisted non-urgent prep
- saved safety history

Do not paywall safety-critical instructions.

### AI Agents

AI must run only through Supabase Edge Functions. No client-side AI provider calls.

Premium agents:

- Weekly Health Summary Agent
- Monthly Trends Agent
- Ask BarkLog AI
- Vet Prep Agent
- Training Observer Agent
- Behavior Pattern Agent
- Mood Pattern Agent
- Medication Adherence Agent
- Nutrition Consistency Agent
- Expense Summary Agent
- Memory Book Agent
- Care Coordinator Agent

Agent rules:

- summarize logged facts
- state uncertainty
- never diagnose
- never replace a vet, trainer, or behaviorist
- route urgent situations to Emergency SOS or vet contact
- keep output short and useful

### Reports and Exports

Free:

- raw CSV export
- basic PDF export
- local data download

Premium:

- vet-ready report
- shareable secure link
- AI visit summary
- question list for vet
- medication adherence section
- symptom timeline section
- behavior and mood section
- training section
- expense report
- household care report

### Household Sharing

Premium:

- invite caregiver
- sitter mode
- vet share link
- household activity log
- role-based permissions
- who logged what
- handoff notes
- shared medication schedule

Free:

- local single-device tracking only

### Integrations

Future:

- Apple Health import
- Google Fit import
- calendar export
- reminders integration
- pet insurance export
- vet practice integrations
- wearable import where available

Integration rule:

- Imports are additive. BarkLog must stay useful without hardware or third-party integrations.

### Memory and Lifestyle

Free:

- local photos
- notes
- basic milestones

Premium:

- AI memory book
- monthly story card
- collage
- milestone recap
- shareable media
- printable export

### Expenses

Free:

- local expense logging
- local list
- manual export

Premium:

- category summaries
- monthly spend trends
- annual report
- reimbursement packet
- insurance claim support
- recurring expense forecast

## 7. AI Agent Catalog

### Weekly Health Summary Agent

Purpose:

- summarize one week of logged health and care activity

Inputs:

- events
- medications
- mood
- behavior
- symptoms
- walks
- meals
- weight

Premium output:

- one short non-diagnostic observation
- notable changes
- gentle follow-up prompt

### Vet Prep Agent

Purpose:

- prepare a clean vet visit summary from logged facts

Inputs:

- selected date range
- symptoms
- meds
- meals
- stool
- weight
- behavior
- photos
- owner notes

Premium output:

- factual report
- timeline
- questions to ask the vet
- export-ready PDF

### Training Observer Agent

Purpose:

- connect training progress to recent behavior and mood logs

Inputs:

- active program
- sessions
- success ratings
- mood during sessions
- behavior logs

Premium output:

- short encouragement
- progress pattern
- suggested pacing adjustment

### Behavior Pattern Agent

Purpose:

- summarize behavior frequency, triggers, and contexts

Inputs:

- behavior events
- triggers
- intensity
- duration
- location context

Premium output:

- behavior count trend
- common trigger summary
- non-diagnostic observation

### Medication Adherence Agent

Purpose:

- summarize medication consistency

Inputs:

- medication schedule
- medication logs
- missed doses
- side effect notes

Premium output:

- adherence recap
- refill reminders
- vet-prep notes

### Nutrition Consistency Agent

Purpose:

- summarize meal pattern consistency

Inputs:

- meals
- amount
- food brand
- treats
- appetite notes
- weight changes

Premium output:

- consistency summary
- changes to discuss with vet when relevant

### Expense Summary Agent

Purpose:

- summarize dog care spending

Inputs:

- expenses
- categories
- receipts
- recurring items

Premium output:

- monthly and annual spend summary
- category breakdown
- export packet

### Memory Book Agent

Purpose:

- create emotional monthly recaps

Inputs:

- photos
- milestones
- walks
- training wins
- notes

Premium output:

- short story
- collage suggestion
- shareable card

### Care Coordinator Agent

Purpose:

- help a household understand what happened and what is due next

Inputs:

- household logs
- upcoming reminders
- missed tasks
- caregiver notes

Premium output:

- handoff summary
- next-care checklist

## 8. Screen Architecture

### Home

First viewport:

- dog avatar and current dog selector
- today heading
- primary 2x2 event grid: Poop, Pee, Meal, Walk
- medication action
- secondary actions: Symptom, Weight, Grooming, Mood, Behavior
- Training today card
- Safety quick actions

Free state:

- local save indicator
- "Saved on this device" copy where sync status matters

Premium state:

- cloud sync indicator
- smart daily summary
- personalized "what changed" card

### Timeline

Purpose:

- factual record of all logged events

Free:

- local timeline
- filters
- raw event detail
- manual export

Premium:

- synced timeline
- smart recap
- cross-device history
- advanced filters
- shareable range

### Insights

Purpose:

- paid summary and trend surface

Premium sections:

- weekly health summary
- mood and behavior summary
- medication adherence
- activity and walk trends
- meal consistency
- weight trend
- training summary
- expense snapshot

Free state:

- preview cards with locked generated summaries
- explanation that raw logs remain available in Timeline

### Training Hub

Purpose:

- browse and continue training

Free:

- one static weekly program
- read-only steps

Premium:

- active programs
- available programs
- progress bars
- daily practice card
- session history
- program recommendations

### Training Program Detail

Free:

- weekly program steps only
- no tracked completion

Premium:

- enroll
- current step
- log session
- mark complete
- progress stats
- AI training observation

### AI Agents

Purpose:

- central premium surface for specialized AI help

Agents:

- Ask BarkLog AI
- Health Summary
- Vet Prep
- Training Observer
- Behavior Patterns
- Medication Adherence
- Expense Summary
- Memory Book

Free state:

- explain agent capabilities
- no direct AI call except any separately approved trial quota

Premium:

- use synced and local context through approved backend APIs

### Health Records

Purpose:

- structured long-term dog profile and medical record

Sections:

- medications
- vaccinations
- allergies
- conditions
- vet contacts
- insurance
- documents
- microchip
- diet
- emergency card

Free:

- local records and export

Premium:

- cloud backup
- share link
- generated vet packet

### Safety Center

Purpose:

- trusted urgent and semi-urgent care surface

Sections:

- Emergency SOS
- toxicity lookup
- first-aid basics
- CPR timer
- emergency card
- vet contacts

Free:

- all urgent actions
- basic content

Premium:

- synced emergency card
- saved emergency packet
- optional AI prep for non-urgent summaries

### Vet Prep

Purpose:

- convert raw logs into appointment-ready context

Free:

- basic manual export

Premium:

- generated report
- PDF formatting
- visit question list
- shareable vet link

### Profile

Purpose:

- dog identity, records, settings, and feature entry points

Sections:

- dog details
- care stats
- health records
- training
- household
- exports
- subscription
- settings

### Household

Premium-only purpose:

- shared care coordination

Sections:

- members
- roles
- shared dogs
- handoff notes
- care log by person
- sitter mode

### Sync and Backup

Purpose:

- make cloud value explicit

Free state:

- data is local to this device
- manual export available
- upgrade for backup and restore

Premium state:

- backup status
- last sync
- restore
- connected devices
- conflict handling

### Paywall

Purpose:

- explain Premium at real value moments

Primary claims:

- Back up and sync your dog's care record
- Unlock AI summaries and agents
- Track training progress
- Generate vet-ready reports
- Share care with family, sitters, and vets

Avoid:

- emergency fear
- hiding basic logs
- implying diagnosis

### Settings

Sections:

- account
- subscription
- sync and backup
- notifications
- units
- privacy
- export data
- delete data
- about

## 9. Paywall Moments and Copy

### Enable Cloud Sync

Trigger:

- user taps sync, backup, restore, add device, or cloud status

Copy direction:

- "Back up BarkLog and keep your dog's record synced across devices."

Do not say:

- "Your dog's data may be lost unless you pay."

### Open Generated Summary

Trigger:

- user taps weekly, monthly, behavior, mood, expense, or training summary

Copy direction:

- "Premium turns your logs into clear weekly patterns."

Do not block:

- raw Timeline
- individual events

### Ask AI

Trigger:

- user opens Ask BarkLog AI or agent center

Copy direction:

- "Ask questions using your dog's logged history."

Safety note:

- always include non-diagnostic boundary

### Track Training Progress

Trigger:

- user starts enrollment, logs session, or views progress

Copy direction:

- "Premium tracks progress and adapts insights using mood and behavior logs."

Free alternative:

- weekly static program remains readable

### Generate Vet Report

Trigger:

- user taps vet-ready report, share link, or AI prep

Copy direction:

- "Create a clean report from your logs for your next appointment."

Free alternative:

- manual export remains available

### Add Household Sharing

Trigger:

- user invites caregiver, sitter, or vet

Copy direction:

- "Share care safely with the people helping your dog."

## 10. Safety and Trust Language

### Required Language Patterns

Use:

- "BarkLog organizes the patterns you logged."
- "This may be worth discussing with your vet."
- "If this feels urgent, use Emergency SOS or contact a vet now."
- "Training insights are supportive observations, not a replacement for a trainer or behaviorist."

Avoid:

- "Your dog has..."
- "This means..."
- "BarkLog diagnosed..."
- "You do not need a vet."
- "This training plan will fix..."

### Health Risk Boundaries

Low risk:

- raw logs
- neutral timeline
- local records

Medium risk:

- summaries
- trend cards
- mood and behavior observations

High risk:

- triage
- toxicity
- emergency
- first-aid

High-risk urgent paths must not require Premium.

## 11. Roadmap

### Phase 1: Foundation

Goal:

- keep the current production-hardened base stable

Work:

- confirm local logging reliability
- keep export data-freedom guarantees
- keep safety surfaces free
- keep RevenueCat entitlement path simple

### Phase 2: Logging Expansion

Goal:

- make BarkLog's raw record broader than competitors

Work:

- complete Behavior
- add water, sleep/rest, vomiting, cough/sneeze, seizure, mobility, appetite, dental, parasite prevention, and vet visit logs
- keep all new raw logs offline-first and free

### Phase 3: Premium Sync

Goal:

- convert from local-only trust to paid continuity

Work:

- clear local/cloud state model
- cloud backup
- restore
- cross-device sync
- sync status surface
- Premium paywall at backup enablement

### Phase 4: AI Summaries

Goal:

- make Premium useful every week

Work:

- weekly health summary
- behavior summary
- mood summary
- medication adherence summary
- expense summary
- nutrition consistency summary
- monthly trends

### Phase 5: Training Platform

Goal:

- connect training to real care context

Work:

- seed programs
- Training Hub
- Program Detail
- session logger
- progress tracking
- training AI insight
- one static free weekly program

### Phase 6: Household Collaboration

Goal:

- make BarkLog useful for families, sitters, and care teams

Work:

- shared caregivers
- roles
- sitter mode
- vet share link
- household handoff

### Phase 7: Advanced Automation

Goal:

- deepen premium utility without noisy notifications

Work:

- refill planning
- care calendar
- preventive care schedule
- report automation
- photo baseline tracker
- integrations

## 12. Future Task Backlog

After task032, continue with these task files in order:

- [task033-local-only-free-mode-and-sync-status-ui.md](../../tasks/task033-local-only-free-mode-and-sync-status-ui.md)
- [task034-expanded-offline-log-types.md](../../tasks/task034-expanded-offline-log-types.md)
- [task035-ai-agent-center.md](../../tasks/task035-ai-agent-center.md)
- [task036-health-and-behavior-summary-suite.md](../../tasks/task036-health-and-behavior-summary-suite.md)
- [task037-static-free-training-program-rotation.md](../../tasks/task037-static-free-training-program-rotation.md)
- [task038-vet-share-link-and-report-upgrade.md](../../tasks/task038-vet-share-link-and-report-upgrade.md)
- [task039-household-sharing-and-sitter-mode.md](../../tasks/task039-household-sharing-and-sitter-mode.md)
- [task040-safety-center-offline-pack.md](../../tasks/task040-safety-center-offline-pack.md)
- [task041-care-calendar-and-refill-planning.md](../../tasks/task041-care-calendar-and-refill-planning.md)
- [task042-photo-baseline-tracker.md](../../tasks/task042-photo-baseline-tracker.md)

## 13. Implementation Notes for Later

### Canonical Spec Updates

Once approved, update:

- business model
- premium feature list
- screen inventory
- event type inventory
- AI prompt inventory
- RevenueCat entitlement model
- sync behavior

### Entitlement Model

Use one entitlement:

```text
premium
```

Premium gates:

- cloud sync
- restore
- summaries
- AI agents
- reports
- training tracking
- household sharing
- advanced dashboards

Do not create separate entitlements for each agent or feature unless pricing later requires it.

### Data Architecture

Free:

- WatermelonDB local persistence
- no cloud writes for logs unless Premium is active
- manual export available

Premium:

- WatermelonDB local persistence
- Supabase sync
- cloud backup and restore
- Edge Functions for AI

Important implementation risk:

- The current product architecture assumes Supabase sync exists. Moving all sync behind Premium requires a deliberate migration plan so existing users do not unexpectedly lose backup behavior.

### Copy System

Use these plan-level copy rules:

- Free local state: "Saved on this device"
- Premium cloud state: "Backed up and synced"
- Export: "Export your data anytime"
- Summary gate: "Unlock summaries from your logs"
- AI gate: "Ask with your dog's history"
- Training gate: "Track progress with Premium"

## 14. Validation Plan

### Documentation Validation

- Confirm this document does not replace the canonical source of truth.
- Confirm all AI features mention Supabase Edge Functions or backend execution.
- Confirm all urgent safety actions remain free.
- Confirm manual export remains free.
- Confirm sync is consistently described as Premium.
- Confirm raw local logs remain free.

### Future Product Validation

Free-user scenarios:

- log without network
- view local Timeline
- export CSV/PDF manually
- use Emergency SOS
- use first-aid basics
- use core toxicity lookup
- view weekly static training program
- see clear local-only sync state

Premium scenarios:

- enable backup
- sync across devices
- restore on a new device
- generate weekly summary
- ask AI
- track training progress
- generate vet report
- invite household member

Safety scenarios:

- emergency path never shows a paywall
- AI output never diagnoses
- toxicity core result appears before any premium camera or AI assist upsell
- training AI never claims to replace a trainer or behaviorist

## 15. External Inputs

These references are directional inputs, not instructions to copy competitor behavior:

- Apple subscriptions support ongoing access to premium features, cloud support, and updated digital content: <https://developer.apple.com/app-store/subscriptions/>
- Google Play requires Play Billing for in-app digital subscriptions: <https://support.google.com/googleplay/android-developer/answer/10281818>
- RevenueCat supports configurable paywalls and freemium paywall moments: <https://www.revenuecat.com/docs/tools/paywalls>
- FitBark positions around health overview, sleep, activity, and alerts: <https://www.fitbark.com/app/>
- Woofz positions around customized training, wellness, and dog assistant features: <https://www.woofz.com/>
- 11pets positions around records, collaboration, and premium feature breadth: <https://www.11pets.com/>
- PetDesk positions around reminders, appointments, records, and provider connection: <https://petdesk.com/products/veterinary-mobile-app>

## 16. Open Decisions Before Canonical Merge

These are the decisions to confirm before changing the source-of-truth spec:

- whether free users can create accounts without Premium while still staying local-only
- how to handle existing users if sync becomes paid
- whether the free weekly training program rotates globally or is selected by dog age/breed locally
- whether basic PDF export remains fully free or whether only raw/basic PDF is free and polished vet-ready PDF is Premium
- whether Ask BarkLog AI has a tiny free quota or is fully Premium
- whether photo storage is local-only free and cloud media backup Premium
