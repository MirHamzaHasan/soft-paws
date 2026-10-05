import { createMMKV } from 'react-native-mmkv';

import { resetClientEnvCache } from '@/utils/clientEnv';

import {
  signGameAnalyticsBody,
  startGameAnalyticsSession,
  trackGameAnalyticsEvent,
} from './gameAnalyticsService';

jest.mock('expo-crypto', () => ({
  randomUUID: () => '00000000-0000-4000-8000-000000000000',
}));
jest.mock('react-native', () => ({
  AppState: { addEventListener: jest.fn() },
  Platform: { OS: 'android', Version: 36 },
}));
jest.mock('react-native-mmkv', () => ({ createMMKV: jest.fn() }));

describe('GameAnalytics Collection API signing', () => {
  it('matches the published HMAC example', () => {
    expect(
      signGameAnalyticsBody(
        '{"test": "test"}',
        '16813a12f718bc5c620f56944e1abc3ea13ccbac',
      ),
    ).toBe('slnR8CKJtKtFDaESSrqnqQeUvp5FaVV7d5XHxt50N5A=');
  });

  it('starts a session and sends only fixed event names', async () => {
    jest.useFakeTimers();
    const values = new Map<string, string | number>();
    (createMMKV as jest.Mock).mockReturnValue({
      getNumber: (key: string) => values.get(key),
      getString: (key: string) => values.get(key),
      set: (key: string, value: string | number) => values.set(key, value),
    });
    const originalFetch = global.fetch;
    const originalKey = process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_GAME_KEY;
    const originalSecret =
      process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_SECRET_KEY;
    process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_GAME_KEY = 'test-game-key';
    process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_SECRET_KEY =
      'test-game-secret';
    resetClientEnvCache();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    try {
      startGameAnalyticsSession('local-owner-id', '1.0.0');
      trackGameAnalyticsEvent('quick_log_saved', {
        dog_id: 'never-send-this-id',
        event_type: 'walk',
      });
      await jest.advanceTimersByTimeAsync(20_000);

      const requests = (global.fetch as jest.Mock).mock.calls;
      const eventsRequest = requests.find(([url]) =>
        String(url).endsWith('/events'),
      );
      expect(eventsRequest).toBeDefined();
      const events = JSON.parse(eventsRequest?.[1].body) as Array<
        Record<string, unknown>
      >;
      expect(events.map((event) => event.category)).toEqual(['user', 'design']);
      expect(events[1]?.event_id).toBe('BarkLog:quick_log_saved:walk');
      expect(eventsRequest?.[1].body).not.toContain('local-owner-id');
      expect(eventsRequest?.[1].body).not.toContain('never-send-this-id');
    } finally {
      jest.clearAllTimers();
      jest.useRealTimers();
      global.fetch = originalFetch;
      if (originalKey === undefined)
        delete process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_GAME_KEY;
      else process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_GAME_KEY = originalKey;
      if (originalSecret === undefined)
        delete process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_SECRET_KEY;
      else
        process.env.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_SECRET_KEY =
          originalSecret;
      resetClientEnvCache();
    }
  });
});
