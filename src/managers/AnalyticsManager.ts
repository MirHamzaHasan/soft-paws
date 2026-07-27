import {
  type BarklogAnalyticsEvent,
  identifyObservabilityUser,
  initializeObservability,
  queueBarklogEvent,
  trackScreenView,
} from '@/features/observability';

const AnalyticsManager = {
  flush: (): void => {},

  getProviderName: (): string => 'mixpanel-http',

  identify: (
    distinctId: string,
    properties?: Record<string, boolean | number | string | null>,
  ): void => {
    identifyObservabilityUser({
      id: distinctId,
      plan: properties?.plan ? String(properties.plan) : null,
    });
  },

  initialize: (): void => {
    initializeObservability();
  },

  reset: (): void => {
    identifyObservabilityUser(null);
  },

  screen: (
    name: string,
    properties?: Record<string, boolean | number | string | null>,
  ): void => {
    trackScreenView(name, properties);
  },

  track: (
    event: BarklogAnalyticsEvent,
    properties?: Record<string, boolean | number | string | null>,
  ): void => {
    queueBarklogEvent(event, properties);
  },
};

export default AnalyticsManager;
