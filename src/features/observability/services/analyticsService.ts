import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { readClientEnv } from '@/utils/clientEnv';

import {
  startGameAnalyticsSession,
  stopGameAnalyticsSession,
  trackGameAnalyticsEvent,
} from './gameAnalyticsService';
import { sanitizeTelemetryProperties } from './telemetryPrivacy';

export type BarklogAnalyticsEvent =
  | 'ai_agent_locked'
  | 'ai_agent_opened'
  | 'ai_answered'
  | 'app_opened'
  | 'detail_log_failed'
  | 'detail_log_saved'
  | 'emergency_action_started'
  | 'export_completed'
  | 'export_failed'
  | 'export_started'
  | 'local_ai_model_download_failed'
  | 'local_ai_model_download_started'
  | 'local_ai_model_download_succeeded'
  | 'local_ai_model_removed'
  | 'onboarding_completed'
  | 'free_training_program_opened'
  | 'permission_result'
  | 'permission_requested'
  | 'premium_purchase_failed'
  | 'quick_log_failed'
  | 'quick_log_saved'
  | 'screen_viewed'
  | 'summary_generation_failed'
  | 'summary_generation_started'
  | 'summary_generation_succeeded'
  | 'training_premium_gate_opened'
  | 'toxicity_search_selected';

type AnalyticsProperties = Record<string, boolean | number | string | null>;

type AnalyticsState = {
  distinctId: string | null;
  initialized: boolean;
  token: string | null;
};

const analyticsState: AnalyticsState = {
  distinctId: null,
  initialized: false,
  token: null,
};

const anonymousDistinctId = `anonymous-${Math.random()
  .toString(36)
  .slice(2)}-${Date.now()}`;

function getAppVersion() {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    Constants.manifest2?.extra?.expoClient?.version ??
    'unknown'
  );
}

function getBaseProperties(): AnalyticsProperties {
  return {
    app_version: getAppVersion(),
    build_channel:
      process.env.EXPO_PUBLIC_APP_ENV ??
      (__DEV__ ? 'development' : 'production'),
    platform: Platform.OS,
  };
}

function getMixpanelHost() {
  return 'https://api.mixpanel.com/track?ip=1&verbose=1';
}

function getToken() {
  if (analyticsState.token) {
    return analyticsState.token;
  }

  const env = readClientEnv();

  if (env.ok) {
    analyticsState.token = env.value.EXPO_PUBLIC_MIXPANEL_TOKEN ?? null;
  }

  return analyticsState.token;
}

export async function trackBarklogEvent(
  event: BarklogAnalyticsEvent,
  properties: AnalyticsProperties = {},
) {
  const token = getToken();

  if (!token) {
    return;
  }

  const payload = {
    event,
    properties: {
      ...getBaseProperties(),
      ...sanitizeTelemetryProperties(properties),
      distinct_id: analyticsState.distinctId ?? anonymousDistinctId,
      time: Math.floor(Date.now() / 1000),
      token,
    },
  };

  try {
    await fetch(getMixpanelHost(), {
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // Analytics must never block logging, safety, or export flows.
  }
}

export function queueBarklogEvent(
  event: BarklogAnalyticsEvent,
  properties: AnalyticsProperties = {},
) {
  trackGameAnalyticsEvent(event, properties);
  trackBarklogEvent(event, properties).catch(() => undefined);
}

export function initializeAnalytics() {
  analyticsState.initialized = true;
  getToken();

  queueBarklogEvent('app_opened');
}

export function identifyAnalyticsUser(
  distinctId: string | null,
  properties: AnalyticsProperties = {},
) {
  analyticsState.distinctId = distinctId;

  if (distinctId) {
    startGameAnalyticsSession(distinctId, getAppVersion());
    queueBarklogEvent('app_opened', {
      ...properties,
      identified: true,
    });
  }
}

export function resetAnalyticsUser() {
  analyticsState.distinctId = null;
  stopGameAnalyticsSession();
}

export function trackScreenView(
  screenName: string,
  properties: AnalyticsProperties = {},
) {
  queueBarklogEvent('screen_viewed', {
    ...properties,
    screen_name: screenName,
  });
}
