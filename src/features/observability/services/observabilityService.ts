import {
  identifyAnalyticsUser,
  initializeAnalytics,
  resetAnalyticsUser,
} from './analyticsService';
import {
  initializeCrashReporting,
  installGlobalCrashHandlers,
  setCrashReportingUser,
} from './crashReportingService';

type ObservabilityUser = {
  email?: string | null;
  id: string;
  plan?: string | null;
};

let initialized = false;

export function initializeObservability() {
  if (initialized) {
    return;
  }

  initialized = true;
  initializeAnalytics();
  initializeCrashReporting();
  installGlobalCrashHandlers();
}

export function identifyObservabilityUser(user: ObservabilityUser | null) {
  if (!user) {
    resetAnalyticsUser();
    setCrashReportingUser(null);
    return;
  }

  identifyAnalyticsUser(user.id, {
    plan: user.plan ?? null,
  });
  setCrashReportingUser({
    email: user.email ?? null,
    id: user.id,
  });
}
