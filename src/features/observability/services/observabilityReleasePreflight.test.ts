/* eslint-disable @typescript-eslint/no-var-requires, global-require, no-underscore-dangle */
import type * as AnalyticsService from '@/features/observability/services/analyticsService';
import type * as CrashReportingService from '@/features/observability/services/crashReportingService';
import type * as TelemetryPrivacy from '@/features/observability/services/telemetryPrivacy';

const mockReadClientEnv = jest.fn();
const mockExpoConstants = {
  expoConfig: {
    name: 'BarkLog',
    slug: 'bark-log',
    version: '1.0.0',
  },
  manifest2: null,
  nativeAppVersion: '1.0.0',
};

jest.mock('@/utils/clientEnv', () => ({
  readClientEnv: () => mockReadClientEnv(),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: mockExpoConstants,
}));

jest.mock(
  'expo-constants/build/Constants',
  () => ({
    __esModule: true,
    default: mockExpoConstants,
  }),
  { virtual: true },
);

jest.mock(
  'expo/virtual/env',
  () => ({
    env: process.env,
  }),
  { virtual: true },
);

jest.mock('react-native', () => ({
  AppState: { addEventListener: jest.fn() },
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-session-id' }));
jest.mock('react-native-mmkv', () => ({ createMMKV: jest.fn() }));

const { trackBarklogEvent } =
  require('@/features/observability/services/analyticsService') as typeof AnalyticsService;
const { captureBarklogError } =
  require('@/features/observability/services/crashReportingService') as typeof CrashReportingService;
const { TELEMETRY_REDACTED_VALUE } =
  require('@/features/observability/services/telemetryPrivacy') as typeof TelemetryPrivacy;

describe('observability release preflight payloads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
    process.env.EXPO_PUBLIC_APP_ENV = 'preview';
    mockReadClientEnv.mockReturnValue({
      ok: true,
      value: {
        EXPO_PUBLIC_APP_ENV: 'preview',
        EXPO_PUBLIC_MIXPANEL_TOKEN: 'mixpanel-preview-token',
        EXPO_PUBLIC_SENTRY_DSN: 'https://public@sentry.example.invalid/42',
      },
    });
    global.fetch = jest.fn(async () => ({
      ok: true,
      text: async () => '{}',
    })) as jest.Mock;
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_APP_ENV;
  });

  it('sends release-critical Mixpanel events without raw caregiver text', async () => {
    await trackBarklogEvent('quick_log_saved', {
      dog_id: 'dog-123',
      event_type: 'poop',
      noteText: 'vomited twice after dinner',
      screen_name: '/(tabs)',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const firstFetchCall = jest.mocked(global.fetch).mock.calls[0]!;
    const request = firstFetchCall[1];
    const body = JSON.parse(String(request?.body)) as {
      event: string;
      properties: Record<string, unknown>;
    };

    expect(body.event).toBe('quick_log_saved');
    expect(body.properties).toMatchObject({
      app_version: '1.0.0',
      build_channel: 'preview',
      dog_id: 'dog-123',
      event_type: 'poop',
      noteText: TELEMETRY_REDACTED_VALUE,
      platform: 'ios',
      screen_name: '/(tabs)',
      token: 'mixpanel-preview-token',
    });
  });

  it('sends controlled Sentry errors without raw prompts or notes', async () => {
    captureBarklogError(new Error('prompt included raw notes'), {
      extra: {
        prompt: 'What illness is this?',
        screen_name: '/ask-barklog-ai',
      },
      level: 'warning',
      source: 'release_preflight_controlled_error',
      tags: {
        release_preflight: 'true',
      },
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const firstFetchCall = jest.mocked(global.fetch).mock.calls[0]!;
    const [url, request] = firstFetchCall;
    const envelope = String(request?.body);

    expect(url).toBe('https://sentry.example.invalid/api/42/envelope/');
    expect(envelope).toContain('"source":"release_preflight_controlled_error"');
    expect(envelope).toContain(`"prompt":"${TELEMETRY_REDACTED_VALUE}"`);
    expect(envelope).toContain(`"message":"${TELEMETRY_REDACTED_VALUE}"`);
    expect(envelope).not.toContain('What illness is this?');
    expect(envelope).not.toContain('prompt included raw notes');
  });
});
