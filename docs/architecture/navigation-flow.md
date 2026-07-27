# Architecture: Navigation Flow

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Router

- Expo Router
- file-based route ownership
- route groups for auth, onboarding, and tabs

## Route Groups

### `(auth)`

- `welcome`
- `sign-up`
- `sign-in`
- `forgot-password`

### `(onboarding)`

- `dog-profile`
- `permissions`
- `trial-welcome`

### `(tabs)`

- `index` for Home
- `timeline`
- `insights`
- `profile`

## Standalone Pushed Routes

- `log/[eventType]`
- `log/symptom`
- `event/[id]`
- `photo-journal`
- `monthly-trends`
- `vet-prep`
- `ask-ai`
- `toxicity`
- `emergency`
- `first-aid/[topic]`
- `triage`
- `add-medication`
- `settings`
- `memory-book`
- `expenses`
- `paywall`
- `subscription`
- `dog-switcher`
- `household`
- `add-dog`

## Navigation Rules

- Home, Timeline, Insights, and Profile are the only persistent bottom tabs.
- Logging detail screens sit above Home as focused task routes.
- Emergency, toxicity, first aid, and triage stay reachable from high-frequency surfaces.
- Premium gates use sheets or pushed routes depending on urgency and interruption cost.
- Dog Switcher uses a bottom-sheet mental model even if routed through Expo Router.
