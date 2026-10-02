import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const clientEnvSchema = z.object({
  EXPO_PUBLIC_REVENUECAT_IOS_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_MIXPANEL_TOKEN: z.string().min(1).optional(),
  EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  EXPO_PUBLIC_APP_ENV: z
    .enum(['development', 'preview', 'production'])
    .optional(),
  EXPO_PUBLIC_FIREBASE_API_KEY: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  EXPO_PUBLIC_ATLAS_APP_ID: z.preprocess(
    emptyToUndefined,
    z.string().uuid().optional(),
  ),
});

export type BarklogClientEnv = z.infer<typeof clientEnvSchema>;

type ClientEnvParseResult =
  | {
      ok: true;
      value: BarklogClientEnv;
    }
  | {
      ok: false;
      issues: string[];
    };

let cachedClientEnv: ClientEnvParseResult | null = null;

function collectClientEnv() {
  return {
    EXPO_PUBLIC_REVENUECAT_IOS_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY:
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    EXPO_PUBLIC_MIXPANEL_TOKEN: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_ATLAS_APP_ID: process.env.EXPO_PUBLIC_ATLAS_APP_ID,
  };
}

export function readClientEnv(): ClientEnvParseResult {
  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const parsed = clientEnvSchema.safeParse(collectClientEnv());

  if (parsed.success) {
    cachedClientEnv = {
      ok: true,
      value: parsed.data,
    };

    return cachedClientEnv;
  }

  cachedClientEnv = {
    ok: false,
    issues: parsed.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    ),
  };

  return cachedClientEnv;
}

export function getRequiredClientEnv(): BarklogClientEnv {
  const parsed = readClientEnv();

  if (!parsed.ok) {
    throw new Error(
      `Missing or invalid BarkLog client environment: ${parsed.issues.join('; ')}`,
    );
  }

  return parsed.value;
}

export function resetClientEnvCache() {
  cachedClientEnv = null;
}
