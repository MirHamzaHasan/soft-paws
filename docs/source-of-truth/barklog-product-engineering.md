# BarkLog Complete Product and Engineering Spec

## Purpose

This document is the canonical source of truth for BarkLog product, design, data, routing, and engineering decisions.

If any older BarkLog doc conflicts with this file, this file wins.

## 1. Product Overview

- App name: `BarkLog`
- Tagline: `Daily dog health, in one tap.`
- Product type: software-only dog health companion app for iPhone and Android
- Core promise: one-tap logging, AI-powered health insights, emergency safety tools, and complete dog health management without any hardware requirement
- Primary audience: US-based Millennial and Gen Z dog parents ages 25-40 who treat their dog as family
- Secondary audience: senior-dog owners managing medications and chronic conditions
- Distribution advantage: founder-led launch through an active 83K-follower US-based dog Instagram community

## 2. Business Model

- Free:
  - 7-day full trial
  - after trial, offline local logging and local care planning on one device
  - one dog
  - manual CSV and PDF export
  - urgent safety tools
- Premium:
  - `$5.99/month`
  - `$49/year`
  - all premium features
  - unlimited dogs
  - cloud sync, backup, restore, household sharing, and sitter mode
- Family plan:
  - future packaging option only
  - not required for v1 household sharing

## 3. Product Principles

Every product, code, and design decision must satisfy these rules:

1. One-tap obsessed. If a daily action takes more than 3 taps, redesign it.
2. Dog-only. No multi-species surfaces, language, icons, or imagery.
3. Offline-first for logging. Event taps must persist locally without network and sync later.
4. No medical advice. BarkLog observes patterns and suggests attention, but never diagnoses.
5. Data freedom always. Users can export everything as CSV and PDF at any time, including free users.
6. Fast over fancy. Event logging should feel effectively instant.
7. Notifications are sacred. Only medication reminders and anomaly alerts are allowed by default. Care task reminders must be explicit opt-in per task.

## 4. Product Positioning

- Versus Maven, FitBark, and PetPace:
  - BarkLog is software-only
  - no required hardware purchase
- Versus 11Pets:
  - BarkLog includes AI insights
  - BarkLog keeps a modern UI
  - BarkLog treats export and access as user rights
- Versus PokiPaw and PetDesk:
  - BarkLog is dog-only
  - BarkLog prioritizes depth over multi-species breadth
  - BarkLog uses AI for pattern detection and record organization

## 5. Final Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Framework | React Native via Expo | SDK 52+, managed workflow, no ejection |
| Language | TypeScript | Strict mode |
| Navigation | Expo Router | File-based routing |
| Styling | Tamagui | Theme tokens and primitives configured through `tamagui.config.ts` |
| UI state | Zustand | Lightweight client state |
| Server state | TanStack Query | Query cache and sync orchestration |
| Local DB | WatermelonDB | Offline-first local persistence |
| Cloud DB | Supabase | PostgreSQL, Auth, Storage, Edge Functions |
| Auth | Supabase Auth | Email/password in v1.0, Apple Sign-In in v1.1 |
| Subscriptions | RevenueCat | Apple and Google billing unification |
| AI | DeepSeek text AI, OpenAI vision-ready key boundary | Only through Supabase Edge Functions, never from client |
| Push notifications | Expo Notifications | Medication reminders and anomaly alerts |
| Analytics | Mixpanel | Free tier |
| Error tracking | Sentry | Free tier |
| Health data | Apple HealthKit + Google Fit | Activity import |
| Image storage | Supabase Storage | Signed URLs, 24-hour expiry |
| Icons | Lucide React Native | 24px stroke |
| Fonts | Inter | 400 and 500 only |
| Animations | Reanimated 3 + Moti | Limited, purposeful |
| Haptics | expo-haptics | Primary interactions |
| Package manager | pnpm | Target package manager |

## 6. Design System

### 6.1 Aesthetic Direction

- Clean and modern
- Notion and Linear adjacency
- Black ink on warm paper-white
- No gradients
- No shadows
- No decorative surfaces
- Color exists only to encode event types, AI, and urgency

### 6.2 Brand Colors

| Token | Hex | Usage |
| --- | --- | --- |
| Ink | `#0A0A0A` | primary text, headings, primary buttons |
| Paper | `#FAFAFA` | app background |
| Surface | `#F5F5F4` | cards and secondary surfaces |
| Border | `#E7E5E4` | borders and dividers |
| Muted | `#737373` | secondary text |
| Faint | `#A3A3A3` | tertiary and disabled text |

### 6.3 Event Colors

| Event | Emoji | Background | Border | Text |
| --- | --- | --- | --- | --- |
| Poop | `💩` | `#FDF3EC` | `#EDDCCE` | `#6B3418` |
| Pee | `💧` | `#EEF4FB` | `#D7E4F2` | `#1E3A5F` |
| Meal | `🍽` | `#F0F5E8` | `#DCE6C8` | `#2F4017` |
| Walk | `🚶` | `#FBF1DD` | `#EEDCB4` | `#5C3F0F` |
| Medication | `💊` | `#F3F0FB` | `#E2DCEF` | `#362B68` |
| Symptom | `🤕` | `#FCEBEB` | `#F7C1C1` | `#791F1F` |
| Grooming | `🛁` | `#E1F5EE` | `#9FE1CB` | `#085041` |
| Weight | `⚖️` | `#F1EFE8` | `#D3D1C7` | `#444441` |
| Mood | `😊` | `#F5F0FF` | `#E0D4F5` | `#4A3580` |
| Behavior | `🐕` | `#FFF5EC` | `#FFE0C2` | `#7A4510` |
| Training | `🎓` | `#EEF8EE` | `#C8E6C8` | `#1B5E20` |

### 6.4 Semantic Colors

| Token | Hex | Usage |
| --- | --- | --- |
| Success | `#16A34A` | saved confirmations, adherence |
| Warning | `#D97706` | anomaly alerts, trial expiry |
| Danger | `#DC2626` | emergency and toxicity warnings |
| AI / Premium | `#534AB7` | AI surfaces and premium markers |

### 6.5 Typography

| Token | Size | Weight | Usage |
| --- | --- | --- | --- |
| Display | `28px` | `500` | key greetings |
| Title | `18px` | `500` | screen titles |
| Body | `14px` | `400` | descriptions |
| Body Bold | `14px` | `500` | emphasized labels |
| Caption | `12px` | `500` | timestamps, tabs |
| Overline | `11px` | `500` | section labels |
| Stat Number | `24px` | `500` | dashboard stats |

### 6.6 Spacing Scale

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`

### 6.7 Border Radius

- `4`
- `8`
- `12`
- `14`
- `999`

### 6.8 Tamagui Theme Contract

Use `src/theme/tokens.ts`, `src/theme/tamaguiTheme.ts`, and `tamagui.config.ts` as the implementation contract.

Required token families:

- Brand: `ink`, `paper`, `surface`, `border`, `muted`, `faint`
- Event: `poop`, `pee`, `meal`, `walk`, `medication`, `symptom`, `grooming`, `weight`, `mood`, `behavior`, `training`
- Semantic: `success`, `warning`, `danger`, `aiAccent`
- Typography: Inter `400` and `500` only
- Radius: `4`, `8`, `12`, `14`, `999`

### 6.9 Logo

- Five-oval paw print
- One large central pad
- Four toe beans
- Solid black on white or solid white on black
- Geometric, not organic
- No outlines
- No gradients

## 7. Target File Structure

```text
barklog/
├── app/
│   ├── (auth)/
│   │   ├── welcome.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/
│   │   ├── dog-profile.tsx
│   │   ├── permissions.tsx
│   │   └── trial-welcome.tsx
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── timeline.tsx
│   │   ├── insights.tsx
│   │   └── profile.tsx
│   ├── log/
│   │   ├── [eventType].tsx
│   │   ├── behavior.tsx
│   │   ├── mood.tsx
│   │   └── symptom.tsx
│   ├── training/
│   │   ├── index.tsx
│   │   ├── session.tsx
│   │   └── [programSlug].tsx
│   ├── event/[id].tsx
│   ├── vet-share/[token].tsx
│   ├── care-calendar.tsx
│   ├── photo-baselines.tsx
│   ├── photo-journal.tsx
│   ├── monthly-trends.tsx
│   ├── vet-prep.tsx
│   ├── ask-ai.tsx
│   ├── safety.tsx
│   ├── safety-center.tsx
│   ├── toxicity.tsx
│   ├── emergency.tsx
│   ├── first-aid/[topic].tsx
│   ├── triage.tsx
│   ├── add-medication.tsx
│   ├── settings.tsx
│   ├── memory-book.tsx
│   ├── expenses.tsx
│   ├── paywall.tsx
│   ├── subscription.tsx
│   ├── dog-switcher.tsx
│   ├── household.tsx
│   ├── add-dog.tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── features/
│   ├── db/
│   ├── api/
│   ├── stores/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   └── theme/
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── ask-barklog-ai/
│       ├── generate-care-summary/
│       ├── generate-training-insight/
│       ├── generate-weekly-insight/
│       ├── generate-vet-report/
│       ├── resolve-vet-share-link/
│       └── toxicity-lookup/
├── assets/
├── config/
├── tests/
└── app.json
```

## 8. Database Schema

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial','active','expired','grandfathered')),
  trial_ends_at TIMESTAMPTZ,
  revenuecat_user_id TEXT
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own data" ON users FOR ALL USING (auth.uid() = id);
```

### dogs

```sql
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  breed TEXT,
  birthdate DATE,
  weight_lbs NUMERIC,
  sex TEXT CHECK (sex IN ('male','female','neutered_male','spayed_female')),
  photo_url TEXT,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own dogs" ON dogs FOR ALL USING (auth.uid() = user_id);
```

### events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('poop','pee','meal','walk','medication','symptom','grooming','weight','note','mood','behavior','training')),
  occurred_at TIMESTAMPTZ NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  details JSONB DEFAULT '{}',
  photo_url TEXT,
  notes TEXT,
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own events" ON events FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_events_dog_date ON events(dog_id, occurred_at DESC);
```

Per-event `details` contract:

- `poop`: `{ quality: "normal"|"loose"|"hard", color?: "brown"|"dark"|"yellow"|"red"|"black" }`
- `pee`: `{}`
- `meal`: `{ meal_type?: "breakfast"|"lunch"|"dinner"|"snack"|"treat", amount_cups?: number, food_brand?: string }`
- `walk`: `{ duration_min?: number, distance_mi?: number, energy_level?: "low"|"normal"|"high", source: "manual"|"healthkit"|"googlefit" }`
- `medication`: `{ med_id: uuid, dose_mg?: number, given_with_food?: boolean, side_effects?: string[] }`
- `symptom`: `{ categories: string[], symptoms: string[], severity: "mild"|"moderate"|"severe", body_zones?: string[] }`
- `grooming`: `{ grooming_type: "nail_trim"|"bath"|"teeth"|"flea_tick"|"ear_clean" }`
- `weight`: `{ weight_lbs: number }`
- `mood`: `{ mood: "happy"|"calm"|"anxious"|"lethargic"|"hyper"|"clingy"|"off", energy: "low"|"normal"|"high" }`
- `behavior`: `{ behavior: "barking"|"pulling"|"jumping"|"aggression"|"anxiety"|"destructive"|"reactivity"|"other", trigger?: "strangers"|"dogs"|"noises"|"separation"|"food"|"guests"|"car"|"vet"|"unknown"|"other", intensity: "mild"|"moderate"|"severe", duration_min?: number, context?: "walk"|"home"|"car"|"vet"|"park"|"guests"|"alone" }`
- `training`: `{ enrollment_id: uuid, program_name: string, step_number: number, step_title: string, duration_min?: number, success_rating?: number, dog_mood?: "happy"|"calm"|"anxious"|"lethargic"|"hyper"|"clingy"|"off" }`

### medications

```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dose_mg NUMERIC,
  frequency TEXT CHECK (frequency IN ('daily','twice_daily','every_other_day','weekly','as_needed')),
  schedule_times JSONB DEFAULT '[]',
  give_with_food BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  refill_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own meds" ON medications FOR ALL
  USING (auth.uid() = (SELECT user_id FROM dogs WHERE dogs.id = medications.dog_id));
```

### insights

```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  prompt_version TEXT DEFAULT 'v1'
);
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own insights" ON insights FOR ALL
  USING (auth.uid() = (SELECT user_id FROM dogs WHERE dogs.id = insights.dog_id));
```

### vaccinations

```sql
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_given DATE,
  next_due DATE,
  vet_name TEXT,
  record_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### expenses

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT CHECK (category IN ('food','vet','grooming','toys','boarding','insurance','medication','other')),
  description TEXT,
  date DATE NOT NULL,
  receipt_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### vet_share_links

```sql
CREATE TABLE vet_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  range_start TIMESTAMPTZ NOT NULL,
  range_end TIMESTAMPTZ NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  report_snapshot JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vet_share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own vet share links" ON vet_share_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Premium users create own vet share links" ON vet_share_links FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND current_user_owns_dog(dog_id)
    AND current_user_has_premium_access()
  );

CREATE POLICY "Users update own vet share links" ON vet_share_links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND current_user_owns_dog(dog_id));

CREATE POLICY "Users delete own vet share links" ON vet_share_links FOR DELETE
  USING (auth.uid() = user_id);
```

### training_programs

Reference table for read-only training catalog content. Initial catalog seed content is owned by `supabase/migrations/202604270028_seed_initial_training_programs.sql`.

```sql
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('obedience','behavior_modification','socialization','tricks','puppy_basics','leash_skills')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimated_days INTEGER NOT NULL CHECK (estimated_days > 0),
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read training programs" ON training_programs
  FOR SELECT TO authenticated USING (true);
```

Initial training catalog:

- `sit-stay-foundations`: Sit & stay foundations, obedience, beginner, 7 days
- `loose-leash-walking`: Loose leash walking, leash skills, beginner, 10 days
- `recall-come-when-called`: Recall (come when called), obedience, intermediate, 10 days
- `calm-greetings`: Calm greetings, socialization, beginner, 7 days
- `crate-training`: Crate training, puppy basics, beginner, 7 days
- `reactivity-management`: Reactivity management, behavior modification, intermediate, 14 days
- `leave-it-drop-it`: Leave it / drop it, obedience, beginner, 5 days
- `separation-comfort`: Separation comfort, behavior modification, intermediate, 14 days

Training content must use positive reinforcement only, include self-assessable success signals, and avoid punishment, dominance, aversive tools, diagnostic claims, or replacement claims for trainers, behaviorists, or veterinarians.

### training_steps

Reference table for ordered steps inside each training program.

```sql
CREATE TABLE training_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  title TEXT NOT NULL,
  instruction TEXT NOT NULL,
  tip TEXT,
  estimated_duration_min INTEGER DEFAULT 10 CHECK (estimated_duration_min > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, step_number)
);
ALTER TABLE training_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read training steps" ON training_steps
  FOR SELECT TO authenticated USING (true);
```

### dog_training_enrollments

Premium user-data table for offline-first training program progress.

```sql
CREATE TABLE dog_training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE NOT NULL,
  current_step INTEGER DEFAULT 1 CHECK (current_step > 0),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','abandoned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(dog_id, program_id)
);
ALTER TABLE dog_training_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own enrollments" ON dog_training_enrollments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### training_sessions

Premium user-data table for offline-first training session tracking.

```sql
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES dog_training_enrollments(id) ON DELETE CASCADE NOT NULL,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES training_steps(id) NOT NULL,
  duration_min INTEGER CHECK (duration_min IS NULL OR duration_min >= 0),
  success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
  dog_mood TEXT CHECK (dog_mood IN ('happy','calm','anxious','lethargic','hyper','clingy','off')),
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own training sessions" ON training_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### care_tasks

Free local-first planning table for refills, preventives, grooming, vaccinations, vet follow-ups, training practice, and custom care tasks. Cloud sync of this table is Premium through the shared sync entitlement boundary.

```sql
CREATE TABLE care_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medication_refill','parasite_prevention','grooming','vaccination','vet_follow_up','training_practice','custom')),
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none','daily','weekly','monthly','custom')),
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  related_medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  remaining_count INTEGER CHECK (remaining_count IS NULL OR remaining_count >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own and shared care tasks" ON care_tasks
  FOR SELECT USING (auth.uid() = user_id OR current_user_can_view_shared_dog(dog_id));
CREATE POLICY "Users create own or shared care tasks" ON care_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id AND (current_user_owns_dog(dog_id) OR current_user_can_create_shared_dog_log(dog_id)));
CREATE POLICY "Users update own care tasks" ON care_tasks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND (current_user_owns_dog(dog_id) OR current_user_can_create_shared_dog_log(dog_id)));
CREATE POLICY "Users delete own care tasks" ON care_tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### photo_baselines

Free local-first visual reference table for owner-observed care photos. Cloud sync, restore, photo compare, future AI summaries, and future share-link inclusion are Premium.

```sql
CREATE TABLE photo_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skin','eyes','teeth','stool','weight_shape','mobility_posture','wound','grooming','other')),
  title TEXT NOT NULL,
  body_area TEXT,
  captured_at TIMESTAMPTZ NOT NULL,
  photo_uri TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE photo_baselines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own and shared photo baselines" ON photo_baselines
  FOR SELECT USING (auth.uid() = user_id OR current_user_can_view_shared_dog(dog_id));
CREATE POLICY "Users create own or shared photo baselines" ON photo_baselines
  FOR INSERT WITH CHECK (auth.uid() = user_id AND (current_user_owns_dog(dog_id) OR current_user_can_create_shared_dog_log(dog_id)));
CREATE POLICY "Users update own photo baselines" ON photo_baselines
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND (current_user_owns_dog(dog_id) OR current_user_can_create_shared_dog_log(dog_id)));
CREATE POLICY "Users delete own photo baselines" ON photo_baselines
  FOR DELETE USING (auth.uid() = user_id);
```

## 9. Navigation Architecture

### Tabs

- Home
- Timeline
- Insights
- Profile

### Pushed / modal surfaces

- Log event detail
- Log symptom
- Log mood
- Log behavior
- Training hub
- Training program detail
- Training session logger
- Care Calendar
- Photo Baseline Tracker
- Safety Center
- Ask BarkLog AI
- Toxicity scanner
- Emergency SOS
- First aid guide
- Vet or wait triage
- Vet visit prep
- Photo journal
- Paywall
- Add / edit dog
- Dog switcher
- Household overview
- Household invite accept
- Settings

## 10. Screen Inventory

The canonical screen inventory below is reproduced from the build spec.

### Authentication

- `A1` Welcome / splash
- `A2` Sign up
- `A3` Sign in
- `A4` Forgot password

### Onboarding

- `O1` Dog profile setup
- `O2` Permissions
- `O3` Trial welcome

### Home and event logging

- `H1` Home
- `H2` Log poop detail
- `H3` Log meal detail
- `H4` Log walk detail
- `H5` Log medication detail
- `H6` Log symptom
- `H7` Log mood detail
- `H8` Log behavior detail

### Timeline

- `T1` Timeline
- `T2` Event detail
- `T3` Photo journal gallery
- `T4` Photo Baseline Tracker

### Insights and dashboard

- `I1` Weekly dashboard
- `I2` Monthly trends
- `I3` Vet visit prep
- `I4` Ask BarkLog AI

### Emergency and safety

- `E0` Safety Center
- `E1` Toxicity scanner
- `E2` Emergency SOS
- `E3` First aid guide
- `E4` Vet or wait triage

### Profile and settings

- `P1` Dog profile hub
- `P2` Add / edit medication
- `P3` Settings
- `P4` Memory book
- `P5` Expense tracker
- `P6` Care Calendar and Refill Planning
- `P7` Photo Baseline Tracker
- `P6` Care calendar and refill planning

### Subscription

- `S1` Paywall
- `S2` Subscription management
- `S3` Premium gate

### Multi-dog

- `M1` Dog switcher
- `M2` Household overview
- `M3` Add dog

### Training

- `TR1` Training hub
- `TR2` Training program detail
- `TR3` Training session logger

## 11. Screen Specifications

### A1 Welcome / Splash

- Centered paw logo at `72px`
- `BarkLog` display title
- tagline under title
- primary CTA `Get started`
- secondary link `I already have an account`
- legal footer
- auto-skip on valid session

### A2 Sign Up

- back arrow
- `Create your account`
- email and password inputs
- show / hide password
- primary CTA `Continue`
- sign-in link
- inline validation on blur

### A3 Sign In

- `Welcome back`
- email and password
- `Sign in`
- `Forgot password?`
- inline error banner for invalid credentials

### A4 Forgot Password

- `Reset password`
- helper copy about reset link
- email field
- `Send reset link`
- success state with checkmark

### O1 Dog Profile Setup

- progress `1/3`
- `Tell us about your dog`
- dog photo upload
- required name
- searchable breed selector with 400+ breeds plus `Mixed/Unknown`
- DOB or age range
- weight with lbs / kg toggle
- sex segmented options:
  - Male
  - Female
  - Neutered Male
  - Spayed Female
- primary CTA `Next`

### O2 Permissions

- progress `2/3`
- notifications toggle with explanation
- Apple Health / Google Fit toggle with explanation
- `Skip for now`
- `Continue`

### O3 Trial Welcome

- progress `3/3`
- celebratory paw icon with subtle scale pulse
- confirmation headline using dog name
- four feature rows with green checks
- trial pill badge
- primary CTA `Start tracking [name]`

### H1 Home

- dog avatar, name, breed / age, settings, dog switcher entry
- `Today` caption and `How is [name] doing?`
- 2x2 primary event grid:
  - Poop
  - Pee
  - Meal
  - Walk
- full-width Medication action
- secondary action row:
  - Symptom
  - Weight
  - Grooming
  - Mood
  - Behavior
- daily summary card
- anomaly banner when relevant
- Safety Center entry point
- Care Calendar entry point
- quick actions for toxicity and emergency
- bottom tab bar
- single tap logs instantly with haptic and toast
- long press opens detail screen
- pull-to-refresh syncs

### H2 Log Poop Detail

- when selector
- quality selector
- color swatches
- optional notes
- optional photo
- `Save event`

### H3 Log Meal Detail

- when selector
- meal type
- amount
- food brand autocomplete
- notes
- photo
- save

### H4 Log Walk Detail

- when selector
- duration
- distance
- energy level
- notes
- photo
- save

### H5 Log Medication Detail

- when selector
- medication dropdown
- auto-filled dose
- `Given with food` toggle
- side effect chips
- notes
- save
- add new medication link

### H6 Log Symptom

- when selector
- category chips
- symptom chips per category
- severity slider:
  - Mild
  - Moderate
  - Severe
- tappable dog body map
- photo
- notes
- `Save symptom`
- persistent emergency footer

### H7 Log Mood Detail

- when selector
- 7 mood option pills:
  - Happy
  - Calm
  - Anxious
  - Lethargic
  - Hyper
  - Clingy
  - Off
- energy selector:
  - Low
  - Normal
  - High
- optional notes
- `Save mood`
- mood is a free logging event and must persist locally before sync

### H8 Log Behavior Detail

- when selector
- behavior option pills:
  - Barking
  - Pulling
  - Jumping
  - Aggression
  - Anxiety
  - Destructive
  - Reactivity
  - Other
- trigger selector:
  - Strangers
  - Dogs
  - Noises
  - Separation
  - Food
  - Guests
  - Car
  - Vet
  - Unknown
  - Other
- intensity selector:
  - Mild
  - Moderate
  - Severe
- duration field in minutes
- context chips:
  - Walk
  - Home
  - Car
  - Vet
  - Park
  - Guests
  - Alone
- optional photo
- optional notes
- `Save behavior`
- behavior is a free logging event and must persist locally before sync
- copy stays observational and never diagnoses behavior disorders

### T1 Timeline

- title
- horizontal date pills
- newest-first event list
- swipe to delete
- empty state

### T2 Event Detail

- icon, title, and full datetime
- read-only by default
- edit mode
- photo preview
- delete action

### T3 Photo Journal Gallery

- filters
- three-column grid
- compare mode with two selected photos and drag slider

### T4 Photo Baseline Tracker

- route `app/photo-baselines.tsx`
- free local visual-reference record
- category chips:
  - Skin
  - Eyes
  - Teeth
  - Stool
  - Body shape
  - Posture
  - Wound
  - Grooming
  - Other
- title
- optional body area
- captured date
- optional local photo reference URI
- optional notes
- newest-first baseline list
- delete action
- Premium gate for photo compare, cloud backup, future AI photo summaries, and future share-link inclusion
- copy must say BarkLog organizes owner observations and does not diagnose or analyze photos

### I1 Weekly Dashboard

- date range with week switching
- 2x2 stat cards
- AI insight card
- training insight card when the active dog has an active training enrollment
- activity chart
- poop quality chart
- anomaly alerts
- export and share actions

### I2 Monthly Trends

- month selector
- weight line chart with healthy range
- activity trends
- symptom frequency
- meal consistency
- month-over-month indicators

### I3 Vet Visit Prep

- time range selector
- report preview
- PDF download
- share
- print
- Premium generated visit summary through `generate-vet-report`
- Premium suggested question list
- Premium secure vet share link creation
- revoke active vet share link
- public `/vet-share/[token]` unavailable / expired state
- disclaimer

### I4 Ask BarkLog AI

- chat layout
- starter questions
- input composer
- context badge
- context includes enrolled training programs, recent training sessions, behavior patterns, and mood patterns when available
- free quota:
  - 3 questions per week
- premium:
  - unlimited
- disclaimer

### E0 Safety Center

- route `app/safety.tsx`
- alias route `app/safety-center.tsx`
- free offline-first safety hub
- Emergency SOS action remains prominent
- poison-control call action
- local emergency card with dog name, weight, and active medications
- first-aid basics index with CPR timer entry
- core toxicity lookup entry points
- safe transport checklist
- safety content source, version, and reviewed-at metadata
- light mode only
- no Premium Gate on urgent safety paths
- no AI in urgent safety flows

### E1 Toxicity Scanner

- search input
- camera entry
- recent searches
- common hazards
- result card with severity
- personalized toxic-dose context
- poison-control CTA for severe results

### E2 Emergency SOS

- full-screen emergency modal
- poison-control and vet calling actions
- nearest 24/7 clinics with directions
- quick first-aid topic cards
- share medical summary
- light mode only
- offline except map lookup

### E3 First Aid Guide

- topic title
- severity badge
- numbered steps
- warning callouts
- CPR timer
- offline
- American Red Cross as content source

### E4 Vet or Wait Triage

- stepwise questionnaire
- monitor / see vet / emergency outcome
- disclaimer always visible

### P1 Dog Profile Hub

- large avatar
- dog identity metadata
- quick stats
- accordions for:
  - medications
  - vaccinations
  - grooming schedule
  - allergies and conditions
  - vet info
  - photo baselines
  - training programs
  - data export
  - Safety Center and emergency card

### P2 Add / Edit Medication

- medication name
- dose
- frequency
- schedule times
- with-food toggle
- start / end dates
- refill reminder
- notes
- save
- deactivate

### P3 Settings

- account
- notifications
- units
- appearance
- health data connection
- privacy
- about

### P4 Memory Book

- month selector
- shareable monthly story card
- dog photo
- fun stats
- collage
- AI narrative
- milestone badges
- share and download actions

### P5 Expense Tracker

- yearly total
- add expense
- category pie chart
- monthly trend line
- expense list

### P6 Care Calendar and Refill Planning

- route `app/care-calendar.tsx`
- free local planning surface
- task types:
  - medication refill
  - parasite prevention
  - grooming
  - vaccination
  - vet follow-up
  - training practice
  - custom
- list-first calendar view with sections:
  - overdue
  - due today
  - upcoming
  - recently completed
- add task form:
  - task type chips
  - medication selector for refill tasks
  - title
  - due date
  - recurrence
  - remaining count for refill tasks
  - opt-in reminder toggle
  - notes
- completing recurring tasks advances to the next due date
- medication refill tasks can update the linked medication refill date
- reminders are explicit opt-in per task and must handle denied permission without blocking local saves
- Premium smart automation gate covers sync, household coordination, and future AI-generated care checklists
- no dosage or medical instruction generation

### P7 Photo Baseline Tracker

- route `app/photo-baselines.tsx`
- free local visual-reference record
- category chips for skin, eyes, teeth, stool, body shape, posture, wound, grooming, and other
- title
- optional body area
- captured date
- optional local photo reference URI
- optional notes
- newest-first baseline list
- delete local baseline action
- Premium photo compare gate
- cloud backup, future AI photo summaries, and future share-link inclusion are Premium
- copy must stay observational and state that BarkLog does not diagnose or analyze photos

### S1 Paywall

- pulsing paw graphic
- trial countdown
- five feature rows
- annual and monthly CTAs
- data-freedom assurance
- dismiss link

### S2 Subscription Management

- current plan card
- renewal date
- native manage link
- restore purchases

### S3 Premium Gate

- bottom sheet
- lock icon
- feature name
- short value prop
- `Unlock with Premium`

### M1 Dog Switcher

- bottom sheet
- dog cards
- active selection highlight
- add dog CTA

### M2 Household Overview

- stacked dogs
- per-dog quick-log row
- combined stats
- shared dogs, members, pending invites, and care handoffs
- Premium-only household creation, invite, sitter mode, and shared cloud sync
- free users see local tracking and a clear household-sharing Premium gate
- sitter mode uses time-bound access and limited permissions

### M2a Household Invite Accept

- route `app/household/invite/[token].tsx`
- Premium gate before accepting cloud-backed membership
- hashed invite token handled by Supabase Edge Function
- accepted members return to Household overview

### M3 Add Dog

- same fields as onboarding dog profile
- `Add another dog` framing
- no progress dots

### TR1 Training Hub

- route `app/training/index.tsx`
- Profile Hub entry point, no fifth tab
- Active programs section with current step and accessible progress text
- Available programs grouped by caregiver-facing category labels
- Program cards show icon, name, difficulty, estimated days, description, and step count
- Free users can browse all programs
- starting a program opens Premium Gate for non-premium users
- premium users start or resume local-first enrollment progress
- loading skeletons, empty state, and retryable error state

### TR2 Training Program Detail

- route `app/training/[programSlug].tsx`
- program header with category, difficulty, estimated days, step count, and progress
- ordered step list with completed checkmarks and current-step highlight
- current step expands to instruction, tip, and estimated duration
- `Log session` opens the premium training session logger
- `Complete step` advances `current_step` locally before sync
- personalized training insight card appears below the current step for premium users with saved enrollment
- final step completion sets enrollment status to `completed` and shows completion state
- free users can read program detail but cannot start tracked progress

### TR3 Training Session Logger

- route `app/training/session.tsx`
- premium-only entry from the current program step
- shows program name, step number, and step title before editable fields
- duration field defaults to the step estimate and accepts minutes
- 5-step success rating with accessible labels from struggled to nailed it
- dog mood selector reuses the seven mood values from mood check-ins
- optional notes field
- save creates a `training_sessions` row and matching `training` Timeline event in one local WatermelonDB write before sync
- success shows haptic feedback and a saved toast with a link to the Timeline event
- free users see the existing Premium Gate instead of the logger

## 12. AI Provider and Edge Function Integration

### Weekly Insight Prompt

```text
You are a veterinary health observer for the BarkLog app.
Analyze 7 days of dog activity data and write ONE short, helpful observation.

RULES:
- 1-2 sentences only.
- Never give medical advice. Never say "your dog has" or "you should see a vet."
- Focus on patterns: compared to prior week, unusual gaps, positive streaks.
- Mood, behavior, and training logs are caregiver observations. Use them only for pattern context.
- Training context may include session count, average success rating, program names, and session mood patterns.
- Do not give training instructions in weekly health insights.
- Warm, supportive tone. Never alarming.
- If nothing notable: write an encouraging observation.

Dog: {name}, {breed}, {age}y, {weight}lbs
This week: {events_summary}
This week mood: {mood_summary}
This week behavior: {behavior_summary}
This week training: {training_summary}
Last week: {events_summary}
Last week mood: {mood_summary}
Last week behavior: {behavior_summary}
Last week training: {training_summary}

Output only the observation. No preamble. No markdown.
```

### Ask BarkLog AI System Prompt

```text
You are BarkLog AI, a knowledgeable dog health assistant.
You have access to this dog's health data:
- Name: {name}, Breed: {breed}, Age: {age}, Weight: {weight}
- Recent events: {last_30_days_summary}
- Current medications: {meds_list}
- Training context: {training_context_summary}
- Known conditions: {conditions}

RULES:
- Always warm and supportive. Never clinical.
- Never diagnose. Say "This could be worth discussing with your vet" not "Your dog has X."
- Use training context only as logged observations. Never diagnose behavior disorders.
- Never claim to replace a professional trainer, behaviorist, or veterinarian.
- Use positive reinforcement language only. Do not recommend punishment, dominance theory, or aversive tools.
- Use breed-specific knowledge when relevant.
- Max 150 words per response.
- If emergency signs mentioned, immediately recommend calling vet or using Emergency SOS.
- End with a helpful follow-up question when appropriate.
```

### Training Insight Prompt

```text
You are a supportive dog training observer for the BarkLog app.
Analyze this dog's recent behavior logs, mood patterns, and training sessions.
Write 2-3 short, encouraging sentences about training progress.

RULES:
- Never give medical advice or diagnose behavioral disorders.
- Never claim to replace a professional trainer, behaviorist, or veterinarian.
- Focus on patterns: session consistency, success rating trends, behavior frequency changes, and mood correlations.
- If behavior incidents decreased since training started, mention it carefully as an observed log trend.
- If mood is often anxious before training sessions, suggest shorter sessions.
- Use positive reinforcement language only.
- Celebrate small wins.
- Do not prescribe treatment, tools, punishment, dominance methods, or aversive techniques.

Dog: {name}, {breed}, {age}y, {weight}lbs
Recent behavior events: {behavior_summary}
Recent mood events: {mood_summary}
Training sessions: {training_summary}
Enrolled program: {program_name}, current step: {step_number}/{total_steps}

Output only the observation. No preamble. No markdown.
```

### Vet Report Prompt

```text
You are BarkLog's vet report preparation assistant.
Create a short, factual caregiver-facing report summary and questions for a veterinary visit using only the provided BarkLog logs.

RULES:
- Never diagnose.
- Never say "your dog has".
- Never give medication dosage instructions or treatment instructions.
- Keep outputs factual, timestamp-aware, and source-aware.
- Treat caregiver-entered logs as observations, not clinical findings.
- Mention urgent or severe logs only as "worth reviewing with a vet" or "use Emergency SOS for urgent signs".
- Do not replace a veterinarian, trainer, or behaviorist.
- Return valid JSON only with summary and questions fields.
- No markdown.
```

### Toxicity Lookup

- Maintain a local toxicity database with 500+ items sourced from a trusted reference set
- Use camera identification only as an assistive input
- Cross-reference toxicity with weight-based calculations

## 13. Subscription and Paywall Logic

### RevenueCat Products

- `barklog_annual`
- `barklog_monthly`

### Trial Flow

1. Sign-up starts a 7-day trial.
2. Day 5 shows a gentle in-app reminder.
3. Day 7 shows paywall on next app open.
4. If declined, the app enters limited free mode.
5. Free users always retain event logging, timeline, and CSV export.

### Premium Features

- AI weekly insights
- Vet-ready PDF reports, generated visit summaries, and secure vet share links
- Ask BarkLog AI chat
- Photo journal compare mode
- Photo baseline compare, cloud backup, future AI summaries, and future share-link inclusion
- Multi-dog support
- Cloud sync, backup, restore, household sharing, caregiver roles, and sitter mode
- Monthly trends
- Memory book
- Expense tracker
- Smart care automation for care calendar sync, household coordination, and AI-generated checklists
- Guided training programs
- Training session tracking and Timeline integration
- Personalized training insights

## 14. Motion, Haptics, Dark Mode, and Accessibility

### Motion

- Event button tap: scale down then spring back
- Event logged: toast slide-up
- Tab switch: crossfade
- Modal open: slide-up with backdrop fade
- Bottom sheet: spring up
- Skeletons: shimmer
- AI generating: three-dot pulse
- Paywall paw: slow scale pulse
- Stat numbers: count-up

### Haptics

- Light: button tap
- Medium: event saved
- Heavy: delete confirmation and SOS
- Selection: stepper and picker transitions

### Dark Mode

- Ink / Paper invert
- Surface and border values darken
- Event backgrounds reduce luminance
- Primary button inverts
- Emergency SOS always stays light mode

### Accessibility

- WCAG AA contrast
- 44x44pt minimum touch targets
- 72px event buttons
- VoiceOver and TalkBack labeling
- Dynamic Type up to 200%
- Reduced-motion fallbacks
- Color is never the only state cue

## 15. Build Order

### Phase 1 - Foundation

1. Scaffold Expo + TypeScript + Tamagui + Expo Router.
2. Configure BarkLog design tokens.
3. Set up Supabase and run schema migrations.
4. Implement auth and session persistence.
5. Build WatermelonDB schema mirroring cloud models.
6. Create shared UI primitives.

### Phase 2 - Core Loop

7. Build Home.
8. Build event detail screens.
9. Wire one-tap logging to WatermelonDB first.
10. Build Timeline.
11. Implement WatermelonDB to Supabase sync.
12. Add medication reminders.

### Phase 3 - Intelligence

13. Build Weekly Dashboard.
14. Add `generate-weekly-insight` Edge Function.
15. Build Symptom Logger.
16. Build Ask BarkLog AI.
17. Implement RevenueCat gating.
18. Build Vet Visit Prep and PDF export.

### Phase 4 - Safety and Lifestyle

19. Build Toxicity Scanner.
20. Build Emergency SOS.
21. Build First Aid guides.
22. Build Photo Journal compare.
23. Build Monthly Trends.
24. Build Profile hub.

### Phase 5 - Polish and Launch

25. Build multi-dog support.
26. Build Memory Book and Expense Tracker.
27. Implement dark mode.
28. Add Apple Health and Google Fit integrations.
29. Prepare store assets.
30. Run beta testing and launch hardening.

## 16. Environment Variables

### Client-safe

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=replace-with-supabase-anon-public-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=replace-with-revenuecat-ios-public-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=replace-with-revenuecat-android-public-key
EXPO_PUBLIC_MIXPANEL_TOKEN=replace-with-mixpanel-project-token
EXPO_PUBLIC_SENTRY_DSN=https://public@sentry.example.invalid/0
```

### Server-only

Server-only secrets must be configured in Supabase Edge Function secret management only:

- AI provider API secret
- Supabase privileged admin key

Do not place server-only secrets in Expo env files, `app.json`, `eas.json`, `env.example`, or any `EXPO_PUBLIC_*` value.

## 17. Critical Agent Rules

1. Never call AI providers directly from the mobile client.
2. Never use `any` without explicit justification.
3. Always persist events to WatermelonDB before remote sync.
4. Always use design tokens from this spec.
5. Always gate premium features behind RevenueCat entitlements.
6. Never use diagnostic or medical-advice language.
7. Always include haptics on primary interactions.
8. Always show skeletons for loading states.
9. Test small and large phone layouts.
10. Treat the Home screen as the highest-priority surface in the product.
