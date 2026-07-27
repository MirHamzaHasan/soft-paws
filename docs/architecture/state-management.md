# Architecture: State Management

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## State Ownership

### Zustand

Use Zustand for:

- selected dog
- local UI toggles
- trial and paywall presentation state
- draft interaction state that should not live in component-local state

### TanStack Query

Use TanStack Query for:

- Supabase-backed reads
- remote mutations
- cache invalidation
- entitlement-aware remote data fetching

### WatermelonDB

Use WatermelonDB for:

- local-first event persistence
- offline timeline source of truth
- queued sync state
- local hydration of recent profile and health surfaces when network is unavailable

## Rules

- Event logging writes must land in WatermelonDB before remote sync.
- Remote fetches should not block the ability to log events.
- Do not duplicate the same source-of-truth data across Zustand and WatermelonDB without a clear ownership reason.
- RevenueCat entitlement checks should feed feature gates, not replace product-state storage.
