# Architecture: Environment Flow

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Environment Classes

### Client-Safe Expo Variables

Expose through `EXPO_PUBLIC_*` only:

- Supabase URL
- Supabase anon key
- RevenueCat public keys
- Mixpanel token
- Sentry DSN

### Server-Only Secrets

Keep only in Supabase Edge Function or deployment secret storage:

- DeepSeek text AI API key
- OpenAI vision AI API key for future image understanding
- Supabase service role key

## Rules

- Never ship server secrets in the mobile bundle.
- Never call AI providers directly from the client.
- Keep environment naming consistent across local, staging, and production.
- Validate required variables during app startup and Edge Function boot.
