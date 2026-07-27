import {
  captureBarklogError,
  captureBarklogMessage,
  identifyObservabilityUser,
  initializeObservability,
} from '@/features/observability';

const CrashReportingManager = {
  captureException: (error: unknown, source = 'manual_capture'): string =>
    captureBarklogError(error, { source }),

  captureMessage: (message: string, source = 'manual_capture'): void => {
    captureBarklogMessage(message, { source });
  },

  initialize: (): void => {
    initializeObservability();
  },

  resetUser: (): void => {
    identifyObservabilityUser(null);
  },

  setUser: (user: { email?: string | null; id: string }): void => {
    identifyObservabilityUser(user);
  },
};

export default CrashReportingManager;
