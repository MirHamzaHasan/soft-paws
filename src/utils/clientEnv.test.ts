import { readClientEnv, resetClientEnvCache } from './clientEnv';

const keys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_ATLAS_APP_ID',
  'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
  'EXPO_PUBLIC_MIXPANEL_TOKEN',
  'EXPO_PUBLIC_GAMEANALYTICS_ANDROID_GAME_KEY',
  'EXPO_PUBLIC_GAMEANALYTICS_ANDROID_SECRET_KEY',
  'EXPO_PUBLIC_GAMEANALYTICS_IOS_GAME_KEY',
  'EXPO_PUBLIC_GAMEANALYTICS_IOS_SECRET_KEY',
  'EXPO_PUBLIC_SENTRY_DSN',
] as const;

describe('optional Firebase and Atlas public config', () => {
  const original = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );

  afterEach(() => {
    keys.forEach((key) => {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
    resetClientEnvCache();
  });

  it('treats empty example values as unconfigured', () => {
    keys.forEach((key) => {
      process.env[key] = '';
    });
    resetClientEnvCache();
    const result = readClientEnv();
    expect(result.ok).toBe(true);
    expect(
      result.ok ? result.value.EXPO_PUBLIC_ATLAS_APP_ID : null,
    ).toBeUndefined();
    expect(
      result.ok ? result.value.EXPO_PUBLIC_MIXPANEL_TOKEN : null,
    ).toBeUndefined();
    expect(
      result.ok ? result.value.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY : null,
    ).toBeUndefined();
  });
});
